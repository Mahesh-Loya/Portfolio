import Link from "next/link";
import type { Offer } from "@/content/site";
import { offers } from "@/content/site";

/**
 * Four capability panels rather than four paragraphs. Each card leads with the
 * claim and one sentence of evidence; the rest of the argument stays in the DOM
 * behind a native disclosure, so the page reads as an instrument panel while
 * losing none of the substance (or its findability in browser search).
 *
 * Glass rule (stated in full in `work.tsx`): a card is a discrete object, so it
 * gets glass. The header above it is running prose, so it gets none.
 * Rhythm: support tier — py-24 md:py-32, h2 text-3xl/sm:text-4xl, content mt-14.
 */

/**
 * Splits a blurb into its opening sentence and the remainder at render time so
 * the shortened copy is never duplicated in content. Falls back to the whole
 * string when there is no sentence break to split on.
 */
function splitLead(blurb: string): { lead: string; rest: string } {
  const breakAt = blurb.indexOf(". ");
  if (breakAt === -1) return { lead: blurb, rest: "" };
  return {
    lead: blurb.slice(0, breakAt + 1),
    rest: blurb.slice(breakAt + 2).trim(),
  };
}

function TechChips({ tech }: { tech: string[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {tech.map((item) => (
        <li
          key={item}
          className="rounded-full border border-line bg-surface/40 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.06em] text-faint transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:border-line-bright"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Card({ offer, index }: { offer: Offer; index: number }) {
  const { lead, rest } = splitLead(offer.blurb);
  const ordinal = String(index + 1).padStart(2, "0");

  return (
    <li
      /* .glass-panel carries the radius, gradient, layered shadow and the
         eased hover; the lift is added here and kept off reduced motion. */
      className="glass-panel bracketed group relative flex flex-col p-7 sm:p-9 motion-safe:hover:-translate-y-1"
      data-reveal
      data-reveal-delay={index * 70}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-[0.16em] text-faint transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:text-signal group-focus-within:text-signal">
          {ordinal}
        </span>
        <span aria-hidden="true" className="rule h-px flex-1" />
      </div>

      <h3 className="mt-7 max-w-[24ch] text-balance text-xl leading-tight tracking-tight text-bone sm:text-2xl">
        {offer.title}
      </h3>

      <p className="mt-5 text-pretty text-sm leading-relaxed text-muted">{lead}</p>

      {rest ? (
        <details className="group/more mt-6">
          <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="text-signal">
              <span className="group-open/more:hidden">+</span>
              <span className="hidden group-open/more:inline">&#8722;</span>
            </span>
            <span className="group-open/more:hidden">Detail</span>
            <span className="hidden group-open/more:inline">Less</span>
          </summary>
          <p className="mt-4 border-l border-line pl-5 text-pretty text-sm leading-relaxed text-faint">
            {rest}
          </p>
        </details>
      ) : null}

      <div className="mt-auto pt-9">
        <TechChips tech={offer.tech} />

        <div className="mt-6 border-t border-line pt-6">
          {/* The one place the gold is allowed to carry a surface. The tint is
              held at 5% and the hover firms up the border rather than the fill,
              because a heavier fill drops signal-on-signal below AA in the
              light theme. */}
          <Link
            href={offer.proofHref}
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-signal/20 bg-signal/5 px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-signal transition-[color,border-color] duration-500 ease-[var(--ease-out-expo)] group-hover:border-signal/55"
          >
            {offer.proofLabel}
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:translate-x-1"
            >
              &#8594;
            </span>
          </Link>
        </div>
      </div>
    </li>
  );
}

export function Offers() {
  return (
    <section
      id="build"
      aria-labelledby="build-heading"
      className="ambient relative border-t border-line px-6 py-24 md:py-32 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl" data-reveal>
          <p className="label">What I build</p>
          <h2
            id="build-heading"
            className="mt-5 text-balance text-3xl leading-tight tracking-[-0.03em] text-bone sm:text-4xl"
          >
            Four things you can hire me to build
          </h2>
          <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted">
            Each one is something I have already shipped — follow the link on a card to
            the working thing behind the claim.
          </p>
        </header>

        <ol className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6">
          {offers.map((offer, i) => (
            <Card key={offer.title} offer={offer} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Offers;
