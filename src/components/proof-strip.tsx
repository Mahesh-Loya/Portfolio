import { proofPoints } from "@/content/site";

/**
 * A band of verifiable facts, sitting directly under the hero.
 *
 * Deliberately quiet: the numbers are set in bone rather than the accent, so
 * this reads as evidence backing the hero's claim rather than a second headline
 * competing with it. Two columns on a phone — a horizontal scroller would hide
 * half the evidence from the people most likely to see it.
 */
export function ProofStrip() {
  return (
    <section aria-label="Proof points" className="border-y border-line bg-void">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <ul className="grid grid-cols-2 md:grid-cols-4">
          {proofPoints.map((point, i) => (
            <li
              key={point.label}
              data-reveal
              data-reveal-delay={i * 90}
              className="flex flex-col gap-1.5 border-line py-6 pr-4 even:border-l even:pl-4 [&:nth-child(n+3)]:border-t sm:pr-6 sm:even:pl-6 md:border-l md:py-8 md:pl-6 md:first:border-l-0 md:first:pl-0 md:[&:nth-child(n+3)]:border-t-0"
            >
              <span
                className="font-sans font-medium leading-none tracking-[-0.02em] tabular-nums text-bone"
                style={{ fontSize: "clamp(1.45rem, 3.6vw, 2rem)" }}
              >
                {point.value}
              </span>
              <span className="text-[0.8125rem] leading-snug text-pretty text-muted">
                {point.label}
              </span>
              <span className="mt-0.5 font-mono text-[0.6875rem] leading-snug text-pretty text-faint">
                {point.note}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
