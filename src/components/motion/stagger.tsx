"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT_EXPO, REVEAL_DISTANCE, REVEAL_DURATION } from "./easing";
import { NoJs } from "./no-js";

/**
 * Stagger — sequenced entrance.
 *
 * The single biggest upgrade over the flat `[data-reveal]` pass: a heading, its
 * supporting line and its content arrive one after another instead of together.
 * Simultaneity reads as cheap; sequence reads as intentional.
 *
 * Timing is explicit rather than inferred. `<StaggerItem index={n}>` resolves
 * its own delay as `delay + n * step` from context, so items can sit anywhere in
 * the subtree — inside grids, inside plain wrappers, in a different part of the
 * section entirely — and still land in the order you asked for. (Auto-indexing
 * from child order would only work for flat, direct children, and would be
 * silently wrong the moment a wrapper appeared.) Gaps in the index sequence are
 * fine, and useful: they reserve time for something animating on its own clock.
 *
 * Contract shared by every primitive here:
 *  - transform + opacity only, so CLS stays 0;
 *  - `prefers-reduced-motion` renders the final state immediately;
 *  - the SSR and first client render are identical, so hydration is clean;
 *  - without JS the content is visible (see `NoJs`).
 */

const TAGS = {
  div: motion.div,
  section: motion.section,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
  span: motion.span,
  header: motion.header,
  footer: motion.footer,
} as const;

type TagKey = keyof typeof TAGS;

type SharedProps = {
  as?: TagKey;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children?: ReactNode;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
};

type StaggerConfig = {
  /** Seconds between consecutive items. */
  step: number;
  /** Seconds before the first item. */
  delay: number;
  duration: number;
  /** Rise distance in px. */
  distance: number;
  reduced: boolean;
};

const DEFAULTS: StaggerConfig = {
  step: 0.09,
  delay: 0,
  duration: REVEAL_DURATION,
  distance: REVEAL_DISTANCE,
  reduced: false,
};

const StaggerContext = createContext<StaggerConfig>(DEFAULTS);

/** The container only carries the variant label; it never moves itself. */
const CONTAINER_VARIANTS: Variants = { hidden: {}, visible: {} };

export type StaggerProps = SharedProps & {
  /** Seconds between consecutive items. */
  step?: number;
  /** Seconds before index 0 starts. */
  delay?: number;
  /** Seconds each item takes to settle. */
  duration?: number;
  /** Rise distance in px. */
  distance?: number;
  /**
   * `"view"` waits until the container scrolls in (the default, and right for
   * everything below the fold). `"mount"` starts immediately — use it only for
   * above-the-fold content that is already on screen.
   */
  trigger?: "view" | "mount";
  /** Fraction of the container that must be visible before `"view"` fires. */
  amount?: number;
  once?: boolean;
};

export function Stagger({
  as = "div",
  step = DEFAULTS.step,
  delay = DEFAULTS.delay,
  duration = DEFAULTS.duration,
  distance = DEFAULTS.distance,
  trigger = "view",
  amount = 0.15,
  once = true,
  className,
  style,
  id,
  children,
  ...aria
}: StaggerProps) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });
  const Component = TAGS[as] as ElementType;

  const config = useMemo<StaggerConfig>(
    () => ({ step, delay, duration, distance, reduced }),
    [step, delay, duration, distance, reduced],
  );

  // `useInView` is a client-only signal, so the server and the first client
  // render both resolve to "hidden" — no hydration mismatch either way.
  //
  // Reduced motion skips the scroll gate entirely rather than merely zeroing the
  // duration: content below the fold must not be waiting on an observer for
  // someone who asked for no motion. This matches what `Reveal` already does for
  // `[data-reveal]`.
  const shown = reduced || trigger === "mount" || inView;

  return (
    <StaggerContext.Provider value={config}>
      <Component
        ref={ref}
        id={id}
        className={className}
        style={style}
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate={shown ? "visible" : "hidden"}
        {...aria}
      >
        {children}
      </Component>
      <NoJs />
    </StaggerContext.Provider>
  );
}

export type StaggerItemProps = SharedProps & {
  /** Position in the sequence. Gaps are allowed. */
  index?: number;
  /** Override the container's rise distance, in px. */
  distance?: number;
  /** Override the container's duration, in seconds. */
  duration?: number;
};

export function StaggerItem({
  as = "div",
  index = 0,
  distance,
  duration,
  className,
  style,
  id,
  children,
  ...aria
}: StaggerItemProps) {
  const config = useContext(StaggerContext);
  const Component = TAGS[as] as ElementType;

  const rise = distance ?? config.distance;
  const seconds = duration ?? config.duration;
  const offset = config.delay + index * config.step;

  const variants = useMemo<Variants>(
    () =>
      config.reduced
        ? {
            hidden: { opacity: 0, y: rise },
            visible: { opacity: 1, y: 0, transition: { duration: 0 } },
          }
        : {
            hidden: { opacity: 0, y: rise },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: seconds, delay: offset, ease: EASE_OUT_EXPO },
            },
          },
    [config.reduced, rise, seconds, offset],
  );

  // No `initial`/`animate` here on purpose: the label is inherited from the
  // nearest Stagger through motion's context, which is what lets items sit at
  // any depth in the subtree.
  return (
    <Component
      data-motion-reveal
      id={id}
      className={className}
      style={style}
      variants={variants}
      {...aria}
    >
      {children}
    </Component>
  );
}
