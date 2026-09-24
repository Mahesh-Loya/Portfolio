"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

type LivePanelProps = {
  /** A deployed site verified to render inside an iframe. */
  url: string;
  /** The still shown before anything external is fetched. */
  poster?: { src: string; alt: string };
  /** Human name of the site — used in labels and the iframe title. */
  title: string;
  note?: string;
  className?: string;
};

/**
 * idle    — nothing external in the DOM. The poster, and an invitation.
 * loading — iframe mounted, waiting on `load`.
 * inert   — the real site is up, but sealed behind an overlay so a passing
 *           scroll is never captured by it.
 * live    — pointer events handed to the site. Released on Escape, on the
 *           Release control, or on a click anywhere outside the panel.
 * failed  — `load` never fired. The frame is never left blank.
 */
type Phase = "idle" | "loading" | "inert" | "live" | "failed";

/** Long enough for a cold serverless start, short enough not to feel abandoned. */
const LOAD_TIMEOUT_MS = 12_000;

/** Matches Tailwind's `md`. Below it, a desktop site in a box is unusable. */
const DESKTOP_QUERY = "(min-width: 768px)";

const SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      width="10"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="square"
      className="shrink-0"
    >
      <path d="M4.5 1.5H10.5V7.5" />
      <path d="M10.5 1.5L5 7" />
      <path d="M9 7.5v3h-7.5V3h3" />
    </svg>
  );
}

/**
 * A real deployed site, running inside the portfolio.
 *
 * The frame is instrumentation around a running system rather than a browser
 * mockup: a hairline chrome bar carrying the hostname and the current state,
 * corner brackets, and nothing that pretends to be an address bar.
 *
 * Three rules hold the whole thing together:
 *   1. Nothing external is fetched until the visitor asks. Three of these on a
 *      page would otherwise decide the LCP for everyone who never clicks.
 *   2. A loaded site stays inert until it is explicitly engaged, so scrolling
 *      past one never hands your scroll to someone else's page.
 *   3. Release is always one Escape, one button, or one outside click away.
 */
