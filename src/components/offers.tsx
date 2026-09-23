import Link from "next/link";
import type { Offer } from "@/content/site";
import { offers } from "@/content/site";

/**
 * A numbered editorial list rather than a grid of service cards: four
 * full-width rows separated by hairlines, each one a claim on the left and the
 * evidence for it on the right. The proof link is the point of the section, so
 * it carries the accent and covers the whole row as its target.
 */

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

function Row({ offer, index }: { offer: Offer; index: number }) {
  return (
    <li
      className="group relative -mx-4 border-t border-line px-4 outline-signal outline-offset-[-2px] last:border-b has-[a:focus-visible]:outline-2 sm:-mx-6 sm:px-6"
      data-reveal
      data-reveal-delay={index * 70}
    >
      {/* Painted behind the content so the hover lift animates on its own
          timing, independent of the [data-reveal] entrance transition. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-surface opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100"
      />

      <div className="relative grid gap-y-6 py-10 lg:grid-cols-12 lg:gap-x-12 lg:py-14">
        <div className="lg:col-span-5">
          <span className="font-mono text-[11px] tracking-[0.16em] text-faint transition-colors duration-300 group-hover:text-signal group-has-[a:focus-visible]:text-signal">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 max-w-[22ch] text-balance text-2xl leading-tight tracking-tight text-bone sm:text-3xl">
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
              {offer.title}
            </span>
          </h3>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="max-w-[60ch] text-pretty leading-relaxed text-muted">{offer.blurb}</p>

          <div className="mt-7">
            <TechChips tech={offer.tech} />
          </div>

          <div className="mt-7">
            <Link
              href={offer.proofHref}
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-signal uppercase after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
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
            Each one is something I have already shipped — follow the link at the end of a
            row to the working thing behind the claim.
          </p>
        </header>

        <ol className="mt-14">
          {offers.map((offer, i) => (
            <Row key={offer.title} offer={offer} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Offers;
