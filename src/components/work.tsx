import Link from "next/link";
import type { BuildLogEntry, CaseStudy } from "@/content/site";
import { alsoOnGithub, buildLog, caseStudies, profile } from "@/content/site";
import { LivePanel } from "./live-panel";
import { VyavsayDemo } from "./vyavsay-demo";

/**
 * One section for the whole body of work.
 *
 * Every project is a panel, and wherever the thing itself can be shown — a
 * screenshot, or the running site — the panel contains it rather than
 * describing it. Visible prose is held to roughly two lines per project; the
 * longer context stays in the content file and comes out behind a disclosure,
 * or is left to the detail page. Nothing is deleted, nothing is dumped.
 */

const VISIBLE_STACK = 5;

/**
 * The shared surface for a panel that isn't holding a live frame: a generous
 * radius, a gentle top-lit fill instead of a flat one, a hairline highlight
 * along the top edge and a layered shadow underneath. The point is that the
 * panel sits on the page rather than being drawn onto it. Tuned to sit one
 * step quieter than `.glass-panel`, which is reserved for the live frames.
 */
const PANEL =
  "rounded-[18px] border border-line bg-gradient-to-b from-raised/70 to-surface/20 " +
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.26),0_18px_44px_-24px_rgb(0_0_0/0.60)] " +
  "transition-[border-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] " +
  "hover:border-line-bright " +
  "hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_1px_2px_rgb(0_0_0/0.26),0_28px_60px_-28px_rgb(0_0_0/0.72)]";

function ordinal(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * Paired with the same name on the detail page heading, so a browser that
 * supports view transitions morphs the title across the navigation. Browsers
 * without it simply ignore the property.
 */
function titleTransition(slug: string): React.CSSProperties {
  return { viewTransitionName: `cs-title-${slug}` };
}

/** The first sentence stays on the page; the remainder folds away. */
function splitLead(text: string): { lead: string; rest: string } {
  const match = /^([\s\S]+?[.?!])\s+([\s\S]+)$/.exec(text);
  if (!match) return { lead: text, rest: "" };
  return { lead: match[1] ?? text, rest: match[2] ?? "" };
}

/** The escape valve for length: the content is still here, just not all at once. */
function More({ label = "More on this", children }: { label?: string; children: React.ReactNode }) {
  return (
    <details className="group/more mt-2">
      <summary className="label inline-flex min-h-[44px] cursor-pointer list-none items-center gap-2 transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="font-mono text-signal transition-transform duration-500 ease-[var(--ease-out-expo)] group-open/more:rotate-45"
        >
          +
        </span>
        {label}
      </summary>
      <p className="mt-1 max-w-[62ch] text-pretty text-sm leading-relaxed text-faint">{children}</p>
    </details>
  );
}

function StackChips({ items, cap = VISIBLE_STACK }: { items: string[]; cap?: number }) {
  const shown = items.slice(0, cap);
  const rest = items.length - shown.length;
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {shown.map((item) => (
        <li
          key={item}
          className="rounded-md border border-line bg-surface/40 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.06em] text-faint"
        >
          {item}
        </li>
      ))}
      {rest > 0 ? (
        <li className="px-1 py-1.5 font-mono text-[10px] tracking-[0.06em] text-faint">
          +{rest} more
        </li>
      ) : null}
    </ul>
  );
}

