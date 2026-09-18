import { NextRequest } from "next/server";
import {
  runPipeline,
  tokenise,
  type DemoEvent,
} from "@/lib/retrieve";

/**
 * The Glass Box endpoint.
 *
 * Streams NDJSON: one JSON object per line. Stage events first (embed →
 * search → filter → compose), then answer tokens, then a done summary.
 *
 * There are no outbound network calls anywhere in this handler. Retrieval is
 * computed in-process with a local embedding over synthetic inventory.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 180;

/* ─────────────────────────── rate limit ─────────────────────────── */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;
const hits = new Map<string, number[]>();

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}

function rateLimited(key: string): boolean {
  const cutoff = Date.now() - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 500) {
    for (const [k, stamps] of hits) {
      if (stamps.every((t) => t <= cutoff)) hits.delete(k);
    }
  }

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return true;
  }
  recent.push(Date.now());
  hits.set(key, recent);
  return false;
}

/* ─────────────────────────── streaming ─────────────────────────── */

/** Deliberate pacing so each stage can be read. Compute itself is sub-ms. */
const STAGE_GAP_MS = 260;
const TOKEN_GAP_MS = 18;

function wait(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jsonLine(event: DemoEvent): string {
  return `${JSON.stringify(event)}\n`;
}

function errorStream(event: DemoEvent, status: number): Response {
  return new Response(jsonLine(event), {
    status,
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

type DemoRequestBody = {
  query?: unknown;
  reducedMotion?: unknown;
};

export async function POST(request: NextRequest): Promise<Response> {
  let body: DemoRequestBody;
  try {
    body = (await request.json()) as DemoRequestBody;
  } catch {
    return errorStream(
      { type: "error", kind: "invalid", message: "Expected a JSON body with a query field." },
      400,
    );
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const reducedMotion = body.reducedMotion === true;

  if (query.length === 0) {
    return errorStream(
      { type: "error", kind: "invalid", message: "Ask something about the inventory first." },
      400,
    );
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return errorStream(
      {
        type: "error",
        kind: "invalid",
        message: `Queries are capped at ${MAX_QUERY_LENGTH} characters in this demo.`,
      },
      400,
    );
  }

  if (rateLimited(clientKey(request))) {
    return errorStream(
      {
        type: "error",
        kind: "rate-limit",
        message: `Demo limit reached: ${MAX_REQUESTS} queries per 10 minutes. The pipeline is still there — it is just being polite to the server.`,
      },
      429,
    );
  }

  const started = Date.now();
  const result = runPipeline(query);
  const tokens = tokenise(result.answer);
  const gap = reducedMotion ? 0 : STAGE_GAP_MS;
  const tokenGap = reducedMotion ? 0 : TOKEN_GAP_MS;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: DemoEvent): void => {
        controller.enqueue(encoder.encode(jsonLine(event)));
      };

      try {
        await wait(gap * 0.5);
        send({
          type: "stage",
          stage: "embed",
          ms: result.timings.embedMs,
          dim: result.dim,
          preview: result.preview,
        });

        await wait(gap);
        send({
          type: "stage",
          stage: "search",
          ms: result.timings.searchMs,
          scanned: result.scanned,
          candidates: result.candidates,
        });

        await wait(gap);
        send({
          type: "stage",
          stage: "filter",
          ms: result.timings.filterMs,
          constraints: result.constraints,
          sql: result.sql,
          evaluated: result.evaluated,
          matches: result.matches,
          passedTotal: result.passedTotal,
          cutCount: result.cutCount,
        });

        await wait(gap);
        send({
          type: "stage",
          stage: "compose",
          ms: result.timings.composeMs,
          tokenCount: tokens.length,
        });

        const streamStart = Date.now();
        for (const text of tokens) {
          send({ type: "token", text });
          await wait(tokenGap);
        }
        const streamMs = Math.max(1, Date.now() - streamStart);

        const pipelineMs =
          result.timings.embedMs +
          result.timings.searchMs +
          result.timings.filterMs +
          result.timings.composeMs;

        send({
          type: "done",
          totalMs: Date.now() - started,
          pipelineMs: Math.round(pipelineMs * 1000) / 1000,
          tokenCount: tokens.length,
          tokensPerSec: Math.round((tokens.length / streamMs) * 1000),
        });
      } catch {
        send({ type: "error", kind: "server", message: "The pipeline stopped mid-run." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
