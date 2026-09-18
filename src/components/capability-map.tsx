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
    <section className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <header data-reveal className="max-w-2xl">
        <p className="label">Capability map</p>
        <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight text-bone sm:text-4xl">
          The stack, by where it sits.
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted">
          Not a list of logos. These are the layers I work across, top to bottom, in the order a
          request travels through them.
        </p>
      </header>

      <div data-reveal data-reveal-delay="120" className="relative mt-14">
        {/* The spine: connective tissue running the height of the stack. */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 hidden w-px bg-line sm:block"
        />

        <div className="border-t border-line-bright">
          {layers.map((layer) => {
            const info = meta(layer.group);
            const isActive = active === layer.group;
            return (
              <div
                key={layer.group}
                onMouseEnter={() => setHovered(layer.group)}
                onMouseLeave={() => setHovered(null)}
                className={`relative grid gap-x-10 gap-y-4 border-b border-line py-7 transition-opacity duration-300 sm:pl-10 md:grid-cols-[14rem_1fr] ${
                  dimmed(layer.group) ? "opacity-40" : "opacity-100"
                }`}
              >
                {/* Node on the spine, plus the tick that joins it to the label. */}
                <span
                  aria-hidden="true"
                  className={`absolute left-[-3.5px] top-9 hidden h-[7px] w-[7px] rotate-45 border bg-void transition-colors duration-300 sm:block ${
                    isActive ? "border-signal" : "border-line-bright"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-[41px] hidden h-px w-7 transition-colors duration-300 sm:block ${
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
                    className="group/label block text-left"
                  >
                    <span className="label block">
                      {info.index} / {info.role}
                    </span>
                    <span
                      className={`mt-1.5 block font-sans text-xl tracking-tight transition-colors ${
                        isActive ? "text-bone" : "text-bone/90 group-hover/label:text-bone"
                      }`}
                    >
                      {layer.group}
                    </span>
                  </button>
                  <p className="mt-1 font-mono text-[11.5px] leading-relaxed text-faint">
                    {info.note}
                  </p>
                </div>

                <ul className="grid grid-cols-2 self-start sm:grid-cols-3 lg:grid-cols-4">
                  {layer.items.map((item) => (
                    <li
                      key={item}
                      className="border-l border-line py-1.5 pl-3 font-mono text-[12.5px] leading-relaxed text-muted transition-colors hover:text-bone"
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
              className={`relative grid gap-x-10 gap-y-4 border-b border-line-bright bg-surface py-7 transition-opacity duration-300 sm:pl-10 md:grid-cols-[14rem_1fr] ${
                dimmed(foundation.group) ? "opacity-40" : "opacity-100"
              }`}
            >
              <div>
                <span className="label block">
                  {meta(foundation.group).index} / {meta(foundation.group).role}
                </span>
                <span className="mt-1.5 block font-sans text-xl tracking-tight text-bone">
                  {foundation.group}
                </span>
                <p className="mt-1 font-mono text-[11.5px] leading-relaxed text-faint">
                  {meta(foundation.group).note}
                </p>
              </div>
              <ul className="grid grid-cols-2 self-start sm:grid-cols-3 lg:grid-cols-5">
                {foundation.items.map((item) => (
                  <li
                    key={item}
                    className="border-l border-line py-1.5 pl-3 font-mono text-[12.5px] leading-relaxed text-muted transition-colors hover:text-bone"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <p className="mt-4 font-mono text-[11px] text-faint">
          Hover a layer to isolate it. Click to keep it isolated.
        </p>
      </div>
    </section>
  );
}
