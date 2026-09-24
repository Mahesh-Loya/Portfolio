"use client";

import { useState } from "react";
import { skills } from "@/content/site";

type LayerMeta = { index: string; role: string; note: string };

/** Where each group actually sits when the system is drawn as a stack. */
const META: Record<string, LayerMeta> = {
  Frontend: { index: "05", role: "Interface", note: "What a user touches" },
  Backend: { index: "04", role: "Services", note: "Request handling and transport" },
  Databases: { index: "03", role: "State", note: "What the system remembers" },
  "AI / LLM": { index: "02", role: "Reasoning", note: "Retrieval, tools, generation" },
  Cloud: { index: "01", role: "Runtime", note: "Where it runs and how it ships" },
  Languages: { index: "00", role: "Foundation", note: "Written in" },
};

const STACK_ORDER = ["Frontend", "Backend", "Databases", "AI / LLM", "Cloud"];

function meta(group: string): LayerMeta {
  return META[group] ?? { index: "--", role: "Layer", note: "" };
}

export function CapabilityMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hovered ?? pinned;

  const layers = STACK_ORDER.map((name) => skills.find((entry) => entry.group === name)).filter(
    (entry): entry is (typeof skills)[number] => entry !== undefined,
  );
  const foundation = skills.find((entry) => entry.group === "Languages");

  const dimmed = (group: string) => active !== null && active !== group;

  return (
    <section className="ambient relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <header data-reveal className="max-w-2xl">
        <p className="label">Capability map</p>
        <h2 className="mt-6 font-sans text-3xl font-medium tracking-tight text-bone sm:text-4xl">
          The stack, by where it sits.
        </h2>
        <p className="mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-muted">
          Not a list of logos. These are the layers I work across, top to bottom, in the order a
          request travels through them.
        </p>
      </header>

      <div data-reveal data-reveal-delay="120" className="relative mt-16">
        {/* The spine: connective tissue running the height of the stack, lit
            along the panel's left edge so the stack reads as one instrument. */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 z-10 hidden w-px bg-gradient-to-b from-transparent via-signal/25 to-transparent sm:block"
        />

        <div className="relative rounded-[18px] border border-line bg-gradient-to-b from-raised/60 to-surface/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.26),0_22px_52px_-28px_rgb(0_0_0/0.62)]">
          {layers.map((layer) => {
            const info = meta(layer.group);
            const isActive = active === layer.group;
            return (
              <div
                key={layer.group}
                onMouseEnter={() => setHovered(layer.group)}
                onMouseLeave={() => setHovered(null)}
                className={`relative grid gap-x-12 gap-y-5 border-b border-line px-5 py-8 transition-[opacity,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] first:rounded-t-[17px] sm:px-8 sm:pl-14 md:grid-cols-[15rem_1fr] ${
                  dimmed(layer.group) ? "opacity-40" : "opacity-100"
                } ${
                  isActive
                    ? "bg-raised/55 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                    : "bg-transparent"
                }`}
              >
                {/* Node on the spine, plus the tick that joins it to the label. */}
                <span
                  aria-hidden="true"
                  className={`absolute left-[-4.5px] top-10 z-20 hidden h-[9px] w-[9px] rotate-45 rounded-[1px] border bg-void transition-colors duration-500 ease-[var(--ease-out-expo)] sm:block ${
                    isActive ? "border-signal" : "border-line-bright"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-[44px] hidden h-px w-9 transition-colors duration-500 ease-[var(--ease-out-expo)] sm:block ${
                    isActive ? "bg-signal" : "bg-line"
                  }`}
                />

                <div>
                  <button
                    type="button"
                    aria-pressed={pinned === layer.group}
                    onFocus={() => setHovered(layer.group)}
                    onBlur={() => setHovered(null)}
                    onClick={() =>
                      setPinned((current) => (current === layer.group ? null : layer.group))
                    }
                    className="group/label block min-h-[44px] cursor-pointer text-left"
                  >
                    <span className="label block">
                      {info.index} / {info.role}
                    </span>
                    <span
                      className={`mt-2 block font-sans text-[22px] leading-tight tracking-tight transition-colors duration-500 ease-[var(--ease-out-expo)] ${
                        isActive ? "text-bone" : "text-bone/90 group-hover/label:text-bone"
                      }`}
                    >
                      {layer.group}
                    </span>
                  </button>
                  <p className="mt-2.5 font-mono text-[11.5px] leading-relaxed text-faint">
                    {info.note}
                  </p>
                </div>

                <ul className="grid grid-cols-2 gap-x-6 gap-y-1 self-start sm:grid-cols-3 lg:grid-cols-4">
                  {layer.items.map((item) => (
                    <li
                      key={item}
                      className={`border-l py-2 pl-4 font-mono text-[12.5px] leading-relaxed text-muted transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone ${
                        isActive ? "border-signal/40" : "border-line"
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Foundation plinth: everything above is written in these. */}
          {foundation ? (
            <div
              onMouseEnter={() => setHovered(foundation.group)}
              onMouseLeave={() => setHovered(null)}
              className={`relative grid gap-x-12 gap-y-5 rounded-b-[17px] bg-surface/70 px-5 py-9 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition-opacity duration-500 ease-[var(--ease-out-expo)] sm:px-8 sm:pl-14 md:grid-cols-[15rem_1fr] ${
                dimmed(foundation.group) ? "opacity-40" : "opacity-100"
              }`}
            >
              <div>
                <span className="label block">
                  {meta(foundation.group).index} / {meta(foundation.group).role}
                </span>
                <span className="mt-2 block font-sans text-[22px] leading-tight tracking-tight text-bone">
                  {foundation.group}
                </span>
                <p className="mt-2.5 font-mono text-[11.5px] leading-relaxed text-faint">
                  {meta(foundation.group).note}
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1 self-start sm:grid-cols-3 lg:grid-cols-5">
                {foundation.items.map((item) => (
                  <li
                    key={item}
                    className="border-l border-line py-2 pl-4 font-mono text-[12.5px] leading-relaxed text-muted transition-colors duration-500 ease-[var(--ease-out-expo)] hover:text-bone"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <p className="mt-6 font-mono text-[11px] text-faint">
          Hover a layer to isolate it. Click to keep it isolated.
        </p>
      </div>
    </section>
  );
}
