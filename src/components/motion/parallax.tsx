"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Parallax — a whisper of scroll-linked drift for large background elements.
 *
 * Travel is expressed as a percentage of the element's own height and clamped to
 * ±6%. Anything more and the effect starts announcing itself, which is the one
 * thing it must not do; 2–4% is the useful range. Negative drifts upward.
 *
 * Transform only, no layout reads, and nothing at all under reduced motion.
 */

/** A few percent is the whole point. Hard-stop anything ambitious. */
const MAX_TRAVEL = 6;

export type ParallaxProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Percent of the element's own height to travel across the range. */
  distance?: number;
  /**
   * `"top"` starts at rest with the element parked at the top of the viewport —
   * right for a hero background, which must not be pre-offset on load.
   * `"through"` maps the element's full pass through the viewport.
   */
  anchor?: "top" | "through";
};

export function Parallax({
  children,
  className,
  style,
  distance = 3,
  anchor = "top",
}: ParallaxProps) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: anchor === "top" ? ["start start", "end start"] : ["start end", "end start"],
  });

  const travel = Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, distance));
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${travel}%`]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduced ? style : { ...style, y, willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
