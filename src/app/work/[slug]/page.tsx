import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ProductShot } from "@/components/product-shot";
import type { CaseStudy } from "@/content/site";
import { caseStudies } from "@/content/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);

  if (!study) {
    return { title: "Case study not found" };
  }

  return {
    title: study.title,
    description: study.kicker,
    openGraph: {
      type: "article",
      title: `${study.title} · Mahesh Loya`,
      description: study.premise,
      url: `/work/${study.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${study.title} · Mahesh Loya`,
      description: study.premise,
    },
  };
}

/*
 * Shared measurements. The page is one column of reading matter, so the
 * measure is fixed once here rather than guessed at per block, and every
 * section hangs off the same gutter and maximum width as the homepage
 * sections do.
 */
const SHELL = "px-6 md:px-10";
const COLUMN = "mx-auto w-full max-w-5xl";
const MEASURE = "max-w-[68ch]";

function num(i: number) {
  return String(i + 1).padStart(2, "0");
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10 flex items-center gap-4">
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-signal" />
      <p className="label whitespace-nowrap">{children}</p>
      <span aria-hidden="true" className="rule flex-1" />
    </div>
  );
}

/**
 * One engineering decision.
 *
 * The card is glass so it lifts off the ground, and it is laid out as an
 * argument: the problem and the solution sit beside each other as evidence,
 * and the insight gets the only gold-tinted surface on the page. That tint is
 * held at 5% — anything heavier drops gold-on-gold below AA in the light
 * theme, the same limit the offer cards work to.
 */
function Decision({ decision, index }: { decision: CaseStudy["decisions"][number]; index: number }) {
  return (
    /* The reveal lives on the wrapper, not the panel: [data-reveal] sets its
       own transition, and on the panel itself that would override the eased
       glass hover. */
    <div data-reveal>
      <article className="glass-panel p-6 sm:p-9 lg:p-12">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="font-mono text-[11px] leading-none tracking-[0.16em] text-signal">
            {num(index)}
          </span>
          <span aria-hidden="true" className="rule flex-1" />
        </div>

        <h3 className="mt-7 max-w-[30ch] text-balance text-2xl leading-[1.15] tracking-tight text-bone sm:text-3xl">
          <span className="sr-only">Decision {num(index)}: </span>
          {decision.title}
        </h3>

        <div className="mt-10 grid gap-8 border-t border-line pt-9 md:grid-cols-2 md:gap-12">
          <div>
            <p className="label mb-3">Problem</p>
            <p className={`${MEASURE} text-pretty text-[15px] leading-[1.75] text-muted`}>
              {decision.problem}
            </p>
          </div>
          <div>
            <p className="label mb-3">Solution</p>
            <p className={`${MEASURE} text-pretty text-[15px] leading-[1.75] text-muted`}>
              {decision.solution}
            </p>
          </div>
        </div>

        {/* The payoff. Everything above it is setup. */}
        <div className="mt-10 rounded-[14px] border border-signal/20 bg-signal/5 p-6 sm:p-8">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-[1px] bg-signal" />
            <p className="label text-signal">Insight</p>
          </div>
          <p className="mt-5 max-w-[48ch] text-balance font-serif text-2xl leading-[1.3] text-bone sm:text-[28px]">
            {decision.insight}
          </p>
        </div>
      </article>
    </div>
  );
}

