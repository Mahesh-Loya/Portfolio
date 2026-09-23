import Image from "next/image";
import type { BuildLogEntry } from "@/content/site";
import { alsoOnGithub, buildLog, profile } from "@/content/site";

/**
 * Bento spans, resolved from the data rather than hardcoded per project.
 *
 * Featured entries take half the row each; among the rest, the one carrying a
 * screenshot earns the wide cell and the others fill what is left. The `lg:`
 * prefix means every rule collapses to a single column on small screens, and no
 * cell is given a fixed height, so a long blurb grows the row instead of
 * clipping.
 */
const FEATURED_SPAN = "lg:col-span-3";

function restSpan(entry: BuildLogEntry, rest: BuildLogEntry[]): string {
  if (entry.shot) return "lg:col-span-4";
  if (rest.some((other) => other.shot)) return "lg:col-span-2";
  return rest.length === 2 ? "lg:col-span-3" : "lg:col-span-2";
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

/**
 * The repo link is the card's primary target: its ::after covers the whole
 * card, so anywhere on the card is clickable. The live link sits above that
 * overlay via `relative z-10` so it stays independently clickable.
 */
function CardLinks({ entry }: { entry: BuildLogEntry }) {
  if (!entry.repo && !entry.live) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
      {entry.repo ? (
        <a
          href={entry.repo}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors after:absolute after:inset-0 after:content-[''] hover:text-signal focus-visible:text-signal"
        >
          Source
          <span className="sr-only"> code for {entry.name} on GitHub</span>
        </a>
      ) : null}

      {entry.live ? (
        <a
          href={entry.live}
          target="_blank"
          rel="noreferrer"
          className="relative z-10 font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-signal focus-visible:text-signal"
        >
          Live
          <span className="sr-only"> site for {entry.name}</span>
        </a>
      ) : null}
    </div>
  );
}

function Card({
  entry,
  span,
  delay,
}: {
  entry: BuildLogEntry;
  span: string;
  delay: number;
}) {
  return (
    <article
      className={`group relative flex flex-col rounded-lg border border-line bg-void p-6 transition-colors duration-500 focus-within:border-line-bright focus-within:bg-surface hover:border-line-bright hover:bg-surface sm:p-7 ${span}`}
      data-reveal
      data-reveal-delay={delay}
    >
      {entry.shot ? (
        <div className="relative mb-6 aspect-16/10 overflow-hidden rounded border border-line bg-surface">
          <Image
            src={entry.shot.src}
            alt={entry.shot.alt}
            fill
            sizes="(min-width: 1024px) 42vw, (min-width: 640px) 90vw, 100vw"
            className="object-cover object-top"
          />
        </div>
      ) : null}

      <h3 className="text-base tracking-[-0.01em] text-bone transition-colors duration-300 group-focus-within:text-signal group-hover:text-signal sm:text-lg">
        {entry.name}
      </h3>

      <p
        className={`mt-3 text-pretty leading-relaxed text-faint ${
          entry.featured ? "max-w-[58ch] text-sm" : "text-[0.8125rem]"
        }`}
      >
        {entry.blurb}
      </p>

      <div className="mt-auto pt-6">
        <TechChips tech={entry.tech} />
        <CardLinks entry={entry} />
      </div>
    </article>
  );
}

/**
 * Breadth, kept deliberately quieter than the case studies above it: smaller
 * type, tighter rhythm, and the minor repositories reduced to a single line of
 * facts rather than cards of their own.
 */
export function BuildLog() {
  const featured = buildLog.filter((entry) => entry.featured);
  const rest = buildLog.filter((entry) => !entry.featured);

  return (
    <section
      id="build-log"
      aria-labelledby="build-log-heading"
      className="relative border-t border-line px-6 py-24 sm:py-28 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl" data-reveal>
          <p className="label">Build log</p>
          <h2 id="build-log-heading" className="mt-4 text-2xl tracking-[-0.03em] sm:text-3xl">
            Everything else that got built
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-sm text-muted">
            Smaller projects that never became case studies — weekend scope, real code,
            shipped anyway. The three above are the ones worth reading in full.
          </p>
        </header>

        <div className="mt-12 grid gap-3 sm:gap-4 lg:grid-cols-6">
          {featured.map((entry, i) => (
            <Card key={entry.name} entry={entry} span={FEATURED_SPAN} delay={i * 70} />
          ))}
          {rest.map((entry, i) => (
            <Card
              key={entry.name}
              entry={entry}
              span={restSpan(entry, rest)}
              delay={(featured.length + i) * 70}
            />
          ))}
        </div>

        <div
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6"
          data-reveal
        >
          <span className="label">Also on GitHub</span>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {alsoOnGithub.map((repo) => (
              <li key={repo.name}>
                <a
                  href={repo.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="group font-mono text-xs text-faint transition-colors hover:text-bone focus-visible:text-bone"
                >
                  {repo.name}
                  <span className="ml-2 text-line-bright transition-colors group-hover:text-faint">
                    {repo.language}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="ml-auto font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-signal focus-visible:text-signal"
          >
            All repositories &#8594;
          </a>
        </div>
      </div>
    </section>
  );
}

export default BuildLog;
