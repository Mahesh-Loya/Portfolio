"use client";

import { useReducedMotion } from "motion/react";
import { demoDisclosure } from "@/content/vyavsay-demo";
import { ChatPane } from "./chat-pane";
import { CrmPane } from "./crm-pane";
import { useConversation } from "./use-conversation";

/**
 * Vyavsay Assist, driven by the visitor.
 *
 * The live product cannot be embedded — the app does not render inside an
 * iframe and the dealer CRM sits behind a login — so this reconstructs the one
 * thing that matters: a customer messaging after hours in text, Hinglish voice
 * or a photo, and the dealership's lead record filling in behind it.
 *
 * Every reply is scripted from `@/content/vyavsay-demo`. Nothing calls a model,
 * no audio plays, and the photo is a drawn placeholder. The disclosure below
 * the panes says exactly that and is not optional.
 */
export function VyavsayDemo({ className }: { className?: string }) {
  const reduced = Boolean(useReducedMotion());
  const { state, start, choose, replay } = useConversation(reduced);

  return (
    <div className={`min-w-0 ${className ?? ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="label">Playable reconstruction</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          WhatsApp thread · dealer CRM
        </p>
      </div>

      <p className="mt-3 max-w-2xl text-pretty text-[14px] leading-relaxed text-muted">
        A buyer messages the showroom at 11:41pm, long after it has closed. Send the message
        yourself — plain text, a Hinglish voice note or a photo of a car — and watch the lead record
        on the right build itself while the reply is written.
      </p>

      <div
        className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-stretch"
        data-reveal
      >
        <ChatPane
          state={state}
          reduced={reduced}
          onStart={start}
          onPick={choose}
          onReplay={replay}
        />
        <CrmPane state={state} reduced={reduced} />
      </div>

      <p className="mt-4 max-w-3xl font-mono text-[11px] leading-[1.85] text-faint">
        {demoDisclosure}
      </p>

      <style>{`
        @keyframes vy-bubble-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes vy-log-in {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes vy-dot {
          0%, 60%, 100% { opacity: 0.28; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes vy-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}

export default VyavsayDemo;
