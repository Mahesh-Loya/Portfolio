/**
 * The choreography layer. Four primitives plus one indicator, all built on
 * `motion` and native CSS — no new dependencies, no runtime beyond what the
 * animations themselves need.
 *
 * Shared contract: transform and opacity only (CLS stays 0), final state
 * rendered immediately under `prefers-reduced-motion`, identical SSR and first
 * client render, and visible content when JS never runs.
 *
 * Import from the individual modules in components that only need one of them;
 * this barrel is for convenience, not for bundling.
 */
export { Stagger, StaggerItem } from "./stagger";
export type { StaggerProps, StaggerItemProps } from "./stagger";
export { LineReveal } from "./line-reveal";
export type { LineRevealProps } from "./line-reveal";
export { CountUp } from "./count-up";
export type { CountUpProps } from "./count-up";
export { Parallax } from "./parallax";
export type { ParallaxProps } from "./parallax";
export { ScrollProgress } from "./scroll-progress";
export { EASE_OUT_EXPO, REVEAL_DURATION, REVEAL_DISTANCE } from "./easing";
