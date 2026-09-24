"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialCrm,
  openingChoices,
  openingMessages,
  steps,
  type Choice,
  type CrmPatch,
  type Message,
  type MessageKind,
  type Step,
} from "@/content/vyavsay-demo";

/** One rendered bubble. Flattened from `Message` so the view never re-derives it. */
export type ChatItem = {
  key: string;
  from: "customer" | "assistant";
  kind: MessageKind;
  body: string;
  duration?: string;
  filename?: string;
  time: string;
};

export type MatchedRow = { label: string; price: string; km: string };

/** The CRM fields that can flash when a patch lands. */
export type CrmField = "status" | "intent" | "interest" | "budget" | "matched" | "appointment";

export type CrmState = {
  status: string;
  customer: string;
  intent: string;
  interest: string;
  budget: string;
  matched: MatchedRow[];
  appointment: string;
  events: string[];
  /** Fields touched by the most recent patch. */
  changed: CrmField[];
  /** Increments on every patch so an unchanged field set still re-triggers the flash. */
  patch: number;
};

export type Phase = "idle" | "running" | "waiting" | "done";

export type Typing = { working?: string } | null;

export type ConversationState = {
  phase: Phase;
  thread: ChatItem[];
  typing: Typing;
  choices: Choice[];
  crm: CrmState;
  /** The script's wall clock, carried forward between steps. */
  clock: string;
  /** Text handed to the polite live region. */
  announce: string;
};

const BASE_CLOCK = "23:41";
const BETWEEN_REPLIES_MS = 320;
const OPENING_MS = 700;
const DEFAULT_TYPING_MS = 900;

const STEPS_BY_ID = new Map<string, Step>(steps.map((step) => [step.id, step]));

const EVENT_PATTERN = /^(\d{1,2}:\d{2})\s*·\s*(.*)$/;

/** Splits "23:41 · Intent classified" so the log can align times with tabular-nums. */
export function splitEvent(event: string): { time: string | null; text: string } {
  const match = EVENT_PATTERN.exec(event);
  if (!match) return { time: null, text: event };
  return { time: match[1] ?? null, text: match[2] ?? "" };
}

function eventTime(event: string | undefined): string | null {
  if (event === undefined) return null;
  return splitEvent(event).time;
}

function toItem(message: Message, time: string, index: number): ChatItem {
  return {
    key: `${message.id}-${index}`,
    from: message.from,
    kind: message.kind,
    body: message.body,
    duration: message.duration,
    filename: message.filename,
    time,
  };
}

function speaker(from: ChatItem["from"]): string {
  return from === "customer" ? "You" : "Assistant";
}

function announcementFor(item: ChatItem): string {
  const prefix = speaker(item.from);
  if (item.kind === "voice") return `${prefix} sent a voice note, ${item.duration ?? ""}: ${item.body}`;
  if (item.kind === "image") return `${prefix} sent a photo, ${item.filename ?? ""}: ${item.body}`;
  return `${prefix}: ${item.body}`;
}

function emptyState(): ConversationState {
  return {
    phase: "idle",
    thread: [],
    typing: null,
    choices: [],
    crm: {
      status: initialCrm.status,
      customer: initialCrm.customer,
      intent: initialCrm.intent,
      interest: initialCrm.interest,
      budget: initialCrm.budget,
      matched: [],
      appointment: initialCrm.appointment,
      events: [...initialCrm.events],
      changed: [],
      patch: 0,
    },
    clock: BASE_CLOCK,
    announce: "",
  };
}

/** Folds one step's patch into the CRM and records which fields moved. */
function applyPatch(crm: CrmState, patch: CrmPatch): CrmState {
  const changed: CrmField[] = [];
  const next: CrmState = { ...crm, patch: crm.patch + 1, changed };

  if (patch.status !== undefined && patch.status !== crm.status) {
    next.status = patch.status;
    changed.push("status");
  }
  if (patch.intent !== undefined && patch.intent !== crm.intent) {
    next.intent = patch.intent;
    changed.push("intent");
  }
  if (patch.interest !== undefined && patch.interest !== crm.interest) {
    next.interest = patch.interest;
    changed.push("interest");
  }
  if (patch.budget !== undefined && patch.budget !== crm.budget) {
    next.budget = patch.budget;
    changed.push("budget");
  }
  if (patch.appointment !== undefined && patch.appointment !== crm.appointment) {
    next.appointment = patch.appointment;
    changed.push("appointment");
  }
  if (patch.matched !== undefined) {
    next.matched = patch.matched;
    changed.push("matched");
  }
  if (patch.event !== undefined) {
    next.events = [...crm.events, patch.event];
  }

  return next;
}

