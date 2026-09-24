"use client";

import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/content/site";
import { ShaderField } from "./shader-field";
import { Stagger, StaggerItem } from "./motion/stagger";
import { Parallax } from "./motion/parallax";

const NAME_CHARS = Array.from(profile.name);

/** Total name entrance stays under 900ms: 10 steps x 30ms + 520ms duration. */
const CHAR_STEP = 0.03;
const CHAR_DURATION = 0.52;

/**
 * The hero arrives as a sequence, not as a single event: chip, then the name,
 * then everything that supports it. The name runs on its own per-character
 * clock, so it is given the gap between index 0 and index 3 to itself and the
 * body copy starts landing while its last characters are still settling —
 * overlapped rather than queued, which is what keeps ~1.6s of choreography from
 * feeling like a wait.
 */
const SEQUENCE_DELAY = 0.06;
const SEQUENCE_STEP = 0.085;
const NAME_DELAY = 0.18;

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
    <Stagger
      as="section"
      id="main"
      aria-label="Introduction"
      className="relative isolate flex min-h-svh flex-col overflow-hidden"
      trigger="mount"
      delay={SEQUENCE_DELAY}
      step={SEQUENCE_STEP}
    >
      {/* Background: the field resolving from noise into signal. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          maskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
        }}
      >
        {/* A 2.5% upward drift on scroll — enough to separate the field from the
            type it sits behind, far too little to read as an effect. It moves
            up rather than down so the uncovered edge is the bottom one, which
            the mask has already faded to nothing. */}
        <Parallax className="absolute inset-0" distance={-2.5}>
          {/* Held back so the resolved waveform reads as texture behind the
              type rather than competing with it for the same space. */}
          <ShaderField className="absolute inset-0 opacity-[0.42]" />
        </Parallax>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
        {/* Availability — a statement of fact, not a sales line. */}
        <StaggerItem index={0} className="w-fit max-w-full">
          {/* Reads as a lit chip sitting on the page: gradient fill, hairline
              top highlight, one soft shadow. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-line-bright/70 bg-gradient-to-b from-raised/75 to-surface/45 py-2 pl-3.5 pr-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.28),0_12px_26px_-16px_rgb(0_0_0/0.65)] backdrop-blur-md sm:rounded-full">
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
        </StaggerItem>

        {/* Name — the dominant typographic element. */}
        <h1
          aria-label={profile.name}
          className="mt-9 font-sans font-medium leading-[0.86] tracking-[-0.04em] text-bone sm:mt-12"
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
                    delay: NAME_DELAY + i * CHAR_STEP,
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
        <StaggerItem as="p" index={3} className="label mt-6 text-muted sm:mt-7">
          {profile.role} <span className="text-line-bright">/</span> {profile.location}
        </StaggerItem>

        <div className="mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
          {/* The pitch — what he builds, in the words someone deciding whether
              to hire him would use. First thing read after the name. */}
          <StaggerItem
            as="p"
            index={4}
            className="max-w-[46ch] font-sans leading-[1.35] tracking-[-0.015em] text-pretty text-muted"
            style={{ fontSize: "clamp(1.35rem, 2.6vw, 1.95rem)" }}
          >
            {pitchParts.before}
            {pitchParts.emphasis ? (
              <span className="text-bone">{pitchParts.emphasis}</span>
            ) : null}
            {pitchParts.after}
          </StaggerItem>

          {/* The thesis, demoted to a quiet aside — still the best line on the
              site, no longer the first argument the site makes. */}
          <StaggerItem
            index={5}
            className="max-w-[34ch] border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-1"
          >
            <p
              className="font-serif leading-[1.18] tracking-[-0.01em] text-pretty text-muted"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
            >
              {profile.thesis}
            </p>
          </StaggerItem>
        </div>

        {/* Actions — see the work, start a conversation, read the résumé. */}
        <StaggerItem
          index={6}
          className="mt-11 flex flex-wrap items-center gap-x-3 gap-y-3 sm:mt-12"
        >
          {/* The single most considered control on the page: flat gold so the
              small dark label keeps its contrast, depth from a top highlight
              and a cast shadow rather than from a glow. */}
          <a
            href="#demo"
            className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-signal px-6 font-mono text-[0.8125rem] text-void shadow-[inset_0_1px_0_rgb(255_255_255/0.30),0_1px_2px_rgb(0_0_0/0.35),0_14px_30px_-16px_rgb(0_0_0/0.75)] transition-[filter,box-shadow,transform] duration-500 ease-[var(--ease-out-expo)] hover:brightness-[1.06] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.38),0_1px_2px_rgb(0_0_0/0.35),0_22px_44px_-18px_rgb(0_0_0/0.80)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
          >
            See it work
            <svg
              aria-hidden="true"
              viewBox="0 0 12 10"
              className="h-2.5 w-3 fill-current transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:translate-x-1"
            >
              <path d="M7 0 6.3.7 10.1 4.5H0v1h10.1L6.3 9.3 7 10l5-5z" />
            </svg>
          </a>

          <a
            href="#contact"
            className="inline-flex min-h-12 items-center rounded-full border border-line-bright bg-gradient-to-b from-raised/70 to-surface/40 px-6 font-mono text-[0.8125rem] text-bone shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.25)] backdrop-blur-md transition-[color,border-color,box-shadow,transform] duration-500 ease-[var(--ease-out-expo)] hover:border-signal/60 hover:text-signal hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_16px_34px_-20px_rgb(0_0_0/0.75)] motion-safe:hover:-translate-y-0.5"
          >
            Get in touch
          </a>

          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-mono text-[0.8125rem] text-muted transition-[color,background-color] duration-500 ease-[var(--ease-out-expo)] hover:bg-surface/60 hover:text-bone"
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
              className="inline-flex min-h-12 items-center font-mono text-[0.75rem] text-faint underline decoration-line-bright underline-offset-4 transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone hover:decoration-signal"
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center font-mono text-[0.75rem] text-faint underline decoration-line-bright underline-offset-4 transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone hover:decoration-signal"
            >
              LinkedIn
            </a>
          </nav>
        </StaggerItem>

        {/* Stack — for the recruiter scanning rather than reading. */}
        <StaggerItem
          index={7}
          className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2.5"
        >
          <span className="label mr-1">Stack</span>
          {profile.heroStack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-line bg-surface/40 px-3 py-1.5 font-mono text-[0.6875rem] leading-none text-faint transition-colors duration-500 ease-[var(--ease-out-expo)] hover:border-line-bright hover:text-muted"
            >
              {item}
            </span>
          ))}
        </StaggerItem>
      </div>

      {/* Scroll cue */}
      <div className="mx-auto w-full max-w-6xl px-6 pb-10 sm:px-8">
        <StaggerItem index={8} className="flex items-center gap-3">
          <span className="label">Scroll</span>
          <span aria-hidden className="h-px w-14 bg-gradient-to-r from-line-bright to-transparent" />
          <motion.span
            aria-hidden
            className="block h-1 w-1 rounded-full bg-signal"
            animate={reduced ? undefined : { x: [0, 14, 0], opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </StaggerItem>
      </div>
    </Stagger>
  );
}
