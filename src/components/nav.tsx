"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { PALETTE_OPEN_EVENT } from "@/components/command-palette";

/**
 * Every tracked section, in reading order for the drawer. Contact is tracked
 * and listed here, but on the bar it is represented by the "Get in touch"
 * action instead of a plain link.
 */
const SECTIONS = [
  { id: "build", label: "Build" },
  { id: "work", label: "Work" },
  { id: "demo", label: "Demo" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

/** The bar shows only the content sections; contact has its own action. */
const BAR_SECTIONS = SECTIONS.filter((section) => section.id !== "contact");

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M4 4l8 8M12 4l-8 8" /> : <path d="M2.5 5.5h11M2.5 10.5h11" />}
    </svg>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMac(/mac|iphone|ipad/i.test(navigator.userAgent));
  }, []);

  /* The bar stays invisible over the hero and only materialises past it. */
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const threshold = Math.max(window.innerHeight * 0.6, 120);
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Marks the section currently under the reader. */
  useEffect(() => {
    const nodes = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => node !== null,
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[120] transition-colors duration-300 ${
        solid ? "glass border-x-0! border-t-0!" : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 sm:gap-4 sm:px-8">
        <a href="#top" className="group flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center border border-line-bright font-mono text-[10px] leading-none text-muted transition-colors group-hover:border-signal group-hover:text-signal"
          >
            ML
          </span>
          {/* The wordmark yields first on very narrow phones; the monogram stays. */}
          <span className="hidden truncate font-sans text-[15px] font-medium tracking-tight text-bone min-[360px]:inline">
            {profile.name}
          </span>
          <span className="sr-only">{profile.name} — back to top</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {BAR_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={active === section.id ? "true" : undefined}
              className={`rounded-sm px-3 py-1.5 text-[13.5px] transition-colors ${
                active === section.id ? "text-bone" : "text-muted hover:text-bone"
              }`}
            >
              {section.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* The conversion action. On the bar at every width, never behind the menu. */}
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            aria-current={active === "contact" ? "true" : undefined}
            className={`inline-flex h-11 shrink-0 items-center rounded-sm border px-3.5 text-[13px] transition-colors md:h-9 md:text-[13.5px] ${
              active === "contact"
                ? "border-signal text-signal"
                : "border-line-bright text-muted hover:border-signal hover:text-signal"
            }`}
          >
            <span className="md:hidden">Contact</span>
            <span className="hidden md:inline">Get in touch</span>
          </a>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(PALETTE_OPEN_EVENT))}
            aria-label={`${isMac ? "⌘" : "Ctrl"} K — open command palette`}
            className="hidden h-9 items-center gap-1.5 rounded-sm border border-line px-2.5 font-mono text-[11px] text-faint transition-colors hover:border-line-bright hover:text-muted md:inline-flex"
          >
            <span aria-hidden="true">{isMac ? "⌘" : "Ctrl"}</span>
            <span aria-hidden="true">K</span>
          </button>

          <ThemeToggle className="h-11! w-11! md:h-9! md:w-9!" />

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:border-line-bright hover:text-bone md:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      <div
        id="nav-mobile-menu"
        hidden={!menuOpen}
        className="border-t border-line md:hidden"
      >
        <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
          {SECTIONS.map((section, index) => (
            <li key={section.id} className="border-b border-line last:border-b-0">
              <a
                href={`#${section.id}`}
                onClick={() => setMenuOpen(false)}
                aria-current={active === section.id ? "true" : undefined}
                className={`flex min-h-[48px] items-center justify-between py-3 text-[15px] transition-colors ${
                  active === section.id ? "text-bone" : "text-muted hover:text-bone"
                }`}
              >
                {section.label}
                <span className="label">{`0${index + 1}`}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
