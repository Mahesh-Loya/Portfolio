import { profile } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
        <p className="font-mono text-[12px] text-faint">
          <span className="text-muted">{profile.name}</span> — {year}. Built with Next.js;{" "}
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-line text-muted transition-colors hover:border-signal hover:text-bone"
          >
            source on GitHub
          </a>
          .
        </p>
        <p className="font-mono text-[12px] text-faint">
          Set in Inter Tight, JetBrains Mono &amp; Instrument Serif.
        </p>
      </div>
    </footer>
  );
}
