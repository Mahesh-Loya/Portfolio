import { proofPoints } from "@/content/site";

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
 */
export function ProofStrip() {
  return (
    <section aria-label="Proof points" className="border-y border-line bg-void">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 sm:px-8 sm:py-8">
        <div className="glass-panel rounded-sm">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-2.5 sm:px-6">
            <p className="label">Verified on this site</p>
            <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-faint tabular-nums">
              <span aria-hidden="true" className="block size-1.5 bg-signal" />
              {String(proofPoints.length).padStart(2, "0")} SIGNALS
            </p>
          </div>

          <ul className="grid grid-cols-2 md:grid-cols-4">
            {proofPoints.map((point, i) => (
              <li
                key={point.label}
                data-reveal
                data-reveal-delay={i * 90}
                className="flex flex-col gap-1.5 border-line px-5 py-5 even:border-l [&:nth-child(n+3)]:border-t sm:px-6 sm:py-6 md:border-l md:first:border-l-0 md:[&:nth-child(n+3)]:border-t-0"
              >
                <span aria-hidden="true" className="mb-1 block h-2 w-px bg-line-bright" />
                <span
                  className="font-sans font-medium leading-none tracking-[-0.02em] tabular-nums text-bone"
                  style={{ fontSize: "clamp(1.4rem, 3.4vw, 1.9rem)" }}
                >
                  {point.value}
                </span>
                <span className="font-mono text-[0.6875rem] uppercase leading-snug tracking-[0.1em] text-muted">
                  {point.label}
                </span>
                <span className="mt-0.5 text-pretty text-[0.75rem] leading-snug text-faint">
                  {point.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
