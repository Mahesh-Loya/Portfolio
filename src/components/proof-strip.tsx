import { proofPoints } from "@/content/site";
import { Stagger, StaggerItem } from "./motion/stagger";
import { CountUp } from "./motion/count-up";

/**
 * A band of verifiable facts, sitting directly under the hero — read as an
 * instrument readout rather than a marketing stats bar: one glass enclosure, a
 * mono channel header, hairline ticks between the entries.
 *
 * Deliberately quiet: the numbers are set in bone rather than the accent, so
 * this reads as evidence backing the hero's claim rather than a second headline
 * competing with it. The single lime element is the status dot in the header.
 * Two columns on a phone — a horizontal scroller would hide half the evidence
 * from the people most likely to see it.
 *
 * The presence comes from air and one soft light source above the band, not
 * from louder type: it is evidence, so it should look measured.
 */
export function ProofStrip() {
  return (
    <section aria-label="Proof points" className="ambient border-y border-line bg-void">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Clipped so the internal hairline grid meets the 18px enclosure. */}
        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-8 sm:py-5">
            <p className="label">Verified on this site</p>
            <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-faint tabular-nums">
              <span aria-hidden="true" className="block size-1.5 rounded-full bg-signal" />
              {String(proofPoints.length).padStart(2, "0")} SIGNALS
            </p>
          </div>

          {/* Entries land left to right, and each number counts itself in just
              behind its own entry. Values that are not plain integers — the
              prize figure, "Daily" — are printed as written; CountUp declines
              rather than guesses. */}
          <Stagger
            as="ul"
            className="grid grid-cols-2 md:grid-cols-4"
            delay={0.05}
            step={0.1}
          >
            {proofPoints.map((point, i) => (
              <StaggerItem
                as="li"
                key={point.label}
                index={i}
                className="flex flex-col gap-2 border-line px-6 py-8 even:border-l [&:nth-child(n+3)]:border-t sm:px-8 sm:py-10 md:border-l md:first:border-l-0 md:[&:nth-child(n+3)]:border-t-0"
              >
                <span aria-hidden="true" className="mb-2 block h-2.5 w-px bg-line-bright" />
                <CountUp
                  value={point.value}
                  delay={0.25 + i * 0.1}
                  className="block font-sans font-medium leading-none tracking-[-0.02em] tabular-nums text-bone"
                  style={{ fontSize: "clamp(1.5rem, 3.6vw, 2.1rem)" }}
                />
                <span className="font-mono text-[0.6875rem] uppercase leading-snug tracking-[0.1em] text-muted">
                  {point.label}
                </span>
                <span className="mt-1 text-pretty text-[0.75rem] leading-relaxed text-faint">
                  {point.note}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
