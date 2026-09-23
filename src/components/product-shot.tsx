"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type ProductShotProps = {
  src: string;
  alt: string;
  /** Set only for a shot that is above the fold on first paint. */
  priority?: boolean;
  className?: string;
};

/**
 * A real screenshot, framed as a browser window.
 *
 * Two transforms run off scroll position and nothing else:
 * the frame drifts a few pixels against the page, and the image inside it
 * relaxes from 104% to 100%. Both are small enough to register as depth
 * rather than as animation, and both are dropped entirely when the visitor
 * has asked for reduced motion.
 *
 * Captures are 2160x1350 (16:10), so the aspect box matches the source and
 * `object-cover` never actually crops at rest.
 */
export function ProductShot({ src, alt, priority = false, className }: ProductShotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The frame itself: ±9px across a full viewport pass.
  const y = useTransform(scrollYProgress, [0, 1], [9, -9]);
  // The image within it: a 4% settle. Never below 1, so no edge is ever exposed.
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1]);

  const still = Boolean(reduced);

  return (
    <motion.div
      ref={ref}
      style={still ? undefined : { y }}
      className={`w-full max-w-full overflow-hidden rounded-md border border-line bg-surface ${
        className ?? ""
      }`}
    >
      {/* Chrome. Three dots and nothing else — it is a frame, not a mockup. */}
      <div
        aria-hidden="true"
        className="flex h-7 items-center gap-1.5 border-b border-line bg-raised px-3 sm:h-8 sm:px-3.5"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-line-bright sm:h-2 sm:w-2" />
        <span className="h-1.5 w-1.5 rounded-full bg-line-bright sm:h-2 sm:w-2" />
        <span className="h-1.5 w-1.5 rounded-full bg-line-bright sm:h-2 sm:w-2" />
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-void">
        <motion.div className="absolute inset-0" style={still ? undefined : { scale }}>
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover object-top"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ProductShot;
