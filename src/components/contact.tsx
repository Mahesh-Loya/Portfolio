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

const LINKS = [
  { label: "GitHub", href: profile.github, hint: profile.githubHandle, download: false },
  { label: "LinkedIn", href: profile.linkedin, hint: "in/mahesh-loya", download: false },
  { label: "Resume", href: profile.resumeUrl, hint: "PDF", download: true },
];

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
    <section id="contact" className="relative border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-36">
        <p data-reveal className="label">
          Contact
        </p>

        <h2
          data-reveal
          className="mt-6 max-w-3xl text-balance font-serif text-4xl leading-[1.1] text-bone sm:text-5xl md:text-6xl"
        >
          If you&apos;re building something that has to work in the real world, I&apos;d like to
          hear about it.
        </h2>

        <div data-reveal data-reveal-delay="120" className="mt-14">
          <button
            type="button"
            onClick={onCopy}
            className="group flex w-full items-center justify-between gap-6 border-y border-line py-6 text-left transition-colors hover:border-line-bright"
          >
            <span className="min-w-0 truncate font-mono text-xl tracking-tight text-bone transition-colors sm:text-3xl md:text-4xl">
              {profile.email}
            </span>
            <span
              aria-hidden="true"
              className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                copied ? "text-signal" : "text-faint group-hover:text-muted"
              }`}
            >
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
          <span aria-live="polite" className="sr-only">
            {copied ? "Email address copied to clipboard" : ""}
          </span>
        </div>

        <div
          data-reveal
          data-reveal-delay="200"
          className="mt-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-8"
        >
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(link.download
                    ? { download: "", rel: "noopener" }
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="group inline-flex items-baseline gap-2 text-[15px] text-muted transition-colors hover:text-bone"
                >
                  <span className="border-b border-line pb-0.5 transition-colors group-hover:border-signal">
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