/**
 * Lands reply `index` of `step`. The first reply is the moment the assistant has
 * finished working, so that is when the CRM patch and the step's clock apply.
 */
function withReply(previous: ConversationState, step: Step, index: number): ConversationState {
  const reply = step.replies[index];
  if (reply === undefined) return previous;

  const first = index === 0;
  const clock = first ? (eventTime(step.crm.event) ?? previous.clock) : previous.clock;
  const crm = first ? applyPatch(previous.crm, step.crm) : previous.crm;
  const item = toItem(reply, clock, previous.thread.length);

  return {
    ...previous,
    clock,
    crm,
    typing: null,
    thread: [...previous.thread, item],
    announce: announcementFor(item),
  };
}

function finish(previous: ConversationState, step: Step): ConversationState {
  const open = step.choices.length > 0;
  return {
    ...previous,
    typing: null,
    choices: step.choices,
    phase: open ? "waiting" : "done",
    announce: open ? previous.announce : `${previous.announce} — Conversation complete.`,
  };
}

/**
 * Drives the scripted thread. Nothing runs until the visitor starts it, every
 * timer is cancellable, and under reduced motion each step resolves in a single
 * state update with no typing delay at all.
 */
export function useConversation(reduced: boolean): {
  state: ConversationState;
  start: () => void;
  choose: (choice: Choice) => void;
  replay: () => void;
} {
  const [state, setState] = useState<ConversationState>(emptyState);
  const timers = useRef<number[]>([]);
  // Mirrors the phase so a second click in the same tick cannot double-fire a step.
  const phase = useRef<Phase>("idle");

  useEffect(() => {
    phase.current = state.phase;
  }, [state.phase]);

  const clear = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  }, []);

  useEffect(() => clear, [clear]);

  const playStep = useCallback(
    (stepId: string) => {
      const step = STEPS_BY_ID.get(stepId);
      if (step === undefined) return;

      if (reduced) {
        setState((previous) => {
          let next = previous;
          step.replies.forEach((_, index) => {
            next = withReply(next, step, index);
          });
          return finish(next, step);
        });
        return;
      }

      const runReply = (index: number): void => {
        const reply = step.replies[index];
        if (reply === undefined) {
          setState((previous) => finish(previous, step));
          return;
        }

        setState((previous) => ({
          ...previous,
          phase: "running",
          typing: { working: reply.working },
        }));

        after(reply.typingMs ?? DEFAULT_TYPING_MS, () => {
          setState((previous) => withReply(previous, step, index));
          after(BETWEEN_REPLIES_MS, () => runReply(index + 1));
        });
      };

      runReply(0);
    },
    [after, reduced],
  );

  const start = useCallback(() => {
    if (phase.current !== "idle") return;
    phase.current = "running";
    clear();

    const land = (previous: ConversationState): ConversationState => {
      const items = openingMessages.map((message, index) =>
        toItem(message, BASE_CLOCK, previous.thread.length + index),
      );
      return {
        ...previous,
        typing: null,
        thread: [...previous.thread, ...items],
        announce: items.map(announcementFor).join(" "),
      };
    };

    if (reduced) {
      setState((previous) => ({
        ...land(previous),
        phase: "waiting",
        choices: openingChoices,
      }));
      return;
    }

    setState((previous) => ({ ...previous, phase: "running", typing: {} }));
    after(OPENING_MS, () => {
      setState(land);
      after(BETWEEN_REPLIES_MS, () => {
        setState((previous) => ({ ...previous, phase: "waiting", choices: openingChoices }));
      });
    });
  }, [after, clear, reduced]);

  const choose = useCallback(
    (choice: Choice) => {
      if (phase.current !== "waiting") return;
      phase.current = "running";
      clear();

      setState((previous) => {
        const message: Message = { ...choice.send, id: choice.id, from: "customer" };
        const item = toItem(message, previous.clock, previous.thread.length);
        return {
          ...previous,
          choices: [],
          phase: "running",
          thread: [...previous.thread, item],
          announce: announcementFor(item),
        };
      });

      playStep(choice.next);
    },
    [clear, playStep],
  );

  const replay = useCallback(() => {
    clear();
    phase.current = "idle";
    setState(emptyState());
  }, [clear]);

  return { state, start, choose, replay };
}
