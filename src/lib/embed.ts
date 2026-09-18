/**
 * A tiny, fully deterministic text embedding.
 *
 * This is NOT a neural model. It is signed feature hashing over character
 * trigrams plus whole-word tokens, projected into a fixed-dimension vector
 * and L2-normalised so that cosine similarity is a plain dot product.
 *
 * Why it exists: the demo has to compute retrieval for real, with zero API
 * keys and zero cost. Hashed n-gram vectors are a genuine (if shallow)
 * vector space — similar strings land near each other, cosine behaves the
 * way it does with learned embeddings, and every number shown in the UI is
 * actually computed rather than scripted.
 *
 * Production (Vyavsay Assist) uses OpenAI text-embedding-3-small at 1536
 * dimensions stored in pgvector with an HNSW index. The pipeline shape is
 * identical; only the encoder differs.
 */

export const EMBED_DIM = 256;

/** Whole-word tokens carry more signal than any single trigram. */
const WORD_WEIGHT = 1;
const TRIGRAM_WEIGHT = 0.55;

/** FNV-1a, seeded. Fast, stable across runtimes, no dependencies. */
function hash(text: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Lowercase, collapse everything that is not a letter or digit. */
export function normaliseText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Signed hashing: a second hash decides the sign, which keeps collisions
 * from systematically inflating the vector norm.
 */
function addFeature(vector: Float32Array, feature: string, weight: number): void {
  const index = hash(feature, 0x811c9dc5) % EMBED_DIM;
  const sign = (hash(feature, 0x9e3779b1) & 1) === 0 ? 1 : -1;
  vector[index] += sign * weight;
}

/** Embed a string into a unit-length vector of EMBED_DIM components. */
export function embed(text: string): Float32Array {
  const vector = new Float32Array(EMBED_DIM);
  const normalised = normaliseText(text);
  if (normalised.length === 0) return vector;

  for (const word of normalised.split(" ")) {
    if (word.length === 0) continue;
    addFeature(vector, `\u0000${word}`, WORD_WEIGHT);

    // Pad so word boundaries become part of the trigram signal.
    const padded = ` ${word} `;
    for (let i = 0; i + 3 <= padded.length; i += 1) {
      addFeature(vector, padded.slice(i, i + 3), TRIGRAM_WEIGHT);
    }
  }

  return l2Normalise(vector);
}

/** Scale to unit length in place. A zero vector is returned untouched. */
export function l2Normalise(vector: Float32Array): Float32Array {
  let sum = 0;
  for (let i = 0; i < vector.length; i += 1) sum += vector[i] * vector[i];
  const magnitude = Math.sqrt(sum);
  if (magnitude === 0) return vector;
  for (let i = 0; i < vector.length; i += 1) vector[i] /= magnitude;
  return vector;
}

/**
 * Cosine similarity. Inputs from embed() are already unit length, so this
 * reduces to a dot product; the magnitudes are recomputed anyway so the
 * function stays correct for any input.
 */
export function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  if (aa === 0 || bb === 0) return 0;
  return dot / Math.sqrt(aa * bb);
}

/**
 * A `count`-column view of the whole vector for the UI, each column being the
 * signed peak of one contiguous slice. Hashed vectors are sparse, so plotting
 * the raw first 32 components would show mostly zeros and say nothing; this
 * folds all EMBED_DIM components into the plot without inventing any value —
 * every bar drawn is an actual component of the actual vector.
 */
export function vectorPreview(vector: Float32Array, count = 32): number[] {
  const slice = Math.max(1, Math.ceil(vector.length / count));
  const out: number[] = [];

  for (let start = 0; start < vector.length; start += slice) {
    let peak = 0;
    for (let i = start; i < Math.min(start + slice, vector.length); i += 1) {
      if (Math.abs(vector[i]) > Math.abs(peak)) peak = vector[i];
    }
    out.push(Number(peak.toFixed(4)));
  }

  return out;
}
