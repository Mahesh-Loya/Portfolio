import Link from "next/link";
import { caseStudies } from "@/content/site";

/**
 * Surfaces the sharpest engineering insight from each case study.
 * These are the quotable lines — the shareable surface of the site.
 */
const notes = caseStudies.flatMap((study) =>
  study.decisions.map((decision) => ({
    slug: study.slug,
    project: study.title,
    title: decision.title,
    problem: decision.problem,
    insight: decision.insight,
  })),
);

export function Notes() {
  return (
    <section
      id="notes"
      aria-labelledby="notes-heading"
      className="relative border-t border-line px-6 py-24 sm:py-32 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl" data-reveal>
          <p className="label">02 — Engineering notes</p>
          <h2
            id="notes-heading"
            className="mt-4 text-3xl tracking-[-0.03em] sm:text-4xl"
          >
            What the work actually taught me
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-muted">
            Every system here failed in some specific way before it worked. These are
            the lessons that cost something to learn.
          </p>
        </header>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {notes.map((note, i) => (
            <li
              key={`${note.slug}-${i}`}
              className="group relative flex flex-col bg-void p-7 transition-colors duration-500 hover:bg-surface sm:p-8"
              data-reveal
              data-reveal-delay={i * 70}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/work/${note.slug}`}
                  className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint transition-colors hover:text-bone"
                >
                  {note.project}
                </Link>
              </div>

              <h3 className="mt-5 text-lg tracking-[-0.01em] text-bone">
                {note.title}
              </h3>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-faint">
                {note.problem}
              </p>

              <blockquote className="mt-6 border-l-2 border-signal pl-4">
                <p className="font-serif text-lg leading-snug text-bone text-pretty">
                  {note.insight}
                </p>
              </blockquote>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
