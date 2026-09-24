import { profile } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-gradient-to-b from-surface/40 to-transparent shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:px-8 sm:py-12">
        <p className="font-mono text-[12px] leading-relaxed text-faint">
          <span className="text-muted">{profile.name}</span> — {year}. Built with Next.js;{" "}
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-line pb-0.5 text-muted transition-colors duration-500 ease-[var(--ease-out-expo)] hover:border-signal hover:text-bone"
          >
            source on GitHub
          </a>
          .
        </p>
        <p className="font-mono text-[12px] leading-relaxed text-faint">
          Set in Inter Tight, JetBrains Mono &amp; Instrument Serif.
        </p>
      </div>
    </footer>
  );
}