/** Prev / next, as two panels rather than two hairline links. */
function StudyLink({
  study,
  direction,
  className,
}: {
  study: CaseStudy;
  direction: "prev" | "next";
  className?: string;
}) {
  const next = direction === "next";
  return (
    <Link
      href={`/work/${study.slug}`}
      className={`glass-panel group flex min-h-[7rem] flex-col justify-between p-6 sm:p-8 motion-safe:hover:-translate-y-1 ${
        next ? "sm:items-end sm:text-right" : ""
      } ${className ?? ""}`}
    >
      <span className="label inline-flex items-center gap-2">
        {next ? null : (
          <span
            aria-hidden="true"
            className="transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:-translate-x-1"
          >
            &#8592;
          </span>
        )}
        {next ? "Next case study" : "Previous case study"}
        {next ? (
          <span
            aria-hidden="true"
            className="transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:translate-x-1"
          >
            &#8594;
          </span>
        ) : null}
      </span>
      <span className="mt-5 max-w-[24ch] text-balance text-xl leading-tight tracking-tight text-bone transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:text-signal sm:text-2xl">
        {study.title}
      </span>
    </Link>
  );
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const index = caseStudies.findIndex((s) => s.slug === slug);
  if (index === -1) notFound();

  const study = caseStudies[index];
  if (!study) notFound();

  const prev = index > 0 ? caseStudies[index - 1] : undefined;
  const next = index < caseStudies.length - 1 ? caseStudies[index + 1] : undefined;

  return (
    <>
      <Nav />

      <main id="main">
        {/* ── header ──────────────────────────────────────────────── */}
        {/* pt clears the fixed bar (h-14 / md:h-16) with room to spare. */}
        <section className={`ambient relative ${SHELL} pt-28 pb-4 md:pt-36`}>
          <div className={COLUMN}>
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
              All work
            </Link>

            <header className="mt-12 md:mt-16" data-reveal>
              <p className="label">{study.period}</p>
              <h1
                style={{ viewTransitionName: `cs-title-${study.slug}` }}
                className="mt-6 max-w-[16ch] text-balance text-4xl leading-[0.98] tracking-tight text-bone sm:text-5xl lg:text-6xl"
              >
                {study.title}
              </h1>
              <p className="mt-7 max-w-[50ch] text-pretty text-lg leading-relaxed text-muted md:text-xl">
                {study.kicker}
              </p>
              <p className="label mt-7">{study.role}</p>
            </header>

            {/*
             * The register of facts. Each cell is a column with the value
             * pinned to the top and the label under it, so a label long
             * enough to wrap — "Telephony accounts needed to test" — grows
             * downwards instead of shoving its own value onto a second line
             * and knocking the row off its baseline.
             */}
            <div className="mt-14 md:mt-16" data-reveal data-reveal-delay="80">
              <dl className="glass-panel grid grid-cols-2 gap-x-8 gap-y-9 p-6 sm:grid-cols-4 sm:p-9">
                {study.metrics.map((m) => (
                  <div key={m.label} className="flex min-w-0 flex-col gap-2.5">
                    <dd className="order-first text-2xl leading-none tracking-tight text-bone tabular-nums md:text-3xl">
                      {m.value}
                    </dd>
                    <dt className="label text-pretty break-words">{m.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <div
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4"
              data-reveal
              data-reveal-delay="140"
            >
              <ul className="flex flex-wrap items-center gap-2">
                {study.stack.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-line bg-surface/40 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.06em] text-faint"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                {study.live ? (
                  <a
                    href={study.live}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-signal/20 bg-signal/5 px-4 font-mono text-[11px] tracking-[0.14em] text-signal uppercase transition-[color,border-color] duration-500 ease-[var(--ease-out-expo)] hover:border-signal/55 focus-visible:border-signal/55"
                  >
                    View live
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                    >
                      &#8599;
                    </span>
                  </a>
                ) : null}
                {study.repo ? (
                  <a
                    href={study.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line-bright bg-surface/40 px-4 font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-[color,border-color] duration-500 ease-[var(--ease-out-expo)] hover:border-line-bright hover:text-bone focus-visible:text-bone"
                  >
                    Source
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                    >
                      &#8599;
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ── the shipped thing ───────────────────────────────────── */}
        {study.shot ? (
          <section className={`${SHELL} pt-20 md:pt-28`}>
            <figure className={COLUMN} data-reveal>
              <ProductShot src={study.shot.src} alt={study.shot.alt} priority />
              <figcaption className="label mt-5">The shipped product</figcaption>
            </figure>
          </section>
        ) : null}

        {/* ── context ─────────────────────────────────────────────── */}
        <section className={`${SHELL} pt-24 md:pt-36`}>
          <div className={COLUMN} data-reveal>
            <SectionLabel>Context</SectionLabel>
            <p className={`${MEASURE} text-pretty text-lg leading-[1.8] text-muted md:text-xl`}>
              {study.context}
            </p>
          </div>
        </section>

        {/*
         * ── premise ──────────────────────────────────────────────
         * The one sentence the whole project reduces to, so it is given a
         * stage: its own light, rules above and below, and display-size
         * serif set to the widest measure on the page. Nothing else here
         * competes with the h1 for scale.
         */}
        <section className={`ambient relative ${SHELL} pt-28 md:pt-40`}>
          <div className={COLUMN}>
            <figure data-reveal>
              <div aria-hidden="true" className="rule" />
              <blockquote className="py-16 md:py-24">
                <p className="max-w-[22ch] text-balance font-serif text-[2.25rem] leading-[1.1] text-bone sm:text-5xl md:max-w-[20ch] md:text-6xl lg:text-[4.25rem]">
                  {study.premise}
                </p>
              </blockquote>
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-12 shrink-0 bg-signal/60" />
                <figcaption className="label">The premise</figcaption>
                <span aria-hidden="true" className="rule flex-1" />
              </div>
            </figure>
          </div>
        </section>

        {/* ── architecture ────────────────────────────────────────── */}
        <section className={`${SHELL} pt-28 md:pt-40`}>
          <div className={COLUMN} data-reveal>
            <SectionLabel>Architecture</SectionLabel>
            <p className={`${MEASURE} mb-12 text-pretty leading-[1.75] text-muted`}>
              The system end to end, one stage at a time. Step through it — each stage says what it
              does and what it runs on.
            </p>
            <ArchitectureDiagram pipeline={study.pipeline} />
          </div>
        </section>

        {/* ── decisions ───────────────────────────────────────────── */}
        <section className={`ambient relative ${SHELL} pt-32 md:pt-48`}>
          <div className={COLUMN}>
            <div data-reveal>
              <SectionLabel>Engineering decisions</SectionLabel>
              <p className={`${MEASURE} mb-14 text-pretty leading-[1.75] text-muted md:mb-20`}>
                The choices that shaped the build, and what each one turned out to be teaching.
              </p>
            </div>
            <div className="flex flex-col gap-8 md:gap-10">
              {study.decisions.map((decision, i) => (
                <Decision key={decision.title} decision={decision} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── prev / next ─────────────────────────────────────────── */}
        <section className={`${SHELL} pt-32 pb-28 md:pt-44 md:pb-40`}>
          <nav aria-label="Case studies" className={COLUMN} data-reveal>
            <div className="mb-10 flex items-center gap-4">
              <p className="label whitespace-nowrap">Keep reading</p>
              <span aria-hidden="true" className="rule flex-1" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {prev ? <StudyLink study={prev} direction="prev" /> : null}
              {next ? (
                <StudyLink
                  study={next}
                  direction="next"
                  className={prev ? "" : "sm:col-start-2"}
                />
              ) : null}
            </div>

            <Link
              href="/#work"
              className="group mt-12 inline-flex min-h-11 items-center gap-2.5 font-mono text-[11px] tracking-[0.14em] text-faint uppercase transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
            >
              <span
                aria-hidden="true"
                className="transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:-translate-x-1"
              >
                &#8592;
              </span>
              Back to all work
            </Link>
          </nav>
        </section>
      </main>

      <Footer />
    </>
  );
}
