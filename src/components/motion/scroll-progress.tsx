"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * ScrollProgress — a hairline read-position rule across the top of the viewport.
 *
 * One device pixel of gold at low opacity, no glow, no track behind it. It is
 * meant to be noticed peripherally and never looked at directly.
 *
 * Under reduced motion the rule stays — it is information, not decoration — but
 * the spring smoothing is dropped, so it tracks the scroll position exactly and
 * nothing continues moving after the scroll stops.
 *
 * Fixed and transform-driven, so it is outside layout entirely: no CLS, and no
 * work per frame beyond one composited scale.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
    restDelta: 0.0005,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-px origin-left bg-signal opacity-[0.32] will-change-transform"
      style={{ scaleX: reduced ? scrollYProgress : smoothed }}
    />
  );
}
