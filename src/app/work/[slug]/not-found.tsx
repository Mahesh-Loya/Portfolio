import Link from "next/link";
import { caseStudies } from "@/content/site";

export default function CaseStudyNotFound() {
  return (
    <main id="main" className="px-6 md:px-10">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center py-28">
        <p className="label">Error 404</p>

        <h1 className="mt-6 max-w-[18ch] text-balance text-3xl leading-tight tracking-tight text-bone sm:text-4xl">
          No case study lives at that address.
        </h1>

        <p className="mt-5 max-w-[56ch] text-pretty leading-relaxed text-muted">
          The slug didn&rsquo;t match anything that has been written up. Here is everything that
          has.
        </p>

        <ul className="mt-12 border-t border-line">
          {caseStudies.map((study) => (
            <li key={study.slug}>
              <Link
                href={`/work/${study.slug}`}
                className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-5 transition-colors hover:bg-surface"
              >
                <span className="text-lg tracking-tight text-bone transition-colors group-hover:text-signal sm:text-xl">
                  {study.title}
                </span>
                <span className="label">{study.period}</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/#work"
          className="group mt-12 inline-flex items-center gap-2 self-start font-mono text-[11px] tracking-[0.14em] text-faint uppercase transition-colors hover:text-signal"
        >
          <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">
            &#8592;
          </span>
          Back to all work
        </Link>
      </div>
    </main>
  );
}
