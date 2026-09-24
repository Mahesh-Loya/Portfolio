import Link from "next/link";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { caseStudies } from "@/content/site";

export default function CaseStudyNotFound() {
  return (
    <>
      <Nav />

      <main id="main">
        {/* pt clears the fixed bar (h-14 / md:h-16) with room to spare. */}
        <section className="ambient relative px-6 pt-28 pb-28 md:px-10 md:pt-36 md:pb-40">
          <div className="mx-auto flex w-full max-w-3xl flex-col justify-center">
            <div data-reveal>
              <div className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-[1px] bg-signal" />
                <p className="label">Error 404</p>
              </div>

              <h1 className="mt-7 max-w-[18ch] text-balance text-4xl leading-[1.05] tracking-tight text-bone sm:text-5xl">
                No case study lives at that address.
              </h1>

              <p className="mt-7 max-w-[56ch] text-pretty text-lg leading-relaxed text-muted">
                The slug didn&rsquo;t match anything that has been written up. Here is everything
                that has.
              </p>
            </div>

            {/* Every written-up study, as a way out rather than a list. */}
            <ul className="mt-14 flex flex-col gap-4 md:mt-16" data-reveal data-reveal-delay="100">
              {caseStudies.map((study) => (
                <li key={study.slug}>
                  <Link
                    href={`/work/${study.slug}`}
                    className="glass-panel group flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-5 sm:px-8 motion-safe:hover:-translate-y-1"
                  >
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="text-lg leading-snug tracking-tight text-bone transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:text-signal sm:text-xl">
                        {study.title}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-4">
                      <span className="label">{study.period}</span>
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] text-line-bright transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:text-signal motion-safe:group-hover:translate-x-1"
                      >
                        &#8594;
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-14 self-start" data-reveal data-reveal-delay="160">
              <Link
                href="/#work"
                className="group inline-flex min-h-11 items-center gap-2.5 font-mono text-[11px] tracking-[0.14em] text-faint uppercase transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
              >
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:-translate-x-1"
                >
                  &#8592;
                </span>
                Back to all work
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
