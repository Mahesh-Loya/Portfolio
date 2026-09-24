"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO } from "./easing";

/**
 * CountUp — counts a number into place the first time it is seen.
 *
 * Deliberately conservative about what it will animate. A value only counts if
 * it is a plain integer with an optional short suffix ("231+", "3"). Anything
 * else — "₹1,00,000", "Daily", "7-table" — is rendered exactly as given, because
 * a half-parsed number counting up past a currency symbol looks broken, and
 * guessing at grouping rules across locales is worse.
 *
 * The final value is what gets server-rendered, so there is no layout reserved
 * for a number that never arrives and nothing to fix up if JS fails. The count
 * is written straight to the text node, never through state, so a four-up row of
 * these is zero React renders per frame.
 */

/** Runs before paint on the client, and is a no-op during SSR. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Integer, then at most a short suffix of non-digits. Nothing else qualifies. */
const COUNTABLE = /^(\d{1,9})(\D{0,3})$/;

export type CountUpProps = {
  value: string;
  className?: string;
  style?: CSSProperties;
  /** Seconds the count takes. */
  duration?: number;
  /** Seconds before it starts, once in view. */
  delay?: number;
  /** Fraction visible before it starts. */
  amount?: number;
};

export function CountUp({
  value,
  className,
  style,
  duration = 1.5,
  delay = 0,
  amount = 0.4,
}: CountUpProps) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const played = useRef(false);

  const parsed = useMemo(() => {
    const match = COUNTABLE.exec(value.trim());
    if (!match) return null;
    const target = Number(match[1]);
    if (!Number.isFinite(target) || target === 0) return null;
    return { target, suffix: match[2] };
  }, [value]);

  const finished = useRef(false);

  // Server-render the real value, then zero it before the first paint — so the
  // final value is never flashed, and a no-JS visitor keeps it.
  useIsomorphicLayoutEffect(() => {
    if (!parsed || reduced || played.current) return;
    const node = ref.current;
    if (node) node.textContent = `0${parsed.suffix}`;
  }, [parsed, reduced]);

  useEffect(() => {
    if (!parsed || reduced || !inView || played.current) return;
    const node = ref.current;
    if (!node) return;

    // Latched: a re-render for any other reason must not restart the count.
    played.current = true;
    const suffix = parsed.suffix;

    const controls = animate(0, parsed.target, {
      duration,
      delay,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        node.textContent = `${Math.round(latest)}${suffix}`;
      },
      onComplete: () => {
        finished.current = true;
        node.textContent = value;
      },
    });

    return () => {
      controls.stop();
      // Only StrictMode's dev remount gets here mid-count; unlatch so the
      // remount can finish the job rather than leaving a stranded zero.
      if (!finished.current) played.current = false;
    };
  }, [parsed, reduced, inView, duration, delay, value]);

  return (
    <span ref={ref} className={className} style={style}>
      {value}
    </span>
  );
}
