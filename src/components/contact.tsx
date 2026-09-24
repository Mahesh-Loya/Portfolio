"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/site";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Pre-filled subject, so an enquiry arrives already labelled. */
const MAILTO = `mailto:${profile.email}?subject=Project%20enquiry`;

const LINKS = [
  { label: "GitHub", href: profile.github, hint: profile.githubHandle, download: false },
  { label: "LinkedIn", href: profile.linkedin, hint: profile.linkedinHandle, download: false },
  { label: "Resume", href: profile.resumeUrl, hint: "PDF", download: true },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 6h7M6.5 3l3 3-3 3" />
    </svg>
  );
}

function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(formatter.format(new Date()));
    tick();

    let interval: number | undefined;
    const msToMinute = (60 - new Date().getSeconds()) * 1000;
    const timeout = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, 60_000);
    }, msToMinute);

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  return (
    <span className="font-mono text-[12px] text-faint">
      {profile.location} — <time suppressHydrationWarning>{time ?? "--:--"}</time> IST
    </span>
  );
}

/**
 * Glass rule (stated in full in `work.tsx`): the address block is a discrete
 * object and gets glass; the statement above it is running prose and the links
 * below it are controls, so neither takes a surface.
 *
 * Rhythm: close tier — py-20 md:py-28, content mt-12. The serif statement is
 * the one sanctioned exception to the heading scale, held below the Work
 * heading so the spine still leads.
 */
export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = () => {
    void copyText(profile.email).then((ok) => {
      if (!ok) return;
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <section id="contact" className="ambient relative border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 md:py-28">
        <p data-reveal className="label">
          Contact
        </p>

        <h2
          data-reveal
          className="mt-5 max-w-[24ch] text-balance font-serif text-[2rem] leading-[1.12] text-bone sm:text-4xl md:text-[2.75rem]"
        >
          If you&apos;re building something that has to work in the real world, I&apos;d like to
          hear about it.
        </h2>

        <p
          data-reveal
          data-reveal-delay="80"
          className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted sm:text-base"
        >
          I take on freelance project work and full-time roles. Email is the most reliable way
          to reach me.
        </p>

        {/* Email first, as one large target: tapping it opens a mail app. */}
        <div
          data-reveal
          data-reveal-delay="120"
          className="glass-panel mt-12 px-5 py-8 sm:px-9 sm:py-10 lg:px-11 lg:py-12"
        >
          <a
            href={MAILTO}
            aria-label={`Email ${profile.email}`}
            className="group flex items-start gap-3 text-bone transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-signal sm:items-center sm:gap-4"
          >
            <span className="min-w-0 break-words font-mono text-[1.375rem] leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
              {profile.email}
            </span>
            <span
              aria-hidden="true"
              className="mt-1.5 shrink-0 text-faint transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:text-signal sm:mt-0"
            >
              <ArrowIcon />
            </span>
          </a>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* Controls: a border and a hover, never a surface of their own. */}
            <a
              href={MAILTO}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-line-bright px-6 text-[14px] text-bone transition-[color,border-color] duration-500 ease-[var(--ease-out-expo)] hover:border-signal hover:text-signal"
            >
              Send an email
            </a>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex min-h-[48px] cursor-pointer items-center rounded-xl border border-line px-6 font-mono text-[12px] uppercase tracking-[0.14em] transition-[border-color] duration-500 ease-[var(--ease-out-expo)] hover:border-line-bright"
            >
              <span className={copied ? "text-signal" : "text-muted"}>
                {copied ? "Copied" : "Copy address"}
              </span>
            </button>
          </div>

          <span aria-live="polite" className="sr-only">
            {copied ? "Email address copied to clipboard" : ""}
          </span>
        </div>

        <div
          data-reveal
          data-reveal-delay="200"
          className="mt-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-6"
        >
          <ul className="flex flex-wrap gap-x-10 gap-y-1">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(link.download
                    ? { download: "", rel: "noopener" }
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="group inline-flex min-h-[44px] items-baseline gap-2 py-3 text-[15px] text-muted transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone"
                >
                  <span className="border-b border-line pb-1 transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:border-signal">
                    {link.label}
                  </span>
                  <span className="font-mono text-[11px] text-faint">{link.hint}</span>
                </a>
              </li>
            ))}
          </ul>

          <LocalTime />
        </div>
      </div>
    </section>
  );
}
