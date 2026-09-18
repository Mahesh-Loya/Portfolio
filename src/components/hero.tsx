"use client";

import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/content/site";
import { ShaderField } from "./shader-field";

const NAME_CHARS = Array.from(profile.name);

/** Total name entrance stays under 900ms: 10 steps x 30ms + 520ms duration. */
const CHAR_STEP = 0.03;
const CHAR_DURATION = 0.52;

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="main"
      aria-label="Introduction"
      className="relative isolate flex min-h-svh flex-col overflow-hidden"
    >
      {/* Background: the field resolving from noise into signal. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          maskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
        }}
      >
        <ShaderField className="absolute inset-0" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-16 pt-32 sm:px-8 sm:pt-36">
        {/* Availability */}
        <div data-reveal className="w-fit">
          <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface/70 py-1.5 pl-3 pr-4 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-bone">
              {profile.status.label}
            </span>
            <span aria-hidden className="h-3 w-px bg-line-bright" />
            <span className="font-mono text-[0.6875rem] text-faint">
              {profile.status.detail}
            </span>
          </div>
        </div>

        {/* Name — the dominant typographic element. */}
        <h1
          aria-label={profile.name}
          className="mt-9 font-sans font-medium leading-[0.86] tracking-[-0.04em] text-bone sm:mt-11"
          style={{ fontSize: "clamp(3.1rem, 11.5vw, 9.5rem)" }}
        >
          <span aria-hidden="true" className="inline-block">
            {NAME_CHARS.map((char, i) =>
              char === " " ? (
                <span key={i} className="inline-block w-[0.26em]" />
              ) : reduced ? (
                <span key={i} className="inline-block">
                  {char}
                </span>
              ) : (
                <motion.span
                  key={i}
                  className="inline-block will-change-transform"
                  initial={{ opacity: 0, y: "0.32em", filter: "blur(7px)" }}
                  animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
                  transition={{
                    duration: CHAR_DURATION,
                    delay: i * CHAR_STEP,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {char}
                </motion.span>
              ),
            )}
          </span>
        </h1>

        {/* Role / place, set as structural metadata. */}
        <p data-reveal data-reveal-delay="220" className="label mt-6">
          {profile.role} <span className="text-line-bright">/</span> {profile.location}
        </p>

        <div className="mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
          {/* The thesis — the actual headline idea. */}
          <p
            data-reveal
            data-reveal-delay="300"
            className="max-w-[16ch] font-serif leading-[1.02] tracking-[-0.01em] text-balance text-bone"
            style={{ fontSize: "clamp(2rem, 5.2vw, 3.6rem)" }}
          >
            {profile.thesis}
          </p>

          {/* Supporting line, rewritten tight from the summary. */}
          <p
            data-reveal
            data-reveal-delay="380"
            className="max-w-[46ch] text-pretty text-[0.95rem] leading-relaxed text-muted lg:pb-2"
          >
            Final-year IT student shipping AI-native products end to end — from the
            data model to deployment to the iteration after launch.
          </p>
        </div>

        {/* Actions */}
        <div
          data-reveal
          data-reveal-delay="460"
          className="mt-11 flex flex-wrap items-center gap-x-3 gap-y-4"
        >
          <a
            href="#demo"
            className="group inline-flex items-center gap-2.5 rounded-full bg-signal px-5 py-2.5 font-mono text-[0.8125rem] text-void transition-[filter,transform] duration-200 hover:brightness-110 active:translate-y-px"
          >
            See it work
            <svg
              aria-hidden="true"
              viewBox="0 0 12 10"
              className="h-2.5 w-3 fill-current transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M7 0 6.3.7 10.1 4.5H0v1h10.1L6.3 9.3 7 10l5-5z" />
            </svg>
          </a>

          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-line-bright px-5 py-2.5 font-mono text-[0.8125rem] text-bone transition-colors duration-200 hover:border-signal hover:text-signal"
          >
            Résumé
            <svg aria-hidden="true" viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-current">
              <path d="M2 0v1h5.3L0 8.3.7 9 8 1.7V7h1V0z" />
            </svg>
          </a>

          <span aria-hidden className="mx-1 hidden h-4 w-px bg-line sm:block" />

          <nav aria-label="Profiles" className="flex items-center gap-5">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.75rem] text-faint underline decoration-line-bright underline-offset-4 transition-colors hover:text-bone hover:decoration-signal"
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.75rem] text-faint underline decoration-line-bright underline-offset-4 transition-colors hover:text-bone hover:decoration-signal"
            >
              LinkedIn
            </a>
          </nav>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="mx-auto w-full max-w-6xl px-6 pb-10 sm:px-8">
        <div data-reveal data-reveal-delay="620" className="flex items-center gap-3">
          <span className="label">Scroll</span>
          <span aria-hidden className="h-px w-14 bg-gradient-to-r from-line-bright to-transparent" />
          <motion.span
            aria-hidden
            className="block h-1 w-1 rounded-full bg-signal"
            animate={reduced ? undefined : { x: [0, 14, 0], opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
