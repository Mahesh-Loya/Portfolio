/**
 * Motion primitives render their entrance state into the SSR HTML, which means
 * a visitor without JS would be left looking at `opacity: 0`. This emits the one
 * rule that undoes that, and only for people who never get the animation anyway.
 *
 * Kept as a plain (non-client) module so it costs nothing in the client bundle
 * beyond the markup itself.
 */
export function NoJs() {
  return (
    <noscript>
      <style>{`[data-motion-reveal]{opacity:1!important;transform:none!important}`}</style>
    </noscript>
  );
}
