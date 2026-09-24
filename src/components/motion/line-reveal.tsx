"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO } from "./easing";
import { NoJs } from "./no-js";

/**
 * LineReveal — headings rise into place from behind a clipping mask.
 *
 * API is per-line by design: you pass the lines, e.g.
 *
 *   <LineReveal as="h2" lines={["Work that is", "already running"]} />
 *
 * Measuring rendered line boxes would mean reading layout after paint, which
 * costs a forced reflow on every resize and risks a flash of unmasked text; a
 * word-count guess breaks the moment the font or viewport changes. So the split
 * is authored.
 *
 * Wrapping is handled rather than assumed: each line sits in its own
 * `overflow: hidden` block whose height is whatever the content needs. If a line
 * wraps on a narrow viewport the wrapper simply grows, the 110% translate still
 * hides all of it, and that chunk reveals as one unit. Nothing is ever clipped
 * mid-line.
 *
 * Accessibility: the text stays real text in the DOM, in order, inside the
 * heading element — selectable, searchable, and read by a screen reader as one
 * heading. Nothing is duplicated and nothing is aria-hidden.
 */

const TAGS = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  div: "div",
} as const;

export type LineRevealProps = {
  /** One entry per authored line. */
  lines: ReactNode[];
  as?: keyof typeof TAGS;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** Seconds before the first line. */
  delay?: number;
  /** Seconds between lines. */
  step?: number;
  duration?: number;
  trigger?: "view" | "mount";
  amount?: number;
  once?: boolean;
};

export function LineReveal({
  lines,
  as = "h2",
  className,
  style,
  id,
  delay = 0,
  step = 0.085,
  duration = 1,
  trigger = "view",
  amount = 0.3,
  once = true,
}: LineRevealProps) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });
  const Component = TAGS[as] as ElementType;

  // Reduced motion shows everything at once rather than waiting on the scroll
  // gate — see the same note in Stagger.
  const shown = reduced || trigger === "mount" || inView;

  return (
    <>
      <Component ref={ref} id={id} className={className} style={style}>
        {lines.map((line, i) => (
          <span
            key={i}
            className="block overflow-hidden"
            // Descenders and accents overflow the line box, so the mask is
            // pushed out and pulled back by the same amount. Symmetric, so it
            // cannot shift layout.
            style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
          >
            <motion.span
              data-motion-reveal
              className="block will-change-transform"
              initial={{ y: "110%" }}
              animate={shown ? { y: "0%" } : { y: "110%" }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration, delay: delay + i * step, ease: EASE_OUT_EXPO }
              }
            >
              {line}
            </motion.span>
          </span>
        ))}
      </Component>
      <NoJs />
    </>
  );
}
