"use client";

import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/content/site";
import { ShaderField } from "./shader-field";

const NAME_CHARS = Array.from(profile.name);

/** Total name entrance stays under 900ms: 10 steps x 30ms + 520ms duration. */
const CHAR_STEP = 0.03;
const CHAR_DURATION = 0.52;

/**
 * The clause a stranger has to leave with. It is split out of the pitch at
 * render time rather than stored as two fields, so the copy stays one readable
 * sentence in content — and if it is ever rewritten, the fallback prints the
 * pitch unchanged instead of dropping half of it.
 */
const PITCH_EMPHASIS = "AI products that businesses actually use";

const pitchIndex = profile.pitch.indexOf(PITCH_EMPHASIS);
const pitchParts =
  pitchIndex === -1
    ? { before: profile.pitch, emphasis: "", after: "" }
    : {
        before: profile.pitch.slice(0, pitchIndex),
        emphasis: PITCH_EMPHASIS,
        after: profile.pitch.slice(pitchIndex + PITCH_EMPHASIS.length),
      };

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
        {/* Held back so the resolved waveform reads as texture behind the
            type rather than competing with it for the same space. */}
        <ShaderField className="absolute inset-0 opacity-[0.42]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
        {/* Availability — a statement of fact, not a sales line. */}
        <div data-reveal className="w-fit max-w-full">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-2xl border border-line bg-surface/70 py-1.5 pl-3 pr-4 backdrop-blur-sm sm:rounded-full">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-bone">
              {profile.status.label}
            </span>
            <span aria-hidden className="hidden h-3 w-px bg-line-bright sm:block" />
            <span className="font-mono text-[0.6875rem] text-faint">
              {profile.status.detail}
            </span>
          </div>
        </div>

        {/* Name — the dominant typographic element. */}
        <h1
          aria-label={profile.name}
          className="mt-8 font-sans font-medium leading-[0.86] tracking-[-0.04em] text-bone sm:mt-11"
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
        {/* Sits over the brightest part of the shader, so it needs more
            contrast than the default label grey. */}
        <p data-reveal data-reveal-delay="220" className="label mt-5 text-muted sm:mt-6">
          {profile.role} <span className="text-line-bright">/</span> {profile.location}
        </p>

        <div className="mt-7 grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
          {/* The pitch — what he builds, in the words someone deciding whether
              to hire him would use. First thing read after the name. */}
          <p
            data-reveal
            data-reveal-delay="300"
            className="max-w-[46ch] font-sans leading-[1.35] tracking-[-0.015em] text-pretty text-muted"
            style={{ fontSize: "clamp(1.35rem, 2.6vw, 1.95rem)" }}
          >
            {pitchParts.before}
            {pitchParts.emphasis ? (
              <span className="text-bone">{pitchParts.emphasis}</span>
            ) : null}
            {pitchParts.after}
          </p>

          {/* The thesis, demoted to a quiet aside — still the best line on the
              site, no longer the first argument the site makes. */}
          <div
            data-reveal
            data-reveal-delay="380"
            className="max-w-[34ch] border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-1"
          >
            <p
              className="font-serif leading-[1.18] tracking-[-0.01em] text-pretty text-muted"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
            >
              {profile.thesis}
            </p>
          </div>
        </div>

        {/* Actions — see the work, start a conversation, read the résumé. */}
        <div
          data-reveal
          data-reveal-delay="460"
          className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-3 sm:mt-10"
        >
          <a
            href="#demo"
            className="group inline-flex min-h-11 items-center gap-2.5 rounded-full bg-signal px-5 font-mono text-[0.8125rem] text-void transition-[filter,transform] duration-200 hover:brightness-110 active:translate-y-px"
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
            href="#contact"
            className="inline-flex min-h-11 items-center rounded-full border border-line-bright px-5 font-mono text-[0.8125rem] text-bone transition-colors duration-200 hover:border-signal hover:text-signal"
          >
            Get in touch
          </a>

          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-mono text-[0.8125rem] text-muted transition-colors duration-200 hover:text-bone"
          >
            Résumé
            <svg aria-hidden="true" viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-current">
              <path d="M2 0v1h5.3L0 8.3.7 9 8 1.7V7h1V0z" />
            </svg>
          </a>

          <span aria-hidden className="mx-1 hidden h-4 w-px bg-line sm:block" />

          <nav aria-label="Profiles" className="flex items-center gap-4">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-mono text-[0.75rem] text-faint underline decoration-line-bright underline-offset-4 transition-colors hover:text-bone hover:decoration-signal"
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-mono text-[0.75rem] text-faint underline decoration-line-bright underline-offset-4 transition-colors hover:text-bone hover:decoration-signal"
            >
              LinkedIn
            </a>
          </nav>
        </div>

        {/* Stack — for the recruiter scanning rather than reading. */}
        <div
          data-reveal
          data-reveal-delay="540"
          className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2"
        >
          <span className="label mr-1">Stack</span>
          {profile.heroStack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.6875rem] leading-none text-faint"
            >
              {item}
            </span>
          ))}
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
