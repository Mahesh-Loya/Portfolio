"use client";

import { useEffect, useState } from "react";
import type { CandidateWire } from "@/lib/retrieve";

/** One nearest-neighbour row: rank, label, cosine score, similarity bar. */
export function ScoreRow({
  candidate,
  best,
  index,
}: {
  candidate: CandidateWire;
  best: number;
  index: number;
}) {
  const [grown, setGrown] = useState(false);
  const width = best > 0 ? Math.max(4, Math.round((candidate.score / best) * 100)) : 0;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="grid grid-cols-[1.75rem_1fr_3.25rem] items-center gap-3 py-1.5">
      <span className="font-mono text-[11px] text-faint">
        {String(candidate.rank).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="truncate font-mono text-[11px] text-bone">{candidate.label}</p>
        <div className="mt-1 h-[3px] w-full bg-line">
          <div
            className={index === 0 ? "h-full bg-signal" : "h-full bg-line-bright"}
            style={{
              width: grown ? `${width}%` : "0%",
              transition: "width 520ms var(--ease-out-expo)",
              transitionDelay: `${index * 45}ms`,
            }}
          />
        </div>
      </div>
      <span className="text-right font-mono text-[11px] tabular-nums text-muted">
        {candidate.score.toFixed(3)}
      </span>
    </div>
  );
}

/**
 * The instructive row. A candidate that cleared every predicate is kept; one
 * that did not is struck through, with the exact arithmetic that killed it.
 */
export function FilterRow({
  candidate,
  index,
}: {
  candidate: CandidateWire;
  index: number;
}) {
  const [struck, setStruck] = useState(false);

  useEffect(() => {
    if (candidate.passed) return;
    const timer = window.setTimeout(() => setStruck(true), 140 + index * 90);
    return () => window.clearTimeout(timer);
  }, [candidate.passed, index]);

  const cut = !candidate.passed;

  return (
    <div className="grid grid-cols-[1.75rem_1rem_1fr] items-start gap-3 border-b border-line py-2 last:border-b-0">
      <span className="font-mono text-[11px] leading-5 tabular-nums text-faint">
        {String(candidate.rank).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        className={`font-mono text-[11px] leading-5 ${cut ? "text-warn" : "text-ok"}`}
      >
        {cut ? "✗" : "✓"}
      </span>

      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <span className="relative min-w-0">
            <span
              className={`block truncate font-mono text-[11px] leading-5 transition-colors duration-500 ${
                cut ? "text-faint" : "text-bone"
              }`}
            >
              {candidate.label}
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-1/2 h-px w-full origin-left bg-warn"
              style={{
                transform: `scaleX(${struck ? 1 : 0})`,
                transition: "transform 560ms var(--ease-signal)",
              }}
            />
          </span>
          <span
            className={`shrink-0 font-mono text-[11px] tabular-nums ${cut ? "text-faint" : "text-muted"}`}
          >
            {candidate.score.toFixed(3)}
          </span>
        </div>

        {cut ? (
          <ul className="mt-0.5 space-y-0.5">
            {candidate.failures.map((failure) => (
              <li key={failure} className="font-mono text-[11px] leading-5 text-warn">
                <span aria-hidden>{"✗ "}</span>
                {failure}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-0.5 font-mono text-[11px] leading-5 text-faint">
            {candidate.price} · {candidate.km} · {candidate.fuel} · {candidate.transmission}
          </p>
        )}
      </div>
    </div>
  );
}

/** Screen-reader-friendly summary of what the filter did. */
export function FilterSummary({
  kept,
  cut,
  passedTotal,
  scanned,
}: {
  kept: number;
  cut: number;
  passedTotal: number;
  scanned: number;
}) {
  return (
    <p className="font-mono text-[11px] leading-5 text-faint">
      <span className="text-ok">{kept} kept</span> · <span className="text-warn">{cut} cut</span> ·{" "}
      <span className="text-muted">{passedTotal}</span> of {scanned} rows in the table satisfy every
      predicate
    </p>
  );
}
