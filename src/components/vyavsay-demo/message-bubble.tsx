"use client";

import { useId, useState } from "react";
import type { ChatItem } from "./use-conversation";

/**
 * A fixed, deterministic waveform. Generated from a sine mix rather than
 * Math.random so server and client render the same bars, and so nothing about
 * it pretends to be derived from real audio.
 */
const WAVEFORM: number[] = Array.from({ length: 28 }, (_, i) => {
  const value =
    Math.sin(i * 1.7) * 0.5 + Math.sin(i * 0.53 + 1.1) * 0.34 + Math.sin(i * 2.9) * 0.16;
  return Math.round(20 + Math.abs(value) * 66);
});

function Waveform({ tone }: { tone: "customer" | "assistant" }) {
  return (
    <span aria-hidden className="flex h-7 min-w-0 flex-1 items-center gap-[2px]">
      {WAVEFORM.map((height, i) => (
        <span
          key={i}
          className={`min-w-0 flex-1 ${tone === "customer" ? "bg-signal/55" : "bg-line-bright"}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </span>
  );
}

/**
 * A voice note with no audio behind it. The affordance opens the transcript and
 * says so — the clip itself is not part of this reconstruction, and faking
 * playback would be the one lie this demo cannot afford.
 */
function VoiceBody({ item }: { item: ChatItem }) {
  const [open, setOpen] = useState(false);
  const transcriptId = useId();
  const tone = item.from;

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={transcriptId}
        className="group flex w-full min-w-0 flex-col gap-1.5 text-left"
      >
        <span className="flex w-full min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
              tone === "customer"
                ? "border-signal/50 bg-signal/10 text-signal group-hover:bg-signal/20"
                : "border-line-bright bg-void text-muted group-hover:text-bone"
            }`}
          >
            <svg viewBox="0 0 10 12" className="h-3 w-2.5 fill-current">
              <path d="M0 0 L10 6 L0 12 Z" />
            </svg>
          </span>
          <Waveform tone={tone} />
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
            {item.duration ?? "—"}
          </span>
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
            open ? "text-signal" : "text-faint group-hover:text-muted"
          }`}
        >
          {open ? "Transcript" : "Show transcript · audio not included"}
        </span>
        <span className="sr-only">
          Voice note, {item.duration ?? "unknown length"}. {open ? "Hide" : "Show"} transcript. This
          reconstruction has no audio.
        </span>
      </button>

      <p
        id={transcriptId}
        hidden={!open}
        className="mt-2 border-l-2 border-signal/40 pl-3 text-[13px] leading-relaxed text-bone"
      >
        {item.body}
      </p>
    </div>
  );
}

/**
 * The photo the customer sent. There is no real photograph here, so the frame
 * draws an abstract silhouette and labels itself a placeholder.
 */
function ImageBody({ item }: { item: ChatItem }) {
  return (
    <figure className="min-w-0">
      <div className="relative overflow-hidden rounded-md border border-line bg-void">
        <svg
          viewBox="0 0 324 152"
          role="img"
          aria-label="Placeholder for a customer photo: an abstract line silhouette of an SUV."
          className="block h-auto w-full"
        >
          <defs>
            <radialGradient id="vy-photo-glow" cx="50%" cy="58%" r="62%">
              <stop offset="0%" stopColor="var(--color-line-bright)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--color-void)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="324" height="152" fill="var(--color-surface)" />
          <rect width="324" height="152" fill="url(#vy-photo-glow)" />
          <g
            fill="none"
            stroke="var(--color-line-bright)"
            strokeWidth="1.25"
            strokeLinejoin="round"
            opacity="0.85"
          >
            <path d="M18 130 L18 108 Q18 98 30 95 L88 82 L124 52 Q130 46 140 46 L206 46 Q218 46 226 54 L262 88 L296 96 Q306 99 306 110 L306 130" />
            <path d="M96 80 L128 56 Q132 52 138 52 L168 52 L168 79 Z" />
            <path d="M178 52 L206 52 Q214 52 220 58 L242 79 L178 79 Z" />
            <circle cx="84" cy="130" r="21" />
            <circle cx="240" cy="130" r="21" />
          </g>
          <g stroke="var(--color-line)" strokeWidth="1" opacity="0.6">
            <path d="M0 130.5 L324 130.5" />
          </g>
        </svg>
        <span className="absolute left-2 top-2 rounded-sm border border-line-bright bg-void/85 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
          Placeholder
        </span>
      </div>
      <figcaption className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono text-[10px] text-faint">
        <span className="min-w-0 break-all text-muted">{item.filename ?? "photo.jpg"}</span>
        <span aria-hidden>·</span>
        <span>no photograph in this reconstruction</span>
      </figcaption>
      <p className="mt-2 text-[13px] leading-relaxed text-bone">{item.body}</p>
    </figure>
  );
}

const KIND_LABEL: Record<ChatItem["kind"], string> = {
  text: "Message",
  voice: "Voice note",
  image: "Photo",
};

export function MessageBubble({ item }: { item: ChatItem }) {
  const mine = item.from === "customer";

  return (
    <li
      className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}
      style={{ animation: "vy-bubble-in 340ms var(--ease-out-expo) both" }}
    >
      <div
        className={`min-w-0 max-w-[88%] rounded-lg border px-3 py-2.5 sm:max-w-[80%] ${
          mine
            ? "rounded-tr-[3px] border-signal/35 bg-signal/[0.07]"
            : "rounded-tl-[3px] border-line bg-raised"
        }`}
      >
        <div className="mb-1.5 flex items-baseline gap-2">
          <span
            className={`font-mono text-[9px] uppercase tracking-[0.16em] ${
              mine ? "text-signal" : "text-faint"
            }`}
          >
            {mine ? "You" : "Assistant"}
            {item.kind === "text" ? "" : ` · ${KIND_LABEL[item.kind]}`}
          </span>
          <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-faint">
            {item.time}
          </span>
        </div>

        {item.kind === "voice" ? (
          <VoiceBody item={item} />
        ) : item.kind === "image" ? (
          <ImageBody item={item} />
        ) : (
          <p className="min-w-0 break-words text-[13px] leading-relaxed text-bone">{item.body}</p>
        )}
      </div>
    </li>
  );
}

/** The indicator between messages, carrying the assistant's working line. */
export function TypingRow({ working }: { working?: string }) {
  return (
    <li className="flex w-full justify-start" style={{ animation: "vy-bubble-in 220ms both" }}>
      <div className="flex min-w-0 items-center gap-3 rounded-lg rounded-tl-[3px] border border-line bg-raised px-3 py-2.5">
        <span aria-hidden className="flex shrink-0 items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-signal"
              style={{ animation: `vy-dot 1.1s ${i * 160}ms infinite ease-in-out` }}
            />
          ))}
        </span>
        {working === undefined ? null : (
          <span className="min-w-0 break-words font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            {working}
          </span>
        )}
      </div>
    </li>
  );
}