export function LivePanel({ url, poster, title, note, className }: LivePanelProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");

  const reduced = useReducedMotion();
  const still = Boolean(reduced);

  const panelRef = useRef<HTMLDivElement>(null);
  const activateRef = useRef<HTMLButtonElement>(null);
  const releaseRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | null>(null);
  /** Which control should take focus after the next phase commit. */
  const refocusRef = useRef<"activate" | "release" | null>(null);

  const host = hostnameOf(url);
  const labelId = useId();

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const load = useCallback(() => {
    clearTimer();
    setPhase("loading");
    setStatus(`Loading ${host} inside the panel.`);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setPhase("failed");
      setStatus(`${host} could not be embedded. It can be opened in a new tab instead.`);
    }, LOAD_TIMEOUT_MS);
  }, [clearTimer, host]);

  const handleFrameLoad = useCallback(() => {
    clearTimer();
    setPhase((current) => (current === "loading" || current === "failed" ? "inert" : current));
    setStatus(`${host} is loaded and ready. Activate the panel to interact with it.`);
  }, [clearTimer, host]);

  const engage = useCallback(() => {
    refocusRef.current = "release";
    setPhase((current) => (current === "inert" ? "live" : current));
    setStatus(
      `${host} is now interactive. Press Escape, choose Release, or click outside the panel to hand control back to the page.`,
    );
  }, [host]);

  const release = useCallback(
    (refocus: boolean) => {
      refocusRef.current = refocus ? "activate" : null;
      setPhase((current) => (current === "live" ? "inert" : current));
      setStatus(`Control returned to the page. ${host} is still loaded.`);
    },
    [host],
  );

  // Escape, and any click that lands outside the panel, give the page back.
  useEffect(() => {
    if (phase !== "live") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") release(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && panelRef.current?.contains(target)) return;
      release(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [phase, release]);

  // Keyboard users must never lose their place across a state change.
  useEffect(() => {
    const target = refocusRef.current;
    if (!target) return;
    refocusRef.current = null;
    const node = target === "release" ? releaseRef.current : activateRef.current;
    node?.focus();
  }, [phase]);

  // A viewport that drops below `md` unloads the embed entirely rather than
  // leaving a desktop layout trapped in a phone-width box.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const sync = () => {
      if (query.matches) return;
      clearTimer();
      refocusRef.current = null;
      setPhase("idle");
      setStatus("");
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const mounted = phase !== "idle";
  const showPoster = phase === "idle" || phase === "loading" || phase === "failed";

  const badge =
    phase === "live" ? (
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-signal uppercase">
        <motion.span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-signal"
          animate={still ? undefined : { opacity: [1, 0.2, 1] }}
          transition={still ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        Live — interactive
      </span>
    ) : (
      <span className="font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase">
        {phase === "idle"
          ? "Not loaded"
          : phase === "loading"
            ? "Loading"
            : phase === "failed"
              ? "Blocked"
              : "Ready"}
      </span>
    );

  return (
    <div className={`w-full ${className ?? ""}`} data-reveal>
      <div
        ref={panelRef}
        role="group"
        aria-labelledby={labelId}
        className="glass-panel bracketed relative rounded-md"
      >
        <span id={labelId} className="sr-only">
          {`Live embed of ${title}`}
        </span>

        {/* Chrome. Origin, state, and a way out — no fake address bar. */}
        <div className="flex items-center gap-3 rounded-t-md border-b border-line px-3 py-2 sm:px-3.5">
          <span className="min-w-0 truncate font-mono text-[0.6875rem] text-muted">{host}</span>

          <span className="ml-auto flex shrink-0 items-center gap-3">
            {badge}

            {phase === "live" ? (
              <button
                ref={releaseRef}
                type="button"
                onClick={() => release(true)}
                className="rounded-sm border border-line-bright px-2 py-1 font-mono text-[0.625rem] tracking-[0.12em] text-bone uppercase transition-colors hover:border-signal hover:text-signal"
              >
                Release
              </button>
            ) : null}

            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.12em] text-faint uppercase transition-colors hover:text-signal"
            >
              Open in new tab
              <ExternalIcon />
            </a>
          </span>
        </div>

        {/* Viewport. */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-b-md bg-void">
          {showPoster ? (
            poster ? (
              <Image
                src={poster.src}
                alt={poster.alt}
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover object-top"
              />
            ) : (
              <div
                aria-hidden="true"
                className="gridlines absolute inset-0 flex items-center justify-center bg-surface"
              >
                <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-faint uppercase">
                  {host}
                </span>
              </div>
            )
          ) : null}

          {mounted ? (
            <iframe
              src={url}
              title={`${title} — live site embedded from ${host}`}
              onLoad={handleFrameLoad}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox={SANDBOX}
              className={`absolute inset-0 h-full w-full border-0 bg-void ${
                phase === "live" ? "" : "pointer-events-none"
              }`}
            />
          ) : null}

          {/* State 1 — idle. */}
          {phase === "idle" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void/70 p-6 text-center">
              <span className="label">Live site</span>

              <button
                ref={activateRef}
                type="button"
                onClick={load}
                className="hidden rounded-sm border border-signal px-4 py-2 font-mono text-[0.6875rem] tracking-[0.14em] text-signal uppercase transition-colors hover:bg-signal hover:text-void md:inline-flex"
              >
                Load live site
              </button>

              <a
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-sm border border-signal px-4 py-2 font-mono text-[0.6875rem] tracking-[0.14em] text-signal uppercase transition-colors hover:bg-signal hover:text-void md:hidden"
              >
                Open the live site
                <ExternalIcon />
              </a>

              <span className="hidden max-w-[36ch] font-mono text-[0.6875rem] leading-relaxed text-pretty text-faint md:block">
                Nothing loads from {host} until you ask.
              </span>
              <span className="max-w-[32ch] font-mono text-[0.6875rem] leading-relaxed text-pretty text-faint md:hidden">
                Embedded interaction needs a wider screen — this opens in a new tab.
              </span>
            </div>
          ) : null}

          {/* Between idle and inert. */}
          {phase === "loading" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-void/80 p-6 text-center">
              <span className="flex items-center gap-1.5" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1 w-1 rounded-full bg-signal"
                    animate={still ? undefined : { opacity: [0.2, 1, 0.2] }}
                    transition={
                      still
                        ? undefined
                        : { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.16 }
                    }
                  />
                ))}
              </span>
              <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted uppercase">
                Loading {host}
              </span>
            </div>
          ) : null}

          {/* State 2 — loaded, sealed. The seal is the whole point. */}
          {phase === "inert" ? (
            <button
              ref={activateRef}
              type="button"
              onClick={engage}
              aria-label={`Interact with the live ${title} site. Press Escape to release it afterwards.`}
              className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-void/25 transition-colors hover:bg-void/10 focus-visible:bg-void/10"
            >
              <span className="glass inline-flex items-center gap-2 rounded-sm px-3.5 py-2 font-mono text-[0.6875rem] tracking-[0.14em] text-bone uppercase transition-colors group-hover:text-signal group-focus-visible:text-signal">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
                Click to interact
              </span>
            </button>
          ) : null}

          {/* State 3 — live. Only a hint sits on top; every pixel is the site's. */}
          {phase === "live" ? (
            <span
              aria-hidden="true"
              className="glass pointer-events-none absolute right-3 bottom-3 rounded-sm px-2.5 py-1.5 font-mono text-[0.625rem] tracking-[0.12em] text-muted uppercase"
            >
              Esc or click outside to release
            </span>
          ) : null}

          {/* Never a blank frame. */}
          {phase === "failed" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void/85 p-6 text-center">
              <span className="max-w-[40ch] text-sm leading-relaxed text-pretty text-muted">
                This site refused to run inside the panel. It is live — it just will not be framed.
              </span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-sm border border-signal px-4 py-2 font-mono text-[0.6875rem] tracking-[0.14em] text-signal uppercase transition-colors hover:bg-signal hover:text-void"
              >
                Open in a new tab
                <ExternalIcon />
              </a>
            </div>
          ) : null}
        </div>
      </div>

      {note ? (
        <p className="mt-3 max-w-[62ch] font-mono text-[0.6875rem] leading-relaxed text-pretty text-faint">
          {note}
        </p>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}

export default LivePanel;
