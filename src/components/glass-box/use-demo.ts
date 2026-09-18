"use client";

import { useCallback, useRef, useState } from "react";
import type { CandidateWire, Constraint, DemoEvent } from "@/lib/retrieve";

export type EmbedStage = { ms: number; dim: number; preview: number[] };
export type SearchStage = { ms: number; scanned: number; candidates: CandidateWire[] };
export type FilterStage = {
  ms: number;
  constraints: Constraint[];
  sql: string;
  evaluated: CandidateWire[];
  matches: CandidateWire[];
  passedTotal: number;
  cutCount: number;
};
export type ComposeStage = { ms: number; tokenCount: number };
export type DoneStage = {
  totalMs: number;
  pipelineMs: number;
  tokenCount: number;
  tokensPerSec: number;
};

export type DemoStatus = "idle" | "running" | "done" | "error";

export type DemoState = {
  status: DemoStatus;
  query: string;
  embed: EmbedStage | null;
  search: SearchStage | null;
  filter: FilterStage | null;
  compose: ComposeStage | null;
  done: DoneStage | null;
  answer: string;
  error: { kind: "rate-limit" | "invalid" | "server"; message: string } | null;
};

const EMPTY: DemoState = {
  status: "idle",
  query: "",
  embed: null,
  search: null,
  filter: null,
  compose: null,
  done: null,
  answer: "",
  error: null,
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isDemoEvent(value: unknown): value is DemoEvent {
  return typeof value === "object" && value !== null && "type" in value;
}

/**
 * Drives one run of the pipeline and folds the NDJSON event stream into
 * render state. One in-flight request at a time; a new run aborts the old.
 */
export function useDemo(): {
  state: DemoState;
  run: (query: string) => void;
  reset: () => void;
} {
  const [state, setState] = useState<DemoState>(EMPTY);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(EMPTY);
  }, []);

  const run = useCallback((query: string) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ ...EMPTY, status: "running", query: trimmed });

    const apply = (event: DemoEvent): void => {
      setState((previous) => {
        switch (event.type) {
          case "stage":
            switch (event.stage) {
              case "embed":
                return { ...previous, embed: { ms: event.ms, dim: event.dim, preview: event.preview } };
              case "search":
                return {
                  ...previous,
                  search: { ms: event.ms, scanned: event.scanned, candidates: event.candidates },
                };
              case "filter":
                return {
                  ...previous,
                  filter: {
                    ms: event.ms,
                    constraints: event.constraints,
                    sql: event.sql,
                    evaluated: event.evaluated,
                    matches: event.matches,
                    passedTotal: event.passedTotal,
                    cutCount: event.cutCount,
                  },
                };
              case "compose":
                return { ...previous, compose: { ms: event.ms, tokenCount: event.tokenCount } };
            }
            return previous;
          case "token":
            return { ...previous, answer: previous.answer + event.text };
          case "done":
            return { ...previous, status: "done", done: event };
          case "error":
            return {
              ...previous,
              status: "error",
              error: { kind: event.kind, message: event.message },
            };
        }
      });
    };

    const read = async (): Promise<void> => {
      try {
        const response = await fetch("/api/demo", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: trimmed, reducedMotion: prefersReducedMotion() }),
          signal: controller.signal,
        });

        const body = response.body;
        if (!body) throw new Error("no stream");

        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newline = buffer.indexOf("\n");
          while (newline !== -1) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (line.length > 0) {
              try {
                const parsed: unknown = JSON.parse(line);
                if (isDemoEvent(parsed)) apply(parsed);
              } catch {
                // A truncated line is simply skipped.
              }
            }
            newline = buffer.indexOf("\n");
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState((previous) => ({
          ...previous,
          status: "error",
          error: { kind: "server", message: "The demo endpoint could not be reached." },
        }));
      }
    };

    void read();
  }, []);

  return { state, run, reset };
}
