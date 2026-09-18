"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Drives the shared [data-reveal] entrance animation with one observer for the
 * whole document rather than one per component.
 *
 * Nodes can appear after mount in two ways — a client-side navigation swapping
 * the tree, or a component rendering new children — so this re-scans on route
 * change and watches the DOM for additions. Without that, anything rendered
 * after the first paint would stay stuck at opacity 0.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = (el: HTMLElement) => el.setAttribute("data-visible", "true");

    if (reduced) {
      const revealAll = () =>
        document
          .querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])")
          .forEach(show);

      revealAll();
      const mutations = new MutationObserver(revealAll);
      mutations.observe(document.body, { childList: true, subtree: true });
      return () => mutations.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          window.setTimeout(() => show(el), delay);
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    const observeAll = () =>
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])")
        .forEach((el) => observer.observe(el));

    observeAll();

    // Catches nodes added by components after the initial paint.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
