"use client";

import { useEffect, useRef } from "react";
import type { Choice, MessageKind } from "@/content/vyavsay-demo";
import { MessageBubble, TypingRow } from "./message-bubble";
import type { ConversationState } from "./use-conversation";

function KindIcon({ kind }: { kind: MessageKind }) {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-3.5 w-3.5 shrink-0",
    "aria-hidden": true,
  };

  if (kind === "voice") {
    return (
      <svg {...common}>
        <rect x="6" y="2" width="4" height="7" rx="2" />
        <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2" />
      </svg>
    );
  }
  if (kind === "image") {
    return (
      <svg {...common}>
        <path d="M1.5 5.5h3l1-2h5l1 2h3v8h-13z" />
        <circle cx="8" cy="9" r="2.4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M2 3h12v8H6.5L3 13.5V11H2z" />
    </svg>
  );
}

function ChoiceButton({ choice, onPick }: { choice: Choice; onPick: (choice: Choice) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(choice)}
      className="group flex min-w-0 items-center gap-2 border border-line-bright bg-surface px-3 py-2 text-left font-mono text-[11px] text-muted transition-colors hover:border-signal hover:bg-signal/10 hover:text-bone focus-visible:border-signal"
    >
      <span className="text-faint transition-colors group-hover:text-signal">
        <KindIcon kind={choice.kind} />
      </span>
      <span className="min-w-0">{choice.label}</span>
    </button>
  );
}

export function ChatPane({
  state,
  reduced,
  onStart,
  onPick,
  onReplay,
}: {
  state: ConversationState;
  reduced: boolean;
  onStart: () => void;
  onPick: (choice: Choice) => void;
  onReplay: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const count = state.thread.length;
  const typing = state.typing !== null;

  useEffect(() => {
    const element = scroller.current;
    if (element === null) return;
    element.scrollTo({ top: element.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [count, typing, reduced]);

  const idle = state.phase === "idle";

  return (
    <div className="flex min-w-0 flex-col border border-line bg-surface">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span
          aria-hidden
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-bright bg-raised font-mono text-[11px] text-muted"
        >
          GM
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] leading-tight text-bone">Girija Motors</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            Business account · Pune
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="label hidden sm:block">01 · WhatsApp</span>
          {idle ? null : (
            <button
              type="button"
              onClick={onReplay}
              className="border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-bright hover:text-bone"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      <div
        ref={scroller}
        className="h-[380px] overflow-y-auto overscroll-contain px-3 py-4 sm:h-[460px] sm:px-4"
      >
        {idle ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-2 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              23:41 · Showroom closed
            </p>
            <p className="max-w-[24rem] text-pretty text-[13px] leading-relaxed text-muted">
              A buyer messages the dealership&rsquo;s WhatsApp line after hours. You play the buyer
              — send a text, a Hinglish voice note or a photo, and watch the dealer&rsquo;s CRM fill
              in on the right.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="border border-signal bg-signal px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-void transition-colors hover:bg-transparent hover:text-signal"
            >
              Start the conversation
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {state.thread.map((item) => (
              <MessageBubble key={item.key} item={item} />
            ))}
            {state.typing === null ? null : <TypingRow working={state.typing.working} />}
          </ul>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {state.announce}
      </div>

      <footer className="border-t border-line bg-void px-3 py-3 sm:px-4">
        {state.choices.length > 0 ? (
          <>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
                style={{ animation: "vy-pulse 1.8s infinite ease-in-out" }}
              />
              Your turn — you are the buyer
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {state.choices.map((choice) => (
                <ChoiceButton key={choice.id} choice={choice} onPick={onPick} />
              ))}
            </div>
          </>
        ) : state.phase === "done" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ok">
                Conversation complete
              </p>
              <p className="mt-1 font-mono text-[11px] leading-5 text-faint">
                Booked at 23:44, without waking anyone at the dealership.
              </p>
            </div>
            <button
              type="button"
              onClick={onReplay}
              className="shrink-0 border border-signal px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-signal transition-colors hover:bg-signal hover:text-void"
            >
              Replay
            </button>
          </div>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            {idle ? "Waiting to start" : "Assistant is replying…"}
          </p>
        )}
      </footer>
    </div>
  );
}
