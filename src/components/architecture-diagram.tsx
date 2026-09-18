"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CaseStudy } from "@/content/site";

type Pipeline = CaseStudy["pipeline"];

/** How long autoplay rests on a stage before advancing. */
const DWELL_MS = 4400;

/**
 * Component-scoped keyframes. Kept here rather than in globals.css so the
 * diagram stays self-contained; the global prefers-reduced-motion block
 * already neutralises every animation declared this way.
 */
const KEYFRAMES = `
@keyframes ad-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -48; } }
.ad-flow { animation: ad-flow 1.6s linear infinite; }
@keyframes ad-dwell { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.ad-dwell { animation: ad-dwell var(--ad-dwell, 4400ms) linear forwards; transform-origin: left center; }
`;

function pad(n: number) {
  return String(n + 1).padStart(2, "0");
}

type ConnectorState = "done" | "live" | "idle";

/**
 * Hairline connector drawn as real SVG so flow can travel along the path.
 * Two orientations are rendered and swapped by breakpoint — one stretched
 * path would distort the dash pattern.
 */
function Connector({ state }: { state: ConnectorState }) {
  const overlay =
    state === "live"
      ? "stroke-signal ad-flow"
      : state === "done"
        ? "stroke-signal opacity-50"
        : "stroke-transparent";

  return (
    <div aria-hidden="true" className="flex shrink-0 items-center justify-center text-line-bright">
      {/* vertical — mobile */}
      <svg viewBox="0 0 8 40" className="h-7 w-2 md:hidden" fill="none">
        <path d="M4 0 V40" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path
          d="M0.5 35 L4 39.5 L7.5 35"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M4 0 V40"
          className={overlay}
          strokeWidth="1.5"
          strokeDasharray="6 42"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* horizontal — desktop */}
      <svg viewBox="0 0 48 8" className="hidden h-2 w-6 md:block lg:w-9" fill="none">
        <path d="M0 4 H48" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path
          d="M43 0.5 L47.5 4 L43 7.5"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 4 H48"
          className={overlay}
          strokeWidth="1.5"
          strokeDasharray="6 42"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export function ArchitectureDiagram({
  pipeline,
  className,
}: {
  pipeline: Pipeline;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const count = pipeline.length;

  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [motionOk, setMotionOk] = useState(false);
  /** Once the reader drives the diagram, autoplay never takes the wheel back. */
  const [tookOver, setTookOver] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => setInView(Boolean(entries[0]?.isIntersecting)),
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const autoplaying = motionOk && inView && !tookOver && !hovered && !focused && count > 1;

  useEffect(() => {
    if (!autoplaying) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % count), DWELL_MS);
    return () => window.clearTimeout(t);
  }, [autoplaying, active, count]);

  const select = useCallback(
    (index: number, moveFocus = false) => {
      if (count === 0) return;
      const next = ((index % count) + count) % count;
      setTookOver(true);
      setActive(next);
      if (moveFocus) tabRefs.current[next]?.focus();
    },
    [count],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") select(0, true);
    else if (event.key === "End") select(count - 1, true);
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") select(active + 1, true);
    else select(active - 1, true);
  };

  if (count === 0) return null;

  const stage = pipeline[Math.min(active, count - 1)];
  if (!stage) return null;

  return (
    <div
      ref={rootRef}
      className={`relative ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      <style>{KEYFRAMES}</style>

      <div className="relative overflow-hidden border border-line bg-surface">
        <div aria-hidden="true" className="gridlines pointer-events-none absolute inset-0 opacity-50" />

        {/* ── stage rail ────────────────────────────────────────────── */}
        <div className="relative border-b border-line px-4 py-6 md:px-6 md:py-8">
          <div
            role="tablist"
            aria-label="Architecture stages"
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="flex flex-col items-stretch md:flex-row"
          >
            {pipeline.map((s, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <div key={s.id} role="presentation" className="contents">
                  <button
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${s.id}`}
                    aria-selected={isActive}
                    aria-controls={`${uid}-panel`}
                    aria-current={isActive ? "step" : undefined}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => select(i)}
                    className={[
                      "relative min-w-0 flex-1 border px-3 py-3 text-left transition-colors duration-300 md:min-h-[5.75rem]",
                      isActive
                        ? "border-signal bg-raised text-bone"
                        : isDone
                          ? "border-line-bright bg-void/40 text-muted hover:text-bone"
                          : "border-line bg-void/40 text-faint hover:border-line-bright hover:text-muted",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] tracking-[0.16em] ${
                          isActive ? "text-signal" : ""
                        }`}
                      >
                        {pad(i)}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-px flex-1 ${isActive ? "bg-signal/50" : "bg-line-bright"}`}
                      />
                    </span>
                    <span className="mt-2.5 block text-[13px] leading-snug tracking-tight">
                      {s.label}
                    </span>
                    <span className="mt-1.5 block font-mono text-[10px] leading-tight text-faint">
                      {s.tech}
                    </span>
                  </button>

                  {i < count - 1 ? (
                    <Connector state={isActive ? "live" : isDone ? "done" : "idle"} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── detail panel ──────────────────────────────────────────── */}
        <div className="relative">
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-6">
            <p className="label">
              Stage {pad(active)} <span className="text-line-bright">/</span> {pad(count - 1)}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => select(active - 1)}
                disabled={active === 0}
                aria-label="Previous stage"
                className="flex h-7 w-7 items-center justify-center border border-line font-mono text-xs text-muted transition-colors hover:border-line-bright hover:text-bone disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-muted"
              >
                &#8592;
              </button>
              <button
                type="button"
                onClick={() => select(active + 1)}
                disabled={active === count - 1}
                aria-label="Next stage"
                className="flex h-7 w-7 items-center justify-center border border-line font-mono text-xs text-muted transition-colors hover:border-line-bright hover:text-bone disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-muted"
              >
                &#8594;
              </button>
            </div>
          </div>

          {/* autoplay dwell — a hairline, not a progress bar */}
          <div aria-hidden="true" className="h-px w-full">
            {autoplaying ? (
              <span
                key={`${active}-dwell`}
                className="ad-dwell block h-px bg-signal/45"
                style={{ "--ad-dwell": `${DWELL_MS}ms` } as React.CSSProperties}
              />
            ) : null}
          </div>

          <div
            role="tabpanel"
            id={`${uid}-panel`}
            aria-labelledby={`${uid}-tab-${stage.id}`}
            tabIndex={0}
            className="grid gap-4 px-4 py-6 md:grid-cols-[minmax(0,13rem)_1fr] md:gap-10 md:px-6 md:py-8"
          >
            <div>
              <h3 className="text-base tracking-tight text-bone">{stage.label}</h3>
              <p className="mt-2 inline-block border border-line-bright px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-signal">
                {stage.tech}
              </p>
            </div>
            <p className="max-w-[60ch] text-[15px] leading-relaxed text-muted md:text-base">
              {stage.detail}
            </p>
          </div>
        </div>
      </div>

      <p className="label mt-3">Arrow keys to step &#183; click any stage</p>
    </div>
  );
}
