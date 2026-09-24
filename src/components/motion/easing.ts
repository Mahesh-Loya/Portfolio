/**
 * One curve for the whole choreography layer — the same expo-out used by
 * `--ease-out-expo` in globals.css, so JS-driven motion and CSS transitions are
 * indistinguishable from each other.
 */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Matches the 0.9s of the shared `[data-reveal]` transition. */
export const REVEAL_DURATION = 0.9;

/** Matches the 18px rise of the shared `[data-reveal]` transition. */
export const REVEAL_DISTANCE = 18;
