"use client";

import type { CandidateWire } from "@/lib/retrieve";
import type { DemoState } from "./use-demo";

function CarCard({ car }: { car: CandidateWire }) {
  return (
    <li className="border border-line bg-void p-3 transition-colors hover:border-line-bright">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-[13px] text-bone">
          <span className="font-mono text-faint">{car.year}</span>{" "}
          {car.make} {car.model}{" "}
          <span className="text-muted">{car.variant}</span>
        </p>
        <span className="shrink-0 font-mono text-[13px] tabular-nums text-signal">{car.price}</span>
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-faint">
        {car.km} · {car.fuel} · {car.transmission} · {car.owners} owner
        {car.owners === 1 ? "" : "s"} · {car.id}
      </p>
    </li>
  );
}

function StatusChip({ state }: { state: DemoState }) {
  if (state.status === "error") {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-warn">
        {state.error?.kind === "rate-limit" ? "Rate limited" : "Error"}
      </span>
    );
  }
  if (state.status === "running") {
    return (
      <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-signal">
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        Streaming
      </span>
    );
  }
  if (state.status === "done") {
    const count = state.filter?.passedTotal ?? 0;
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {count} {count === 1 ? "match" : "matches"}
      </span>
    );
  }
  return <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Idle</span>;
}

export function AnswerPane({ state }: { state: DemoState }) {
  const matches = state.filter?.matches ?? [];
  const streaming = state.status === "running";

  return (
    <div className="flex h-full flex-col border border-line bg-surface">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="label">01 · Answer</span>
        <StatusChip state={state} />
      </header>

      <div className="flex-1 p-4 sm:p-5">
        {state.status === "idle" ? (
          <div className="flex h-full min-h-[220px] flex-col justify-center gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              No query yet
            </p>
            <p className="max-w-sm text-[13px] leading-relaxed text-muted">
              Pick one of the example queries, or write your own. Every stage in the
              machinery panel is computed from your question when you press Run.
            </p>
          </div>
        ) : (
          <>
            <p className="flex gap-2 border-b border-line pb-3 font-mono text-[12px] leading-6 text-muted">
              <span aria-hidden className="text-signal">
                &gt;
              </span>
              <span className="min-w-0 break-words">{state.query}</span>
            </p>

            {state.error ? (
              <div className="mt-4 border border-warn/40 bg-void p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-warn">
                  {state.error.kind === "rate-limit"
                    ? "429 · demo limit"
                    : state.error.kind === "invalid"
                      ? "400 · rejected"
                      : "500 · pipeline"}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{state.error.message}</p>
              </div>
            ) : (
              <>
                <p
                  aria-live="polite"
                  className="mt-4 min-h-[5.5rem] text-[14px] leading-[1.75] text-bone text-pretty"
                >
                  {state.answer}
                  {streaming ? (
                    <span
                      aria-hidden
                      className="ml-0.5 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.15em] bg-signal"
                      style={{ animation: "glassbox-caret 1s steps(2, start) infinite" }}
                    />
                  ) : null}
                </p>

                {matches.length > 0 ? (
                  <>
                    <p className="label mt-6">Retrieved rows</p>
                    <ul className="mt-3 grid gap-2">
                      {matches.map((car) => (
                        <CarCard key={car.id} car={car} />
                      ))}
                    </ul>
                  </>
                ) : null}

                {state.filter && matches.length === 0 ? (
                  <div className="mt-6 border border-line bg-void p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-warn">
                      Zero rows returned
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">
                      The filter rejected every candidate. That is the correct answer, not a
                      failure — an approximate match on a hard constraint would be a worse one.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes glassbox-caret { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`}</style>
    </div>
  );
}
