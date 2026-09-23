import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
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

function num(i: number) {
  return String(i + 1).padStart(2, "0");
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <p className="label whitespace-nowrap">{children}</p>
      <span aria-hidden="true" className="rule flex-1" />
    </div>
  );
}

function Decision({ decision, index }: { decision: CaseStudy["decisions"][number]; index: number }) {
  return (
    <article className="grid gap-6 md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-8" data-reveal>
      <p
        aria-hidden="true"
        className="font-mono text-[11px] leading-none tracking-[0.16em] text-signal md:pt-2"
      >
        {num(index)}
      </p>

      <div>
        <h3 className="max-w-[28ch] text-balance text-xl leading-snug tracking-tight text-bone sm:text-2xl">
          <span className="sr-only">Decision {num(index)}: </span>
          {decision.title}
        </h3>

        <div className="mt-8 space-y-7 border-l border-line pl-6">
          <div>
            <p className="label mb-2">Problem</p>
            <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted md:text-base">
              {decision.problem}
            </p>
          </div>
          <div>
            <p className="label mb-2">Solution</p>
            <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted md:text-base">
              {decision.solution}
            </p>
          </div>
        </div>

        {/* The quotable part. Given the weight it earns. */}
        <div className="mt-9 border-l-2 border-signal bg-surface px-6 py-7 md:px-8 md:py-8">
          <p className="label mb-3 text-signal">Insight</p>
          <p className="max-w-[46ch] text-balance font-serif text-xl leading-[1.35] text-bone sm:text-2xl">
            {decision.insight}
          </p>
        </div>
      </div>
    </article>
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
    <main id="main" className="px-6 pb-32 md:px-10">

      <div className="mx-auto w-full max-w-5xl">
        {/* ── header ──────────────────────────────────────────────── */}
        <header className="pt-16 md:pt-24">
          <Link
            href="/#work"
            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-faint uppercase transition-colors hover:text-signal"
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">
              &#8592;
            </span>
            All work
          </Link>

          <div className="mt-12 md:mt-16">
            <p className="label">{study.period}</p>
            <h1
              style={{ viewTransitionName: `cs-title-${study.slug}` }}
              className="mt-5 max-w-[16ch] text-balance text-4xl leading-[0.98] tracking-tight text-bone sm:text-5xl lg:text-6xl"
            >
              {study.title}
            </h1>
            <p className="mt-6 max-w-[50ch] text-pretty text-lg text-muted md:text-xl">
              {study.kicker}
            </p>
            <p className="label mt-6">{study.role}</p>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-y border-line py-8 sm:grid-cols-4">
            {study.metrics.map((m) => (
              <div key={m.label}>
                <dt className="label mb-2">{m.label}</dt>
                <dd className="text-xl tracking-tight text-bone tabular-nums md:text-2xl">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ul className="flex flex-wrap items-center gap-1.5">
              {study.stack.map((item) => (
                <li
                  key={item}
                  className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.06em] text-faint"
                >
                  {item}
                </li>
              ))}
            </ul>
            {study.live ? (
              <a
                href={study.live}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 border-b border-signal pb-0.5 font-mono text-[11px] tracking-[0.14em] text-signal uppercase"
              >
                View live
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
                className="group inline-flex items-center gap-2 border-b border-line-bright pb-0.5 font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-bone"
              >
                Source
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  &#8599;
                </span>
              </a>
            ) : null}
          </div>
        </header>

        {/* ── the shipped thing ───────────────────────────────────── */}
        {study.shot ? (
          <figure className="mt-20 md:mt-24" data-reveal>
            <ProductShot src={study.shot.src} alt={study.shot.alt} priority />
            <figcaption className="label mt-5">The shipped product</figcaption>
          </figure>
        ) : null}

        {/* ── context ─────────────────────────────────────────────── */}
        <section className={study.shot ? "mt-20 md:mt-28" : "mt-28 md:mt-36"} data-reveal>
          <SectionLabel>Context</SectionLabel>
          <p className="max-w-[68ch] text-pretty text-lg leading-[1.75] text-muted md:text-xl md:leading-[1.7]">
            {study.context}
          </p>
        </section>

        {/* ── premise ─────────────────────────────────────────────── */}
        <section className="mt-24 md:mt-32" data-reveal>
          <figure className="border-y border-line py-16 md:py-24">
            <blockquote>
              <p className="max-w-[24ch] text-balance font-serif text-3xl leading-[1.18] text-bone sm:text-4xl md:max-w-[20ch] md:text-5xl lg:text-6xl">
                {study.premise}
              </p>
            </blockquote>
            <figcaption className="label mt-10">The premise</figcaption>
          </figure>
        </section>

        {/* ── architecture ────────────────────────────────────────── */}
        <section className="mt-24 md:mt-32" data-reveal>
          <SectionLabel>Architecture</SectionLabel>
          <p className="mb-10 max-w-[68ch] text-[15px] leading-relaxed text-muted md:text-base">
            The system end to end, one stage at a time. Step through it — each stage says what it
            does and what it runs on.
          </p>
          <ArchitectureDiagram pipeline={study.pipeline} />
        </section>

        {/* ── decisions ───────────────────────────────────────────── */}
        <section className="mt-28 md:mt-40">
          <div data-reveal>
            <SectionLabel>Engineering decisions</SectionLabel>
            <p className="mb-16 max-w-[68ch] text-[15px] leading-relaxed text-muted md:mb-20 md:text-base">
              The choices that shaped the build, and what each one turned out to be teaching.
            </p>
          </div>
          <div className="flex flex-col gap-20 md:gap-28">
            {study.decisions.map((decision, i) => (
              <Decision key={decision.title} decision={decision} index={i} />
            ))}
          </div>
        </section>

        {/* ── prev / next ─────────────────────────────────────────── */}
        <nav aria-label="Case studies" className="mt-32 border-t border-line pt-10 md:mt-40">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            {prev ? (
              <Link href={`/work/${prev.slug}`} className="group max-w-[24ch]">
                <p className="label mb-3">&#8592; Previous</p>
                <p className="text-xl tracking-tight text-bone transition-colors group-hover:text-signal sm:text-2xl">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {next ? (
              <Link href={`/work/${next.slug}`} className="group max-w-[24ch] sm:text-right">
                <p className="label mb-3">Next &#8594;</p>
                <p className="text-xl tracking-tight text-bone transition-colors group-hover:text-signal sm:text-2xl">
                  {next.title}
                </p>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>

          <Link
            href="/#work"
            className="mt-14 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-faint uppercase transition-colors hover:text-signal"
          >
            <span aria-hidden="true">&#8592;</span>
            Back to all work
          </Link>
        </nav>
      </div>
    </main>
  );
}
