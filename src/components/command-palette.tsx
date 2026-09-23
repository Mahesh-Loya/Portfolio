"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { caseStudies, profile } from "@/content/site";
import { toggleTheme } from "@/components/theme-toggle";

/** Anything on the page can ask for the palette by dispatching this on window. */
export const PALETTE_OPEN_EVENT = "palette:open";

type Command = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  /** Commands that report their result in place (copy) keep the palette open. */
  keepOpen?: boolean;
  run: () => void;
};

const GROUP_ORDER = ["Navigate", "Case studies", "Connect", "Preferences"];

/**
 * Subsequence match with a small score: consecutive hits and word-boundary
 * hits rank higher, so "vya" beats a scattered match. Returns null for a miss.
 */
function score(haystack: string, needle: string): number | null {
  if (!needle) return 0;
  const hay = haystack.toLowerCase();
  const query = needle.toLowerCase().replace(/\s+/g, "");
  let cursor = 0;
  let total = 0;
  let streak = 0;

  for (let i = 0; i < query.length; i += 1) {
    const found = hay.indexOf(query.charAt(i), cursor);
    if (found === -1) return null;
    streak = found === cursor && i > 0 ? streak + 1 : 0;
    const boundary = found === 0 || " /-".includes(hay.charAt(found - 1));
    total += streak * 4 + (boundary ? 8 : 0) - (found - cursor) * 0.5;
    cursor = found + 1;
  }
  return total - hay.length * 0.05;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      return ok;
    } catch {
      return false;
    }
  }
}

function openExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 6h7M6.5 3l3 3-3 3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <circle cx="7" cy="7" r="4.4" />
      <path d="m10.4 10.4 3 3" />
    </svg>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    setIsMac(/mac|iphone|ipad/i.test(navigator.userAgent));
    return () => window.clearTimeout(copyTimer.current);
  }, []);

  const goTo = useCallback(
    (hash: string) => {
      const target = document.getElementById(hash.replace("#", ""));
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        window.history.replaceState(null, "", hash);
      } else {
        window.location.hash = hash;
      }
    },
    [reduceMotion],
  );

  const commands = useMemo<Command[]>(() => {
    const sections: Command[] = [
      { id: "nav-work", group: "Navigate", label: "Go to Work", hint: "#work", keywords: "projects case studies", run: () => goTo("#work") },
      { id: "nav-demo", group: "Navigate", label: "Go to Demo", hint: "#demo", keywords: "live playground try", run: () => goTo("#demo") },
      { id: "nav-about", group: "Navigate", label: "Go to About", hint: "#about", keywords: "education background credentials", run: () => goTo("#about") },
      { id: "nav-contact", group: "Navigate", label: "Go to Contact", hint: "#contact", keywords: "email hire reach out", run: () => goTo("#contact") },
    ];

    const studies: Command[] = caseStudies.map((study) => ({
      id: `case-${study.slug}`,
      group: "Case studies",
      label: study.title,
      hint: study.period,
      keywords: `${study.kicker} ${study.stack.join(" ")}`,
      run: () => router.push(`/work/${study.slug}`),
    }));

    const connect: Command[] = [
      {
        id: "copy-email",
        group: "Connect",
        label: "Copy email address",
        hint: profile.email,
        keywords: "mail clipboard contact",
        keepOpen: true,
        run: () => {
          void copyText(profile.email).then((ok) => {
            if (!ok) return;
            setCopied(true);
            window.clearTimeout(copyTimer.current);
            copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
          });
        },
      },
      { id: "github", group: "Connect", label: "Open GitHub", hint: profile.githubHandle, keywords: "code source repos", run: () => openExternal(profile.github) },
      { id: "linkedin", group: "Connect", label: "Open LinkedIn", hint: "in/mahesh-loya", keywords: "profile network", run: () => openExternal(profile.linkedin) },
      {
        id: "resume",
        group: "Connect",
        label: "Download resume",
        hint: "PDF",
        keywords: "cv resume pdf download",
        run: () => {
          const link = document.createElement("a");
          link.href = profile.resumeUrl;
          link.download = "";
          link.rel = "noopener";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      },
    ];

    const prefs: Command[] = [
      { id: "theme", group: "Preferences", label: "Toggle theme", hint: "Dark / Light", keywords: "dark light appearance mode", run: () => toggleTheme() },
    ];

    return [...sections, ...studies, ...connect, ...prefs];
  }, [goTo, router]);

  const results = useMemo(() => {
    const scored: { command: Command; value: number }[] = [];
    for (const command of commands) {
      const value = score(
        `${command.label} ${command.group} ${command.keywords ?? ""} ${command.hint ?? ""}`,
        query,
      );
      if (value !== null) scored.push({ command, value });
    }
    if (query) scored.sort((a, b) => b.value - a.value);

    const grouped: { name: string; items: Command[] }[] = [];
    for (const { command } of scored) {
      const bucket = grouped.find((entry) => entry.name === command.group);
      if (bucket) bucket.items.push(command);
      else grouped.push({ name: command.group, items: [command] });
    }
    if (!query) {
      grouped.sort((a, b) => GROUP_ORDER.indexOf(a.name) - GROUP_ORDER.indexOf(b.name));
    }

    return { grouped, flat: grouped.flatMap((entry) => entry.items) };
  }, [commands, query]);

  const flat = results.flat;
  const activeId = flat[activeIndex]?.id;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  /* Global shortcut plus programmatic open from the nav. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    const onRequest = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(PALETTE_OPEN_EVENT, onRequest);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(PALETTE_OPEN_EVENT, onRequest);
    };
  }, []);

  /* Body scroll lock and focus handover while open. */
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCopied(false);
    const trigger = triggerRef.current;
    if (trigger && document.contains(trigger)) {
      window.setTimeout(() => trigger.focus(), 0);
    }
  }, []);

  const runCommand = useCallback(
    (command: Command | undefined) => {
      if (!command) return;
      if (command.keepOpen) {
        command.run();
        return;
      }
      close();
      window.setTimeout(() => command.run(), 0);
    },
    [close],
  );

  /* Keep the highlighted option in view as it moves. */
  useEffect(() => {
    if (!open || !activeId) return;
    const node = listRef.current?.querySelector<HTMLElement>(`#cmd-opt-${CSS.escape(activeId)}`);
    node?.scrollIntoView({ block: "nearest" });
  }, [activeId, open]);

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown" || (event.ctrlKey && event.key === "n")) {
      event.preventDefault();
      setActiveIndex((index) => (flat.length ? (index + 1) % flat.length : 0));
      return;
    }
    if (event.key === "ArrowUp" || (event.ctrlKey && event.key === "p")) {
      event.preventDefault();
      setActiveIndex((index) => (flat.length ? (index - 1 + flat.length) % flat.length : 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(flat.length - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(flat[activeIndex]);
      return;
    }
    if (event.key === "Tab") {
      /* Trap: cycle focus among the dialog's own focusable nodes. */
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const nodes = Array.from(focusables);
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  if (!mounted) return null;

  const duration = reduceMotion ? 0 : 0.18;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="palette"
          className="fixed inset-0 z-[300] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration * 0.8, ease: "linear" }}
        >
          <div className="absolute inset-0 bg-void/70" onClick={close} aria-hidden="true" />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onKeyDown={onDialogKeyDown}
            className="glass relative flex w-full max-w-xl flex-col overflow-hidden rounded-md shadow-2xl shadow-black/40"
            initial={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.99 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <span className="text-faint" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="Search sections, work, links"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-listbox"
                aria-autocomplete="list"
                aria-activedescendant={activeId ? `cmd-opt-${activeId}` : undefined}
                className="h-12 w-full bg-transparent font-sans text-[15px] text-bone outline-none placeholder:text-faint"
              />
              <button
                type="button"
                onClick={close}
                className="label shrink-0 rounded-sm border border-line px-1.5 py-0.5 transition-colors hover:border-line-bright hover:text-muted"
              >
                Esc
              </button>
            </div>

            <div ref={listRef} className="max-h-[min(22rem,52vh)] overflow-y-auto overscroll-contain py-2">
              <div id="cmd-listbox" role="listbox" aria-label="Commands">
                {flat.length === 0 ? (
                  <p className="px-4 py-6 text-center font-mono text-[13px] text-faint">
                    No match for {query}
                  </p>
                ) : (
                  results.grouped.map((group) => (
                    <div key={group.name} className="mb-1 last:mb-0">
                      <p className="label px-4 pb-1 pt-2">{group.name}</p>
                      {group.items.map((command) => {
                        const index = flat.indexOf(command);
                        const isActive = index === activeIndex;
                        const showCopied = copied && command.id === "copy-email";
                        return (
                          <div
                            key={command.id}
                            id={`cmd-opt-${command.id}`}
                            role="option"
                            aria-selected={isActive}
                            onMouseMove={() => setActiveIndex(index)}
                            onClick={() => runCommand(command)}
                            className={`mx-2 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 transition-colors ${
                              isActive ? "bg-raised text-bone" : "text-muted"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`h-3.5 w-px shrink-0 ${isActive ? "bg-signal" : "bg-transparent"}`}
                            />
                            <span className="min-w-0 flex-1 truncate text-[14px]">{command.label}</span>
                            {showCopied ? (
                              <span className="font-mono text-[11px] text-signal">copied</span>
                            ) : command.hint ? (
                              <span className="hidden max-w-[45%] truncate font-mono text-[11px] text-faint sm:block">
                                {command.hint}
                              </span>
                            ) : null}
                            <span className={`shrink-0 ${isActive ? "text-faint" : "text-transparent"}`}>
                              <ArrowIcon />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-line px-4 py-2">
              <span className="label">{isMac ? "⌘K" : "Ctrl K"}</span>
              <span className="label flex gap-3">
                <span>{"↑↓"} move</span>
                <span>{"↵"} select</span>
                <span className="hidden sm:inline">esc close</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
