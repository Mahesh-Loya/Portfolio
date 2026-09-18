"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { signalPairs } from "@/content/site";

/** Glyphs the noisy side degrades into before it settles. */
const GLYPHS = "01<>/\\|-_=+*#%~^:;.";

const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** Same length as the source, so the row never reflows mid-resolve. */
function corrupt(text: string, settled: number): string {
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    out += i < settled || char === " " ? char : glyph();
  }
  return out;
}

/**
 * Text that arrives corrupted and settles left-to-right.
 * Length is held constant so nothing reflows while it resolves.
 */
function useScramble(text: string, active: boolean, delayMs: number) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (reduced || !active) {
      setOut(text);
      return;
    }

    const duration = 380 + text.length * 12;
    const started = performance.now();

    const render = () => {
      const t = performance.now() - started - delayMs;
      const p = t < 0 ? 0 : Math.min(t / duration, 1);
      if (p >= 1) {
        window.clearInterval(id);
        setOut(text);
        return;
      }
      setOut(corrupt(text, Math.floor(p * text.length)));
    };

    setOut(corrupt(text, 0));
    const id = window.setInterval(render, 45);
    return () => window.clearInterval(id);
  }, [text, active, delayMs, reduced]);

  return out;
}

function Row({ noisy, structured, index, active }: {
  noisy: string;
  structured: string;
  index: number;
  active: boolean;
}) {
  const scrambled = useScramble(noisy, active, index * 110);

  return (
    <li className="group grid grid-cols-1 items-center gap-x-6 gap-y-3 border-b border-line py-6 last:border-b-0 md:grid-cols-[2.5rem_minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-y-0">
      <span className="label hidden md:block" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Noisy input — degraded, mono, unresolved. */}
      <p className="font-mono text-[0.9rem] leading-snug tracking-tight text-muted md:text-right">
        <span className="sr-only">Input: </span>
        <span aria-hidden="true">{scrambled}</span>
        <span className="sr-only">{noisy}</span>
      </p>

      {/* Transformation mark. */}
      <span aria-hidden="true" className="flex items-center text-signal">
        <span className="hidden items-center md:flex">
          <span className="h-px w-10 bg-gradient-to-r from-line-bright to-signal" />
          <svg viewBox="0 0 7 8" className="h-2 w-[7px] fill-current">
            <path d="M0 0l7 4-7 4z" />
          </svg>
        </span>
        <span className="flex flex-col items-center md:hidden">
          <span className="h-4 w-px bg-gradient-to-b from-line-bright to-signal" />
          <svg viewBox="0 0 8 7" className="h-[7px] w-2 fill-current">
            <path d="M0 0l4 7 4-7z" />
          </svg>
        </span>
      </span>

      {/* Structured output — crisp, resolved. */}
      <p className="flex items-center gap-3 text-[1.0625rem] leading-snug tracking-[-0.015em] text-bone">
        <span
          aria-hidden="true"
          className="hidden h-4 w-px shrink-0 bg-signal opacity-70 transition-opacity duration-300 group-hover:opacity-100 md:block"
        />
        <span className="sr-only">Output: </span>
        {structured}
      </p>
    </li>
  );
}

export function SignalStrip() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      aria-labelledby="signal-strip-heading"
      className="relative border-t border-line py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div data-reveal className="flex flex-col gap-3">
          <span className="label">The thesis, concretely</span>
          <h2
            id="signal-strip-heading"
            className="max-w-[54ch] text-pretty text-[1.0625rem] leading-relaxed text-muted"
          >
            Every system here makes the same move: take an input that was never meant
            for a computer, and give it structure a business can act on.
          </h2>
        </div>

        <ul data-reveal data-reveal-delay="120" className="mt-10 border-t border-line">
          {signalPairs.map((pair, i) => (
            <Row
              key={pair.noisy}
              noisy={pair.noisy}
              structured={pair.structured}
              index={i}
              active={inView}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
