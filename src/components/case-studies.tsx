import Link from "next/link";
import type { CaseStudy } from "@/content/site";
import { caseStudies } from "@/content/site";

const VISIBLE_STACK = 5;

/**
 * Paired with the same name on the detail page's <h1>, so a browser that
 * supports view transitions morphs the title across the navigation. Browsers
 * without it simply ignore the property.
 */
function titleTransition(slug: string): React.CSSProperties {
  return { viewTransitionName: `cs-title-${slug}` };
}

function StackChips({ stack }: { stack: string[] }) {
  const shown = stack.slice(0, VISIBLE_STACK);
  const rest = stack.length - shown.length;
  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {shown.map((item) => (
        <li
          key={item}
          className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.06em] text-faint"
        >
          {item}
        </li>
      ))}
      {rest > 0 ? (
        <li className="px-1 font-mono text-[10px] tracking-[0.06em] text-faint">+{rest} more</li>
      ) : null}
    </ul>
  );
}

function Metrics({
  metrics,
  size = "sm",
}: {
  metrics: CaseStudy["metrics"];
  size?: "sm" | "lg";
}) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-5 sm:gap-x-12">
      {metrics.map((m) => (
        <div key={m.label} className="min-w-0">
          <dt className="label mb-1.5">{m.label}</dt>
          <dd
            className={`tracking-tight text-bone tabular-nums ${
              size === "lg" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
            }`}
          >
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ReadLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/work/${slug}`}
      tabIndex={-1}
      aria-hidden="true"
      className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors group-hover:text-signal"
    >
      Read the case study
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        &#8594;
      </span>
    </Link>
  );
}

/** Marks a case study that is actually deployed — the strongest signal on the card. */
function LiveTag() {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-signal uppercase">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
      </span>
      Live
    </span>
  );
}

/** Entry 01 — the hero. More air, bigger type, the premise given the page. */
function HeroEntry({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <article className="group relative" data-reveal>
      <div className="rule mb-8" />
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="font-mono text-[11px] tracking-[0.16em] text-signal">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="label">{study.period}</span>
        <span aria-hidden="true" className="label text-line-bright">
          &#183;
        </span>
        <span className="label">{study.role}</span>
        {study.live ? <LiveTag /> : null}
      </div>

      <h3 className="mt-6 text-balance text-4xl leading-[0.98] tracking-tight text-bone sm:text-5xl lg:text-6xl">
        <Link
          href={`/work/${study.slug}`}
          style={titleTransition(study.slug)}
          className="after:absolute after:inset-0 after:content-[''] hover:text-signal focus-visible:text-signal"
        >
          {study.title}
        </Link>
      </h3>
      <p className="mt-4 max-w-[46ch] text-pretty text-lg text-muted">{study.kicker}</p>

      <div className="mt-12 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <blockquote className="max-w-[34ch] font-serif text-2xl leading-[1.28] text-balance text-bone sm:text-3xl">
          {study.premise}
        </blockquote>
        <div className="flex flex-col gap-8">
          <Metrics metrics={study.metrics} size="lg" />
          <StackChips stack={study.stack} />
          <ReadLink slug={study.slug} />
        </div>
      </div>
    </article>
  );
}

/** Entries 02–03 — tighter rows. The third mirrors the second. */
function RowEntry({
  study,
  index,
  mirrored,
}: {
  study: CaseStudy;
  index: number;
  mirrored: boolean;
}) {
  return (
    <article className="group relative" data-reveal data-reveal-delay="80">
      <div className="rule mb-8" />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className={`lg:col-span-5 ${mirrored ? "lg:order-2 lg:col-start-8" : ""}`}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-[11px] tracking-[0.16em] text-faint">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="label">{study.period}</span>
            {study.live ? <LiveTag /> : null}
          </div>
          <h3 className="mt-4 text-balance text-2xl leading-tight tracking-tight text-bone sm:text-3xl">
            <Link
              href={`/work/${study.slug}`}
              style={titleTransition(study.slug)}
              className="after:absolute after:inset-0 after:content-[''] hover:text-signal focus-visible:text-signal"
            >
              {study.title}
            </Link>
          </h3>
          <p className="mt-3 max-w-[38ch] text-pretty text-muted">{study.kicker}</p>
          <p className="label mt-4">{study.role}</p>
          <div className="mt-6">
            <ReadLink slug={study.slug} />
          </div>
        </div>

        <div className={`lg:col-span-6 ${mirrored ? "lg:order-1 lg:col-start-1" : "lg:col-start-7"}`}>
          <blockquote className="max-w-[40ch] border-l border-line-bright pl-5 font-serif text-xl leading-[1.35] text-bone sm:text-2xl">
            {study.premise}
          </blockquote>
          <div className="mt-8 border-t border-line pt-6">
            <Metrics metrics={study.metrics} />
          </div>
          <div className="mt-6">
            <StackChips stack={study.stack} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function CaseStudies() {
  const [hero, ...rest] = caseStudies;

  return (
    <section id="work" className="relative scroll-mt-24 px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-16 md:mb-24" data-reveal>
          <p className="label">Selected work</p>
          <h2 className="mt-5 max-w-[22ch] text-balance text-3xl leading-tight tracking-tight text-bone sm:text-4xl">
            Three systems, each taken from the first line of code to the people using it.
          </h2>
        </header>

        <div className="flex flex-col gap-24 md:gap-32">
          {hero ? <HeroEntry study={hero} index={0} /> : null}
          {rest.map((study, i) => (
            <RowEntry key={study.slug} study={study} index={i + 1} mirrored={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CaseStudies;
