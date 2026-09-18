"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Constraint } from "@/lib/retrieve";
import { FilterRow, FilterSummary, ScoreRow } from "./retrieval-row";
import type { DemoState } from "./use-demo";

function ms(value: number | undefined): string {
  if (value === undefined) return "—";
  return `${value.toFixed(2)} ms`;
}

function Stage({
  index,
  name,
  detail,
  timing,
  ready,
  children,
}: {
  index: string;
  name: string;
  detail: string;
  timing?: number;
  ready: boolean;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line last:border-b-0" aria-busy={!ready}>
      <header className="flex items-baseline justify-between gap-4 px-4 pt-4 sm:px-5">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-mono text-[11px] tabular-nums text-faint">{index}</span>
          <span
            className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
              ready ? "text-bone" : "text-faint"
            }`}
          >
            {name}
          </span>
        </div>
        <span
          className={`shrink-0 font-mono text-[11px] tabular-nums ${
            ready ? "text-signal" : "text-faint"
          }`}
        >
          {ms(timing)}
        </span>
      </header>
      <p className="px-4 pt-1 font-mono text-[11px] leading-5 text-faint sm:px-5">{detail}</p>
      <div className="px-4 pb-5 pt-3 sm:px-5">
        {ready ? (
          children
        ) : (
          <div className="h-px w-full bg-line" />
        )}
      </div>
    </section>
  );
}

/** The query vector, folded to 32 columns and drawn signed around the axis. */
function VectorBars({ preview, dim }: { preview: number[]; dim: number }) {
  const [grown, setGrown] = useState(false);
  const peak = Math.max(...preview.map((value) => Math.abs(value)), 0.0001);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div>
      <div className="relative flex h-16 items-center gap-[2px] border-y border-line py-1">
        <div aria-hidden className="absolute left-0 right-0 top-1/2 h-px bg-line" />
        {preview.map((value, i) => {
          const height = Math.max(1, Math.round((Math.abs(value) / peak) * 26));
          const positive = value >= 0;
          return (
            <div key={i} className="relative h-full flex-1">
              <div
                className={positive ? "absolute bottom-1/2 w-full bg-signal/70" : "absolute top-1/2 w-full bg-line-bright"}
                style={{
                  height: grown ? `${height}px` : "0px",
                  transition: "height 460ms var(--ease-out-expo)",
                  transitionDelay: `${i * 10}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[11px] text-faint">
        all {dim} components folded into {preview.length} columns · signed peak per slice ·
        positive above the axis
      </p>
    </div>
  );
}

const SQL_PATTERN = /(SELECT|FROM|WHERE|AND|OR|ORDER BY|LIMIT|TRUE)|('[^']*')|(\$\d+)|(\d+)/g;

function SqlBlock({ sql }: { sql: string }) {
  const parts: ReactNode[] = [];
  const regex = new RegExp(SQL_PATTERN.source, "g");
  let cursor = 0;
  let key = 0;
  let match = regex.exec(sql);

  while (match !== null) {
    if (match.index > cursor) parts.push(sql.slice(cursor, match.index));
    const [full, keyword, literal, param] = match;
    const className = keyword
      ? "text-faint"
      : literal
        ? "text-ok"
        : param
          ? "text-muted"
          : "text-signal";
    parts.push(
      <span key={`sql-${key}`} className={className}>
        {full}
      </span>,
    );
    key += 1;
    cursor = match.index + full.length;
    match = regex.exec(sql);
  }
  parts.push(sql.slice(cursor));

  return (
    <pre className="overflow-x-auto border border-line bg-void p-3 font-mono text-[11px] leading-[1.7] text-bone">
      <code>{parts}</code>
    </pre>
  );
}

function ConstraintChips({ constraints }: { constraints: Constraint[] }) {
  if (constraints.length === 0) {
    return (
      <p className="font-mono text-[11px] leading-5 text-faint">
        No hard constraints in this query — nothing to enforce, so meaning decides alone.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {constraints.map((constraint) => (
        <li
          key={constraint.sql}
          className="border border-line-bright bg-void px-2.5 py-1 font-mono text-[11px] text-bone"
        >
          {constraint.label}
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-void px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</p>
      <p className="mt-1 font-mono text-[13px] tabular-nums text-bone">{value}</p>
    </div>
  );
}

export function MachineryPane({ state }: { state: DemoState }) {
  const { embed, search, filter, compose, done } = state;
  const best = search?.candidates[0]?.score ?? 0;
  const kept = filter ? filter.evaluated.filter((c) => c.passed).length : 0;

  return (
    <div className="flex h-full flex-col border border-line bg-surface">
      <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
        <span className="label">02 · Machinery</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          {done ? `${done.totalMs} ms end to end` : "4 stages"}
        </span>
      </header>

      <Stage
        index="01"
        name="Embed"
        detail="Query → vector. Character trigrams and word tokens, signed-hashed and L2-normalised."
        timing={embed?.ms}
        ready={embed !== null}
      >
        {embed ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="border border-line-bright bg-void px-2.5 py-1 font-mono text-[11px] text-bone">
                {embed.dim}-dim
              </span>
              <span className="border border-line bg-void px-2.5 py-1 font-mono text-[11px] text-muted">
                ‖v‖ = 1.000
              </span>
            </div>
            <VectorBars preview={embed.preview} dim={embed.dim} />
          </div>
        ) : null}
      </Stage>

      <Stage
        index="02"
        name="Semantic search"
        detail={
          search
            ? `Cosine similarity against all ${search.scanned} rows. Nearest ${search.candidates.length}, best first.`
            : "Cosine similarity against every inventory row."
        }
        timing={search?.ms}
        ready={search !== null}
      >
        {search ? (
          <div className="divide-y divide-line">
            {search.candidates.map((candidate, i) => (
              <ScoreRow key={candidate.id} candidate={candidate} best={best} index={i} />
            ))}
          </div>
        ) : null}
      </Stage>

      <Stage
        index="03"
        name="Constraint filter"
        detail="Numbers parsed from the query become exact SQL predicates. Close is not good enough."
        timing={filter?.ms}
        ready={filter !== null}
      >
        {filter ? (
          <div className="space-y-4">
            <ConstraintChips constraints={filter.constraints} />
            <SqlBlock sql={filter.sql} />
            <FilterSummary
              kept={kept}
              cut={filter.cutCount}
              passedTotal={filter.passedTotal}
              scanned={search?.scanned ?? 0}
            />
            <div className="border-t border-line">
              {filter.evaluated.map((candidate, i) => (
                <FilterRow key={candidate.id} candidate={candidate} index={i} />
              ))}
            </div>
            {filter.cutCount > 0 ? (
              <p className="border-l-2 border-warn pl-3 text-[13px] leading-relaxed text-muted">
                Struck rows scored high on meaning and still failed the arithmetic. This is the
                difference between a vector database and an answer you can trust with a price.
              </p>
            ) : null}
          </div>
        ) : null}
      </Stage>

      <Stage
        index="04"
        name="Compose"
        detail="A deterministic builder writes the answer from the surviving rows, then streams it."
        timing={compose?.ms}
        ready={compose !== null}
      >
        {compose ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Tokens" value={String(compose.tokenCount)} />
            <Stat label="Tokens/sec" value={done ? String(done.tokensPerSec) : "…"} />
            <Stat
              label="Pipeline"
              value={done ? `${done.pipelineMs.toFixed(2)} ms` : "…"}
            />
            <Stat label="End to end" value={done ? `${done.totalMs} ms` : "…"} />
          </div>
        ) : null}
      </Stage>
    </div>
  );
}
