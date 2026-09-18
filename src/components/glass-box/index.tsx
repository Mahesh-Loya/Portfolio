"use client";

import { useState } from "react";
import { AnswerPane } from "./answer-pane";
import { MachineryPane } from "./machinery-pane";
import { QueryBar, type Example } from "./query-bar";
import { useDemo } from "./use-demo";

const EXAMPLES: Example[] = [
  {
    text: "do you have a 2019 Swift under 6 lakh?",
    tension: true,
    note: "Meaning and constraints disagree: the nearest vector match costs too much.",
    // The 2019 Swift ZXi at ₹6,40,000 ranks at or near the top semantically and
    // is removed by the price predicate. That cut is the point of the demo.
  },
  {
    text: "automatic petrol hatchback under 9 lakh",
    note: "Transmission and fuel become equality predicates; body style stays semantic.",
  },
  {
    text: "first owner Nexon below 10 lakh with under 40,000 km",
    note: "Four predicates at once — ownership, model, price and odometer.",
  },
  {
    text: "diesel SUV, 2021 or newer, budget 13 lakh",
    note: "A range on year, a ceiling on price, and SUV answered by meaning alone.",
  },
];

export default function GlassBox() {
  const { state, run } = useDemo();
  const [value, setValue] = useState("");

  const running = state.status === "running";

  function submit(next?: string): void {
    const query = (next ?? value).trim();
    if (query.length === 0 || running) return;
    setValue(query);
    run(query);
  }

  return (
    <section id="demo" className="relative border-t border-line bg-void py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 gridlines opacity-40" />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div data-reveal>
          <p className="label">Interactive</p>
          <h2 className="mt-4 text-balance text-4xl tracking-tight sm:text-5xl">The Glass Box</h2>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted">
            The retrieval pipeline from Vyavsay Assist, running with the lid off. Ask the inventory
            a question in plain language: the left pane answers, the right pane shows every stage
            that produced the answer — including the rows that semantic search liked and the
            constraint filter threw out.
          </p>
        </div>

        <div className="mt-10" data-reveal data-reveal-delay="80">
          <QueryBar
            value={value}
            running={running}
            examples={EXAMPLES}
            onChange={setValue}
            onSubmit={() => submit()}
            onPick={(picked) => submit(picked)}
          />
        </div>

        <div
          className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-start"
          data-reveal
          data-reveal-delay="140"
        >
          <AnswerPane state={state} />
          <MachineryPane state={state} />
        </div>

        <div
          className="mt-4 border border-line bg-surface p-4 sm:p-5"
          data-reveal
          data-reveal-delay="200"
        >
          <p className="label">How this actually runs</p>
          <p className="mt-2.5 max-w-4xl font-mono text-[11px] leading-[1.85] text-faint">
            The retrieval is real, not scripted. Your query is embedded in-process by a 256-dimension
            local encoder — signed character-trigram hashing, no model, no API key, no network call —
            then scored by cosine similarity against 41 rows of{" "}
            <span className="text-muted">synthetic</span> inventory embedded at module load, and
            filtered by predicates parsed from your own sentence. Every millisecond shown is measured;
            only the gap between stages is deliberate, so each one can be read. The answer is built by
            a deterministic composer from the surviving rows, which is why it cannot claim a car that
            is not there. Production Vyavsay Assist swaps two parts and keeps the shape: OpenAI
            embeddings at 1536 dimensions in Postgres with pgvector and an HNSW index, and a real LLM
            writing the reply over the same exactly-filtered rows.
          </p>
        </div>
      </div>
    </section>
  );
}