function Metrics({ metrics, size = "sm" }: { metrics: CaseStudy["metrics"]; size?: "sm" | "lg" }) {
  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-6 sm:gap-x-14">
      {metrics.map((m) => (
        <div key={m.label} className="min-w-0">
          <dt className="label mb-2">{m.label}</dt>
          <dd
            className={`tracking-tight text-bone tabular-nums ${
              size === "lg" ? "text-2xl md:text-3xl" : "text-xl"
            }`}
          >
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Marks work that is actually deployed — the strongest signal on a panel. */
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

function Marker({ index, accent = false }: { index: number; accent?: boolean }) {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.16em] ${accent ? "text-signal" : "text-faint"}`}
    >
      {ordinal(index)}
    </span>
  );
}

/**
 * A real, focusable link rather than the decorative one the old cards used:
 * these panels hold disclosures and embedded frames, so no overlay may cover
 * them.
 */
function CaseLink({ slug, title }: { slug: string; title: string }) {
  return (
    <Link
      href={`/work/${slug}`}
      className="group/link inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
    >
      Read the case study
      <span className="sr-only"> for {title}</span>
      <span
        aria-hidden="true"
        className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/link:translate-x-1"
      >
        &#8594;
      </span>
    </Link>
  );
}

function RepoLinks({ entry }: { entry: BuildLogEntry }) {
  if (!entry.repo && !entry.live) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
      {entry.repo ? (
        <a
          href={entry.repo}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[44px] items-center font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
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
          className="inline-flex min-h-[44px] items-center font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
        >
          Open live
          <span className="sr-only"> site for {entry.name}</span>
        </a>
      ) : null}
    </div>
  );
}

/* ── 01 · the feature panel ─────────────────────────────────────────────── */

/** The most prominence on the page: full measure, the product shot, the metrics. */
function FeaturePanel({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <article className={`${PANEL} p-6 sm:p-10 lg:p-14`} data-reveal>
      <div className="rule mb-9" />
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <Marker index={index} accent />
        <span className="label">{study.period}</span>
        <span aria-hidden="true" className="label text-line-bright">
          &#183;
        </span>
        <span className="label">{study.role}</span>
        {study.live ? <LiveTag /> : null}
      </div>

      <h3 className="mt-7 text-balance text-4xl leading-[0.98] tracking-tight text-bone sm:text-5xl lg:text-6xl">
        <Link
          href={`/work/${study.slug}`}
          style={titleTransition(study.slug)}
          className="transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
        >
          {study.title}
        </Link>
      </h3>
      <p className="mt-5 max-w-[46ch] text-pretty text-lg text-muted">{study.kicker}</p>

      {/* The flagship cannot be embedded live, so it is played instead. */}
      <div className="mt-12 md:mt-14">
        <VyavsayDemo />
      </div>

      <div className="mt-14 grid gap-12 border-t border-line pt-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <div>
          <blockquote className="max-w-[34ch] text-balance font-serif text-2xl leading-[1.28] text-bone sm:text-3xl">
            {study.premise}
          </blockquote>
          <More>{study.context}</More>
        </div>
        <div className="flex flex-col gap-9">
          <Metrics metrics={study.metrics} size="lg" />
          <StackChips items={study.stack} />
          <CaseLink slug={study.slug} title={study.title} />
        </div>
      </div>
    </article>
  );
}

/* ── 02 · the editorial panel ───────────────────────────────────────────── */

/**
 * Nothing to screenshot and nothing to embed — a real-time voice pipeline has
 * no picture. So rather than a card with a hole in it, the premise is set
 * large and carries the panel, with the facts beside it as a plain register.
 */
function EditorialPanel({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <article className={`${PANEL} p-6 sm:p-10 lg:p-12`} data-reveal data-reveal-delay="80">
      <div className="rule mb-9" />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <Marker index={index} />
            <span className="label">{study.period}</span>
            {study.live ? <LiveTag /> : null}
          </div>
          <blockquote className="mt-6 max-w-[26ch] text-balance font-serif text-3xl leading-[1.14] text-bone sm:text-4xl lg:text-[2.75rem]">
            {study.premise}
          </blockquote>
        </div>

        <div className="flex flex-col lg:col-span-5 lg:pt-1">
          <h3 className="text-2xl leading-tight tracking-tight text-bone sm:text-3xl">
            <Link
              href={`/work/${study.slug}`}
              style={titleTransition(study.slug)}
              className="transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
            >
              {study.title}
            </Link>
          </h3>
          <p className="mt-4 max-w-[38ch] text-pretty text-muted">{study.kicker}</p>
          <p className="label mt-5">{study.role}</p>
          <More>{study.context}</More>
          <div className="mt-6">
            <CaseLink slug={study.slug} title={study.title} />
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-7 border-t border-line pt-10">
        <Metrics metrics={study.metrics} />
        <StackChips items={study.stack} />
      </div>
    </article>
  );
}

/* ── 03–05 · the live panels ────────────────────────────────────────────── */

/** The instrument frame: glass, corner brackets, and a running thing inside it. */
function LiveFrame({
  mirrored,
  media,
  children,
}: {
  mirrored: boolean;
  media: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel bracketed p-5 sm:p-7 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className={`lg:col-span-7 ${mirrored ? "lg:order-2 lg:col-start-6" : ""}`}>{media}</div>
        <div className={`flex flex-col lg:col-span-5 ${mirrored ? "lg:order-1 lg:col-start-1" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** A case study whose live site was verified to render inside a frame. */
function LiveStudyPanel({
  study,
  index,
  url,
  note,
  mirrored,
}: {
  study: CaseStudy;
  index: number;
  url: string;
  note?: string;
  mirrored: boolean;
}) {
  return (
    <article data-reveal data-reveal-delay="60">
      <LiveFrame
        mirrored={mirrored}
        media={<LivePanel url={url} poster={study.shot} title={study.title} note={note} />}
      >
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <Marker index={index} />
          <span className="label">{study.period}</span>
          {study.live ? <LiveTag /> : null}
        </div>
        <h3 className="mt-4 text-balance text-xl leading-tight tracking-tight text-bone sm:text-2xl">
          <Link
            href={`/work/${study.slug}`}
            style={titleTransition(study.slug)}
            className="transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
          >
            {study.title}
          </Link>
        </h3>
        <p className="mt-4 max-w-[40ch] text-pretty text-sm text-muted">{study.kicker}</p>
        <blockquote className="mt-6 max-w-[34ch] border-l-2 border-signal/30 py-1 pl-5 font-serif text-lg leading-[1.35] text-bone">
          {study.premise}
        </blockquote>
        <More>{study.context}</More>

        <div className="mt-auto flex flex-col gap-6 pt-10">
          <Metrics metrics={study.metrics} />
          <StackChips items={study.stack} cap={4} />
          <CaseLink slug={study.slug} title={study.title} />
        </div>
      </LiveFrame>
    </article>
  );
}

/** A build-log entry whose live site was verified to render inside a frame. */
function LiveEntryPanel({
  entry,
  index,
  url,
  note,
  mirrored,
}: {
  entry: BuildLogEntry;
  index: number;
  url: string;
  note?: string;
  mirrored: boolean;
}) {
  const { lead, rest } = splitLead(entry.blurb);

  return (
    <article data-reveal data-reveal-delay="60">
      <LiveFrame
        mirrored={mirrored}
        media={<LivePanel url={url} poster={entry.shot} title={entry.name} note={note} />}
      >
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <Marker index={index} />
          <LiveTag />
        </div>
        <h3 className="mt-4 text-xl leading-tight tracking-tight text-bone sm:text-2xl">
          {entry.name}
        </h3>
        <p className="mt-4 max-w-[40ch] text-pretty text-sm leading-relaxed text-muted">{lead}</p>
        {rest ? <More>{rest}</More> : null}

        <div className="mt-auto flex flex-col gap-6 pt-10">
          <StackChips items={entry.tech} cap={4} />
          <RepoLinks entry={entry} />
        </div>
      </LiveFrame>
    </article>
  );
}

/* ── 06 · the compact panel ─────────────────────────────────────────────── */

/** Nothing to show and nothing to embed, so it takes the least room on the page. */
function CompactPanel({ entry, index }: { entry: BuildLogEntry; index: number }) {
  const { lead, rest } = splitLead(entry.blurb);

  return (
    <article className={`${PANEL} p-6 sm:p-8 lg:p-10`} data-reveal data-reveal-delay="40">
      <div className="grid gap-7 lg:grid-cols-12 lg:gap-14">
        <div className="flex items-baseline gap-4 lg:col-span-4">
          <Marker index={index} />
          <h3 className="text-lg leading-tight tracking-tight text-bone sm:text-xl">{entry.name}</h3>
        </div>
        <div className="lg:col-span-8">
          <p className="max-w-[58ch] text-pretty text-sm leading-relaxed text-muted">{lead}</p>
          {rest ? <More>{rest}</More> : null}
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
            <StackChips items={entry.tech} />
            <RepoLinks entry={entry} />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── the running order ──────────────────────────────────────────────────── */

type Slot =
  | { kind: "feature"; key: string; study: CaseStudy }
  | { kind: "editorial"; key: string; study: CaseStudy }
  | { kind: "live-study"; key: string; study: CaseStudy; url: string; note?: string }
  | { kind: "live-entry"; key: string; entry: BuildLogEntry; url: string; note?: string }
  | { kind: "compact"; key: string; entry: BuildLogEntry };

function findStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

function findEntry(name: string): BuildLogEntry | undefined {
  return buildLog.find((entry) => entry.name === name);
}

/**
 * Projects are looked up by slug and by name, never by position, and a missing
 * one is skipped rather than rendered empty — so a content edit can reorder or
 * remove work without breaking the page. An entry that has lost its verified
 * embed degrades to a text treatment instead of framing nothing.
 */
function runningOrder(): Slot[] {
  const slots: Slot[] = [];

  const feature = findStudy("vyavsay-assist");
  if (feature) slots.push({ kind: "feature", key: feature.slug, study: feature });

  const voice = findStudy("voice-ai-receptionist");
  if (voice) slots.push({ kind: "editorial", key: voice.slug, study: voice });

  const yojna = findEntry("YojnaMitra");
  if (yojna) {
    slots.push(
      yojna.embed
        ? {
            kind: "live-entry",
            key: yojna.name,
            entry: yojna,
            url: yojna.embed.url,
            note: yojna.embed.note ?? "The live site, running here",
          }
        : { kind: "compact", key: yojna.name, entry: yojna },
    );
  }

  const blood = findStudy("blood-donation-drive");
  if (blood) {
    slots.push(
      blood.embed
        ? {
            kind: "live-study",
            key: blood.slug,
            study: blood,
            url: blood.embed.url,
            note: blood.embed.note ?? "The platform itself, running here",
          }
        : { kind: "editorial", key: blood.slug, study: blood },
    );
  }

  const anvesha = findEntry("Anvesha");
  if (anvesha) {
    slots.push(
      anvesha.embed
        ? {
            kind: "live-entry",
            key: anvesha.name,
            entry: anvesha,
            url: anvesha.embed.url,
            note: anvesha.embed.note ?? "Playable here — press Space to begin",
          }
        : { kind: "compact", key: anvesha.name, entry: anvesha },
    );
  }

  const agent = findEntry("BA Support Agent");
  if (agent) slots.push({ kind: "compact", key: agent.name, entry: agent });

  return slots;
}

function renderSlot(slot: Slot, index: number) {
  switch (slot.kind) {
    case "feature":
      return <FeaturePanel key={slot.key} study={slot.study} index={index} />;
    case "editorial":
      return <EditorialPanel key={slot.key} study={slot.study} index={index} />;
    case "live-study":
      return (
        <LiveStudyPanel
          key={slot.key}
          study={slot.study}
          index={index}
          url={slot.url}
          note={slot.note}
          mirrored={index % 2 === 1}
        />
      );
    case "live-entry":
      return (
        <LiveEntryPanel
          key={slot.key}
          entry={slot.entry}
          index={index}
          url={slot.url}
          note={slot.note}
          mirrored={index % 2 === 1}
        />
      );
    case "compact":
      return <CompactPanel key={slot.key} entry={slot.entry} index={index} />;
  }
}

export function Work() {
  const slots = runningOrder();

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="ambient relative scroll-mt-24 px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-20 md:mb-28" data-reveal>
          <p className="label">Work</p>
          <h2
            id="work-heading"
            className="mt-6 max-w-[22ch] text-balance text-3xl leading-tight tracking-tight text-bone sm:text-4xl"
          >
            Six projects, each one here to be opened rather than read about.
          </h2>
          <p className="mt-6 max-w-[54ch] text-pretty text-muted">
            Three of them are running live on this page; the rest link to the code, or to the
            full write-up.
          </p>
        </header>

        <div className="flex flex-col gap-16 md:gap-24">{slots.map(renderSlot)}</div>

        <div
          className={`${PANEL} mt-20 flex flex-wrap items-center gap-x-8 gap-y-2 px-6 py-4 sm:px-8 md:mt-28`}
          data-reveal
        >
          <span className="label">Also on GitHub</span>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {alsoOnGithub.map((repo) => (
              <li key={repo.name}>
                <a
                  href={repo.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex min-h-[44px] items-center font-mono text-xs text-faint transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone focus-visible:text-bone"
                >
                  {repo.name}
                  <span className="ml-2 text-line-bright transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:text-faint">
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
            className="ml-auto inline-flex min-h-[44px] items-center font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal focus-visible:text-signal"
          >
            All repositories &#8594;
          </a>
        </div>
      </div>
    </section>
  );
}

export default Work;
