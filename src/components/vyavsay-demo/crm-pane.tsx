"use client";

import { useEffect, useRef, useState } from "react";
import { splitEvent, type ConversationState, type CrmField, type CrmState } from "./use-conversation";

const LADDER = ["New", "Engaged", "Qualified"] as const;

const FLASH_MS = 1100;

/**
 * True for a moment after a patch touches this field. Disabled outright under
 * reduced motion — a flash is exactly the kind of thing that request is about.
 */
function useFlash(active: boolean, patch: number, enabled: boolean): boolean {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!enabled || !active || patch === 0) {
      setOn(false);
      return;
    }
    setOn(true);
    const timer = window.setTimeout(() => setOn(false), FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [active, patch, enabled]);

  return on;
}

function touched(crm: CrmState, field: CrmField | null): boolean {
  return field !== null && crm.changed.includes(field);
}

function Field({
  label,
  value,
  field,
  crm,
  enabled,
}: {
  label: string;
  value: string;
  /** null for a field no patch can change, so it never flashes. */
  field: CrmField | null;
  crm: CrmState;
  enabled: boolean;
}) {
  const flash = useFlash(touched(crm, field), crm.patch, enabled);
  const empty = value === "—";

  return (
    <div
      className={`grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 border-l-2 py-1.5 pl-2.5 transition-colors duration-500 sm:grid-cols-[6.5rem_minmax(0,1fr)] ${
        flash ? "border-signal bg-signal/[0.09]" : "border-transparent bg-transparent"
      }`}
    >
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</dt>
      <dd
        className={`min-w-0 break-words font-mono text-[12px] leading-5 tabular-nums ${
          empty ? "text-faint" : "text-bone"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusLadder({ crm, enabled }: { crm: CrmState; enabled: boolean }) {
  const flash = useFlash(touched(crm, "status"), crm.patch, enabled);
  const current = LADDER.findIndex((stage) => stage === crm.status);

  return (
    <div
      className={`border-l-2 pl-2.5 transition-colors duration-500 ${
        flash ? "border-signal bg-signal/[0.09]" : "border-transparent"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Status</p>
      <ol className="mt-1.5 flex items-stretch gap-1">
        {LADDER.map((stage, index) => {
          const reached = index <= current;
          const here = index === current;
          return (
            <li
              key={stage}
              aria-current={here ? "step" : undefined}
              className={`min-w-0 flex-1 border px-2 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-500 ${
                here
                  ? "border-signal bg-signal/15 text-signal"
                  : reached
                    ? "border-line-bright bg-void text-muted"
                    : "border-line bg-void text-faint"
              }`}
            >
              <span className="block truncate">{stage}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MatchedRows({ crm, enabled }: { crm: CrmState; enabled: boolean }) {
  const flash = useFlash(touched(crm, "matched"), crm.patch, enabled);

  return (
    <section
      className={`border-l-2 pl-2.5 transition-colors duration-500 ${
        flash ? "border-signal bg-signal/[0.09]" : "border-transparent"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          Matched inventory
        </p>
        <span className="font-mono text-[10px] tabular-nums text-faint">
          {String(crm.matched.length).padStart(2, "0")} rows
        </span>
      </div>

      {crm.matched.length === 0 ? (
        <p className="mt-1.5 font-mono text-[11px] leading-5 text-faint">
          Nothing matched yet — the assistant has not searched the stock list.
        </p>
      ) : (
        <ul className="mt-1.5 border-t border-line">
          {crm.matched.map((row) => (
            <li
              key={row.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-line py-1.5 last:border-b-0"
              style={{ animation: "vy-log-in 420ms var(--ease-out-expo) both" }}
            >
              <span className="min-w-0 truncate font-mono text-[11px] text-bone" title={row.label}>
                {row.label}
              </span>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-signal">
                {row.price}
              </span>
              <span className="col-span-2 font-mono text-[10px] tabular-nums text-faint">
                {row.km}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityLog({ events, reduced }: { events: string[]; reduced: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    if (element === null) return;
    element.scrollTo({ top: element.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [events.length, reduced]);

  return (
    <section className="border-t border-line">
      <div className="flex items-baseline justify-between gap-3 px-4 pt-3.5 sm:px-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Activity log</p>
        <span className="font-mono text-[10px] tabular-nums text-faint">
          {String(events.length).padStart(2, "0")} entries
        </span>
      </div>
      <div
        ref={scroller}
        className="max-h-[9.5rem] overflow-y-auto overscroll-contain px-4 pb-4 pt-2 sm:px-5"
      >
        <ol className="space-y-1">
          {events.map((event, index) => {
            const { time, text } = splitEvent(event);
            const latest = index === events.length - 1;
            return (
              <li
                key={`${index}-${event}`}
                className="grid grid-cols-[3.2rem_minmax(0,1fr)] gap-2 font-mono text-[11px] leading-5"
                style={{ animation: "vy-log-in 420ms var(--ease-out-expo) both" }}
              >
                <span className="tabular-nums text-faint">{time ?? "—"}</span>
                <span className={`min-w-0 break-words ${latest ? "text-bone" : "text-muted"}`}>
                  {text}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function CrmPane({ state, reduced }: { state: ConversationState; reduced: boolean }) {
  const { crm } = state;
  const enabled = !reduced;
  const live = state.phase === "running" || state.phase === "waiting";

  return (
    <div className="flex min-w-0 flex-col border border-line bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-[13px] leading-tight text-bone">Dealer CRM</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            Lead record · fills in as the thread runs
          </p>
        </div>
        <span
          className={`flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] ${
            live ? "text-signal" : "text-faint"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${live ? "bg-signal" : "bg-line-bright"}`}
            style={live && !reduced ? { animation: "vy-pulse 1.8s infinite ease-in-out" } : undefined}
          />
          <span className="hidden sm:inline">02 · </span>
          {live ? "Live" : "Idle"}
        </span>
      </header>

      <div className="flex-1 px-4 py-4 sm:px-5">
        <StatusLadder crm={crm} enabled={enabled} />

        <dl className="mt-3 divide-y divide-line border-t border-line">
          <Field label="Customer" value={crm.customer} field={null} crm={crm} enabled={enabled} />
          <Field label="Intent" value={crm.intent} field="intent" crm={crm} enabled={enabled} />
          <Field label="Interest" value={crm.interest} field="interest" crm={crm} enabled={enabled} />
          <Field label="Budget" value={crm.budget} field="budget" crm={crm} enabled={enabled} />
          <Field
            label="Appointment"
            value={crm.appointment}
            field="appointment"
            crm={crm}
            enabled={enabled}
          />
        </dl>

        <div className="mt-4">
          <MatchedRows crm={crm} enabled={enabled} />
        </div>
      </div>

      <ActivityLog events={crm.events} reduced={reduced} />
    </div>
  );
}
