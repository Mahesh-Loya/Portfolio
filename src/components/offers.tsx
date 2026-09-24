import Link from "next/link";
import type { Offer } from "@/content/site";
import { offers } from "@/content/site";

/**
 * Four capability panels rather than four paragraphs. Each card leads with the
 * claim and one sentence of evidence; the rest of the argument stays in the DOM
 * behind a native disclosure, so the page reads as an instrument panel while
 * losing none of the substance (or its findability in browser search).
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
    <ul className="flex flex-wrap items-center gap-1.5">
      {tech.map((item) => (
        <li
          key={item}
          className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.06em] text-faint"
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
      className="glass-panel bracketed group relative flex flex-col p-6 transition-colors duration-500 sm:p-8"
      data-reveal
      data-reveal-delay={index * 70}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-[0.16em] text-faint transition-colors duration-300 group-hover:text-signal group-focus-within:text-signal">
          {ordinal}
        </span>
        <span aria-hidden="true" className="rule h-px flex-1" />
      </div>

      <h3 className="mt-5 max-w-[24ch] text-balance text-xl leading-tight tracking-tight text-bone sm:text-2xl">
        {offer.title}
      </h3>

      <p className="mt-4 text-pretty text-sm leading-relaxed text-muted">{lead}</p>

      {rest ? (
        <details className="group/more mt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint transition-colors duration-300 hover:text-bone [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="text-signal">
              <span className="group-open/more:hidden">+</span>
              <span className="hidden group-open/more:inline">&#8722;</span>
            </span>
            <span className="group-open/more:hidden">Detail</span>
            <span className="hidden group-open/more:inline">Less</span>
          </summary>
          <p className="mt-3 border-l border-line pl-4 text-pretty text-sm leading-relaxed text-faint">
            {rest}
          </p>
        </details>
      ) : null}

      <div className="mt-auto pt-7">
        <TechChips tech={offer.tech} />

        <div className="mt-5 border-t border-line pt-5">
          <Link
            href={offer.proofHref}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-signal"
          >
            {offer.proofLabel}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
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
      className="relative border-t border-line px-6 py-24 sm:py-28 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl" data-reveal>
          <p className="label">What I build</p>
          <h2 id="build-heading" className="mt-4 text-2xl tracking-[-0.03em] sm:text-3xl">
            Four things you can hire me to build
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-sm text-muted">
            Each one is something I have already shipped — follow the link on a card to
            the working thing behind the claim.
          </p>
        </header>

        <ol className="mt-14 grid gap-4 md:grid-cols-2 md:gap-5">
          {offers.map((offer, i) => (
            <Card key={offer.title} offer={offer} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Offers;
