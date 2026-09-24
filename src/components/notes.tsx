"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { caseStudies } from "@/content/site";

/**
 * Surfaces the sharpest engineering insight from each case study.
 * These are the quotable lines — the shareable surface of the site.
 *
 * Glass rule (stated in full in `work.tsx`): a note is a discrete object, so it
 * gets glass; the header is prose and the expander is a control, so neither
 * does. Rhythm: support tier — py-24 md:py-32, h2 text-3xl/sm:text-4xl,
 * content mt-14.
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

/** How many cards stand on screen before the reader asks for more. */
const INITIAL_COUNT = 3;

function Note({
  note,
  index,
  hidden,
}: {
  note: (typeof notes)[number];
  index: number;
  hidden: boolean;
}) {
  return (
    <li
      key={`${note.slug}-${index}`}
      className="glass-panel p-7 sm:p-8"
      hidden={hidden}
      data-reveal
      data-reveal-delay={(index % INITIAL_COUNT) * 70}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <span className="font-mono text-[11px] tracking-[0.16em] text-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Link
            href={`/work/${note.slug}`}
            className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone"
          >
            {note.project}
          </Link>
        </div>

        <h3 className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
          {note.title}
        </h3>

        <blockquote className="mt-5 border-l-2 border-signal py-1 pl-6">
          <p className="text-pretty font-serif text-lg leading-[1.4] text-bone">
            {note.insight}
          </p>
        </blockquote>

        <details className="group/why mt-auto pt-6">
          <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="text-signal">
              <span className="group-open/why:hidden">+</span>
              <span className="hidden group-open/why:inline">&#8722;</span>
            </span>
            <span className="group-open/why:hidden">What went wrong</span>
            <span className="hidden group-open/why:inline">Hide</span>
          </summary>
          <p className="mt-1 border-t border-line pt-4 text-pretty text-sm leading-relaxed text-faint">
            {note.problem}
          </p>
        </details>
      </div>
    </li>
  );
}

export function Notes() {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const hasMore = notes.length > INITIAL_COUNT;

  return (
    <section
      id="notes"
      aria-labelledby="notes-heading"
      className="ambient relative border-t border-line px-6 py-24 md:py-32 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl" data-reveal>
          <p className="label">Engineering notes</p>
          <h2
            id="notes-heading"
            className="mt-5 text-balance text-3xl leading-tight tracking-[-0.03em] text-bone sm:text-4xl"
          >
            What the work actually taught me
          </h2>
          <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted">
            Every system here failed in some specific way before it worked. The line is
            the lesson; open a card for what it cost.
          </p>
        </header>

        <ol id={listId} className="mt-14 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note, i) => (
            <Note
              key={`${note.slug}-${i}`}
              note={note}
              index={i}
              hidden={!expanded && i >= INITIAL_COUNT}
            />
          ))}
        </ol>

        {hasMore ? (
          <div className="mt-10 flex items-center gap-5">
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls={listId}
              /* A control, not an object: border and hover, no surface. */
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-line px-6 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-[color,border-color] duration-500 ease-[var(--ease-out-expo)] hover:border-line-bright hover:text-bone"
            >
              <span aria-hidden="true" className="text-signal">
                {expanded ? "\u2212" : "+"}
              </span>
              {expanded ? "Show fewer" : `Show all ${notes.length}`}
            </button>
            <span aria-hidden="true" className="rule h-px flex-1" />
            <span className="font-mono text-[10px] tracking-[0.14em] text-faint tabular-nums">
              {String(expanded ? notes.length : INITIAL_COUNT).padStart(2, "0")}/
              {String(notes.length).padStart(2, "0")}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
