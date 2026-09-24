"use client";

import { useState } from "react";
import { skills } from "@/content/site";

/**
 * The stack, drawn as one instrument rather than a wall of tags.
 *
 * Glass rule (stated in full in `work.tsx`): the stack is a single discrete
 * object, so the whole thing gets one pane of glass. Nothing inside it gets a
 * second one — the layers are separated by hairlines and space, and the
 * foundation is a plinth, not another card.
 *
 * Rhythm: support tier — py-24 md:py-32, h2 text-3xl/sm:text-4xl, content mt-14.
 *
 * Isolation is shown by *raising* the active layer, never by dimming the rest
 * with opacity: a translucent row would drop `text-muted` and `text-faint`
 * below 4.5:1 on this surface, in both themes. The quietest an inactive layer
 * ever gets is `text-muted`, which stays AA on the glass in either theme.
 */

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

/** The rail: index, role, the layer's name, and one line on what it is for. */
function LayerRail({
  info,
  group,
  state,
}: {
  info: LayerMeta;
  group: string;
  state: "active" | "resting" | "quiet";
}) {
  return (
    <>
      <span className="label block">
        <span className={state === "active" ? "text-signal" : undefined}>{info.index}</span>
        <span aria-hidden="true"> / </span>
        {info.role}
      </span>
      <span
        className={`mt-2.5 block font-sans text-[1.375rem] leading-tight tracking-tight transition-colors duration-500 ease-[var(--ease-out-expo)] ${
          state === "quiet" ? "text-muted" : "text-bone"
        }`}
      >
        {group}
      </span>
      <span className="mt-2 block max-w-[24ch] font-mono text-[11.5px] leading-relaxed text-muted">
        {info.note}
      </span>
    </>
  );
}

/**
 * One structural hairline down the left of the list instead of one per item.
 * The old per-item borders read as a mesh, which is most of why the section was
 * hard to scan.
 */
function LayerItems({
  items,
  state,
  columns,
}: {
  items: readonly string[];
  state: "active" | "resting" | "quiet";
  columns: string;
}) {
  return (
    <ul
      className={`grid grid-cols-2 gap-x-8 gap-y-2.5 self-start border-line pt-1 transition-colors duration-500 ease-[var(--ease-out-expo)] md:border-l md:pt-0 md:pl-10 ${columns} ${
        state === "active" ? "md:border-signal/35" : "md:border-line"
      }`}
    >
      {items.map((item) => (
        <li
          key={item}
          className={`text-pretty font-mono text-[13px] leading-6 transition-colors duration-500 ease-[var(--ease-out-expo)] ${
            state === "quiet" ? "text-muted" : "text-bone/85"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function CapabilityMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hovered ?? pinned;

  const layers = STACK_ORDER.map((name) => skills.find((entry) => entry.group === name)).filter(
    (entry): entry is (typeof skills)[number] => entry !== undefined,
  );
  const foundation = skills.find((entry) => entry.group === "Languages");

  const stateOf = (group: string): "active" | "resting" | "quiet" => {
    if (active === null) return "resting";
    return active === group ? "active" : "quiet";
  };

  return (
    <section className="ambient relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-8 md:py-32">
      <header data-reveal className="max-w-2xl">
        <p className="label">Capability map</p>
        <h2 className="mt-5 text-balance font-sans text-3xl font-medium leading-tight tracking-tight text-bone sm:text-4xl">
          The stack, by where it sits.
        </h2>
        <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted">
          Not a list of logos. These are the layers I work across, top to bottom, in the order a
          request travels through them.
        </p>
      </header>

      <div data-reveal data-reveal-delay="120" className="relative mt-14">
        {/* The spine: connective tissue running the height of the stack, lit
            along the panel's left edge so the stack reads as one instrument. */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 z-10 hidden w-px bg-gradient-to-b from-transparent via-signal/25 to-transparent sm:block"
        />

        {/* No `overflow-hidden` here: the spine nodes deliberately straddle the
            panel's left edge, so the rows carry the corner radii themselves. */}
        <div className="glass-panel relative">
          {layers.map((layer) => {
            const info = meta(layer.group);
            const state = stateOf(layer.group);
            const isActive = state === "active";
            return (
              <div
                key={layer.group}
                onMouseEnter={() => setHovered(layer.group)}
                onMouseLeave={() => setHovered(null)}
                className={`relative grid gap-x-10 gap-y-4 border-b border-line px-6 py-7 transition-[background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] first:rounded-t-[17px] sm:px-8 sm:pl-14 md:grid-cols-[14rem_1fr] md:py-8 ${
                  isActive
                    ? "bg-raised/55 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                    : "bg-transparent"
                }`}
              >
                {/* Node on the spine, plus the tick that joins it to the label. */}
                <span
                  aria-hidden="true"
                  className={`absolute left-[-4.5px] top-9 z-20 hidden h-[9px] w-[9px] rotate-45 rounded-[1px] border bg-void transition-colors duration-500 ease-[var(--ease-out-expo)] sm:block ${
                    isActive ? "border-signal" : "border-line-bright"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-[42px] hidden h-px w-9 transition-colors duration-500 ease-[var(--ease-out-expo)] sm:block ${
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
                    className="block min-h-[44px] w-full cursor-pointer text-left"
                  >
                    <LayerRail info={info} group={layer.group} state={state} />
                  </button>
                </div>

                <LayerItems
                  items={layer.items}
                  state={state}
                  columns="sm:grid-cols-3 lg:grid-cols-4"
                />
              </div>
            );
          })}

          {/* Foundation plinth: everything above is written in these. Not a
              second pane — a fill, so the object still reads as one. */}
          {foundation ? (
            <div
              onMouseEnter={() => setHovered(foundation.group)}
              onMouseLeave={() => setHovered(null)}
              className="relative grid gap-x-10 gap-y-4 rounded-b-[17px] bg-surface/70 px-6 py-8 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] sm:px-8 sm:pl-14 md:grid-cols-[14rem_1fr] md:py-9"
            >
              <div>
                <LayerRail
                  info={meta(foundation.group)}
                  group={foundation.group}
                  state={stateOf(foundation.group)}
                />
              </div>
              <LayerItems
                items={foundation.items}
                state={stateOf(foundation.group)}
                columns="sm:grid-cols-3 lg:grid-cols-5"
              />
            </div>
          ) : null}
        </div>

        <p className="mt-5 font-mono text-[11px] text-muted">
          Hover a layer to isolate it. Click to keep it isolated.
        </p>
      </div>
    </section>
  );
}
