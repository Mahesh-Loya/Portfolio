"use client";

import type { FormEvent } from "react";

export type Example = {
  text: string;
  /** Marks the query where meaning and constraints disagree. */
  tension?: boolean;
  note: string;
};

type QueryBarProps = {
  value: string;
  running: boolean;
  examples: Example[];
  onChange: (value: string) => void;
  onSubmit: () => void;
  onPick: (value: string) => void;
};

export function QueryBar({
  value,
  running,
  examples,
  onChange,
  onSubmit,
  onPick,
}: QueryBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!running) onSubmit();
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="glass flex items-stretch transition-colors focus-within:border-[var(--color-signal)]"
      >
        <span className="label hidden items-center border-r border-line px-4 sm:flex">Ask</span>
        <label htmlFor="glass-box-query" className="sr-only">
          Ask the inventory a question
        </label>
        <input
          id="glass-box-query"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="do you have a 2019 Swift under 6 lakh?"
          maxLength={180}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 font-mono text-[13px] text-bone outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={running || value.trim().length === 0}
          className="border-l border-line px-5 font-mono text-[11px] uppercase tracking-[0.16em] text-signal transition-colors hover:bg-signal hover:text-void disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
        >
          {running ? "Running" : "Run"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.text}
            type="button"
            title={example.note}
            disabled={running}
            onClick={() => onPick(example.text)}
            className="group flex items-center gap-2 border border-line bg-surface px-3 py-1.5 text-left font-mono text-[11px] text-muted transition-colors hover:border-line-bright hover:text-bone disabled:cursor-not-allowed disabled:opacity-50"
          >
            {example.tension ? (
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
              />
            ) : (
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-line-bright" />
            )}
            {example.text}
          </button>
        ))}
      </div>
    </div>
  );
}
