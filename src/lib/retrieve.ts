/**
 * The fused retrieval pipeline.
 *
 * Stage 1  embed    — the query becomes a vector (src/lib/embed.ts).
 * Stage 2  search   — cosine similarity against every inventory row.
 * Stage 3  filter   — constraints parsed out of the natural-language query
 *                     are enforced as exact predicates over the rows.
 * Stage 4  compose  — an answer is built from the rows that survived.
 *
 * Stage 3 is the point of the whole thing. A vector space treats "under
 * 6 lakh" as a direction, not a boundary: a 6.4L car sits very close to a
 * 6L query in embedding space and pure semantic search returns it happily.
 * For a price ceiling, close is wrong. So meaning narrows the candidates and
 * SQL decides the numbers.
 */

import { cosine, embed, EMBED_DIM, vectorPreview } from "./embed";
import {
  carLabel,
  carText,
  formatInr,
  formatKm,
  formatLakh,
  inventory,
  type Car,
} from "./inventory";

/* ─────────────────────────── constraints ─────────────────────────── */

export type ConstraintField =
  | "price"
  | "year"
  | "km"
  | "fuel"
  | "transmission"
  | "make"
  | "model"
  | "owners";

export type ConstraintOp = "<=" | ">=" | "=";

export type Constraint = {
  field: ConstraintField;
  op: ConstraintOp;
  value: number | string;
  /** Chip text, e.g. "price ≤ ₹6,00,000". */
  label: string;
  /** SQL predicate, e.g. "price_inr <= 600000". */
  sql: string;
};

const COLUMN: Record<ConstraintField, string> = {
  price: "price_inr",
  year: "year",
  km: "km_driven",
  fuel: "fuel",
  transmission: "transmission",
  make: "make",
  model: "model",
  owners: "owners",
};

const OP_GLYPH: Record<ConstraintOp, string> = {
  "<=": "≤",
  ">=": "≥",
  "=": "=",
};

function makeConstraint(
  field: ConstraintField,
  op: ConstraintOp,
  value: number | string,
  display: string,
): Constraint {
  const quoted = typeof value === "string" ? `'${value}'` : String(value);
  return {
    field,
    op,
    value,
    label: `${field} ${OP_GLYPH[op]} ${display}`,
    sql: `${COLUMN[field]} ${op} ${quoted}`,
  };
}

const MAKE_ALIASES: { pattern: RegExp; make: string }[] = [
  { pattern: /\b(maruti|suzuki|maruti\s+suzuki|nexa)\b/, make: "Maruti Suzuki" },
  { pattern: /\b(hyundai)\b/, make: "Hyundai" },
  { pattern: /\b(tata)\b/, make: "Tata" },
  { pattern: /\b(honda)\b/, make: "Honda" },
  { pattern: /\b(mahindra)\b/, make: "Mahindra" },
  { pattern: /\b(kia)\b/, make: "Kia" },
  { pattern: /\b(toyota)\b/, make: "Toyota" },
];

const MODEL_ALIASES: { pattern: RegExp; model: string }[] = [
  { pattern: /\b(swift)\b/, model: "Swift" },
  { pattern: /\b(baleno)\b/, model: "Baleno" },
  { pattern: /\b(dzire|desire)\b/, model: "Dzire" },
  { pattern: /\b(i\s?20|i20)\b/, model: "i20" },
  { pattern: /\b(creta)\b/, model: "Creta" },
  { pattern: /\b(venue)\b/, model: "Venue" },
  { pattern: /\b(nexon)\b/, model: "Nexon" },
  { pattern: /\b(punch)\b/, model: "Punch" },
  { pattern: /\b(altroz)\b/, model: "Altroz" },
  { pattern: /\b(amaze)\b/, model: "Amaze" },
  { pattern: /\b(xuv\s?300|xuv300)\b/, model: "XUV300" },
  { pattern: /\b(thar)\b/, model: "Thar" },
  { pattern: /\b(seltos)\b/, model: "Seltos" },
  { pattern: /\b(sonet)\b/, model: "Sonet" },
  { pattern: /\b(glanza)\b/, model: "Glanza" },
  { pattern: /\b(innova|crysta)\b/, model: "Innova Crysta" },
  { pattern: /\b(city)\b/, model: "City" },
];

const UPPER_WORDS = /\b(under|below|less\s+than|within|upto|up\s+to|max|maximum|budget|cheaper\s+than|not\s+more\s+than|at\s+most)\b/;
const LOWER_WORDS = /\b(over|above|more\s+than|at\s+least|minimum|min|starting|atleast)\b/;

/** Decide ≤ vs ≥ from the words immediately around a number. */
function direction(context: string, fallback: ConstraintOp): ConstraintOp {
  if (LOWER_WORDS.test(context)) return ">=";
  if (UPPER_WORDS.test(context)) return "<=";
  return fallback;
}

/** Blank out a matched span so later rules cannot re-consume it. */
function blank(text: string, start: number, length: number): string {
  return text.slice(0, start) + " ".repeat(length) + text.slice(start + length);
}

/**
 * Parse hard constraints out of natural language.
 *
 * Handles: "under 6 lakh", "below ₹8L", "budget 13 lakh", "₹6,00,000",
 * "2019 or newer", "after 2018", "before 2021", "2019 model", bare years,
 * "under 50000 km", "40k kms", "first owner", fuel, transmission, brands
 * and model names. Everything else stays soft and is answered by meaning.
 */
export function parseConstraints(rawQuery: string): Constraint[] {
  let work = ` ${rawQuery.toLowerCase().replace(/[,]/g, "")} `;
  const constraints: Constraint[] = [];
  const seen = new Set<ConstraintField>();

  const push = (constraint: Constraint): void => {
    if (seen.has(constraint.field)) return;
    seen.add(constraint.field);
    constraints.push(constraint);
  };

  const consume = (pattern: RegExp, handle: (match: RegExpExecArray, context: string) => void): void => {
    const regex = new RegExp(pattern.source, "g");
    let match = regex.exec(work);
    while (match !== null) {
      const context = work.slice(Math.max(0, match.index - 22), match.index + match[0].length + 12);
      handle(match, context);
      work = blank(work, match.index, match[0].length);
      regex.lastIndex = match.index + match[0].length;
      match = regex.exec(work);
    }
  };

  // 1 — odometer. Requires an explicit km unit, so it never steals a price.
  consume(/(\d+(?:\.\d+)?)\s*(k|thousand)?\s*(?:km|kms|kilometers|kilometres)\b/, (match, context) => {
    let value = Number(match[1]);
    if (match[2]) value *= 1000;
    else if (value < 1000) value *= 1000;
    const op = direction(context, "<=");
    push(makeConstraint("km", op, Math.round(value), `${formatKm(value)} km`));
  });

  // 2 — price written in lakh.
  consume(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/, (match, context) => {
    const value = Math.round(Number(match[1]) * 100000);
    const op = direction(context, "<=");
    push(makeConstraint("price", op, value, formatInr(value)));
  });

  // 3 — price written in rupees, with a currency marker or as a big number.
  consume(/(?:₹|rs\.?|inr)\s*(\d{4,})\b/, (match, context) => {
    const value = Number(match[1]);
    push(makeConstraint("price", direction(context, "<="), value, formatInr(value)));
  });
  consume(/\b(\d{5,})\s*(?:rupees|rs)?\b/, (match, context) => {
    const value = Number(match[1]);
    if (value < 50000) return;
    push(makeConstraint("price", direction(context, "<="), value, formatInr(value)));
  });

  // 4 — year ranges, most specific phrasing first.
  consume(/\b((?:19|20)\d{2})\s*(?:or\s+(?:newer|later|above)|and\s+(?:newer|above)|onwards?|\+)/, (match) => {
    const value = Number(match[1]);
    push(makeConstraint("year", ">=", value, String(value)));
  });
  consume(/\b(?:after|newer\s+than|later\s+than|post)\s*((?:19|20)\d{2})/, (match) => {
    const value = Number(match[1]) + 1;
    push(makeConstraint("year", ">=", value, String(value)));
  });
  consume(/\b(?:since|from)\s*((?:19|20)\d{2})/, (match) => {
    push(makeConstraint("year", ">=", Number(match[1]), match[1]));
  });
  consume(/\b(?:before|older\s+than|pre)\s*((?:19|20)\d{2})/, (match) => {
    const value = Number(match[1]) - 1;
    push(makeConstraint("year", "<=", value, String(value)));
  });
  consume(/\b(?:upto|up\s+to|till|until)\s*((?:19|20)\d{2})/, (match) => {
    push(makeConstraint("year", "<=", Number(match[1]), match[1]));
  });
  consume(/\b((?:19|20)\d{2})\b/, (match) => {
    push(makeConstraint("year", "=", Number(match[1]), match[1]));
  });

  // 5 — ownership.
  consume(/\b(?:first|1st|single|one)[\s-]?(?:hand|owner)\b/, () => {
    push(makeConstraint("owners", "=", 1, "1"));
  });
  consume(/\b(?:under|below|max|less\s+than)\s*(\d)\s*owners?\b/, (match) => {
    push(makeConstraint("owners", "<=", Number(match[1]), match[1]));
  });

  // 6 — fuel.
  consume(/\b(petrol|gasoline)\b/, () => push(makeConstraint("fuel", "=", "Petrol", "Petrol")));
  consume(/\b(diesel)\b/, () => push(makeConstraint("fuel", "=", "Diesel", "Diesel")));
  consume(/\b(cng)\b/, () => push(makeConstraint("fuel", "=", "CNG", "CNG")));

  // 7 — transmission. AMT/CVT/DCT in a query mean "automatic".
  consume(/\b(automatic|auto|amt|cvt|dct|self\s*drive\s*auto)\b/, () =>
    push(makeConstraint("transmission", "=", "Automatic", "Automatic")),
  );
  consume(/\b(manual|stick|geared)\b/, () =>
    push(makeConstraint("transmission", "=", "Manual", "Manual")),
  );

  // 8 — brand, then model.
  for (const alias of MAKE_ALIASES) {
    consume(alias.pattern, () => push(makeConstraint("make", "=", alias.make, alias.make)));
  }
  for (const alias of MODEL_ALIASES) {
    consume(alias.pattern, () => push(makeConstraint("model", "=", alias.model, alias.model)));
  }

  return constraints;
}

/* ─────────────────────────── predicates ─────────────────────────── */

function valueOf(car: Car, field: ConstraintField): number | string {
  switch (field) {
    case "price":
      return car.priceInr;
    case "year":
      return car.year;
    case "km":
      return car.kmDriven;
    case "fuel":
      return car.fuel;
    case "transmission":
      return car.transmission;
    case "make":
      return car.make;
    case "model":
      return car.model;
    case "owners":
      return car.owners;
  }
}

function present(field: ConstraintField, value: number | string): string {
  if (field === "price") return formatInr(Number(value));
  if (field === "km") return `${formatKm(Number(value))} km`;
  return String(value);
}

/** Returns null when the row satisfies the constraint, else why it failed. */
function evaluate(car: Car, constraint: Constraint): string | null {
  const actual = valueOf(car, constraint.field);

  if (typeof actual === "string" || typeof constraint.value === "string") {
    const ok = String(actual).toLowerCase() === String(constraint.value).toLowerCase();
    return ok ? null : `${constraint.field} ${actual} ≠ ${constraint.value}`;
  }

  const target = constraint.value;
  const a = present(constraint.field, actual);
  const b = present(constraint.field, target);

  switch (constraint.op) {
    case "<=":
      return actual <= target ? null : `${constraint.field} ${a} > ${b}`;
    case ">=":
      return actual >= target ? null : `${constraint.field} ${a} < ${b}`;
    case "=":
      return actual === target ? null : `${constraint.field} ${a} ≠ ${b}`;
  }
}

export function buildSql(constraints: Constraint[], limit: number): string {
  const where =
    constraints.length === 0
      ? "TRUE"
      : constraints.map((c) => c.sql).join("\n  AND ");
  return [
    "SELECT id, make, model, variant, year, price_inr, km_driven, fuel",
    "FROM inventory",
    `WHERE ${where}`,
    "ORDER BY embedding <=> $1",
    `LIMIT ${limit};`,
  ].join("\n");
}

/* ─────────────────────────── the index ─────────────────────────── */

const indexStart = now();
const index: { car: Car; vector: Float32Array }[] = inventory.map((car) => ({
  car,
  vector: embed(carText(car)),
}));
export const INDEX_BUILD_MS = round(now() - indexStart);
export const INDEX_SIZE = index.length;

export const SEARCH_K = 8;
export const MAX_MATCHES = 4;

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/* ─────────────────────────── wire types ─────────────────────────── */

export type CandidateWire = {
  id: string;
  label: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  priceInr: number;
  price: string;
  km: string;
  fuel: string;
  transmission: string;
  owners: number;
  score: number;
  rank: number;
  passed: boolean;
  failures: string[];
};

export type Timings = {
  embedMs: number;
  searchMs: number;
  filterMs: number;
  composeMs: number;
};

export type PipelineResult = {
  query: string;
  dim: number;
  preview: number[];
  /** Top-K by cosine, shown in the search stage. */
  candidates: CandidateWire[];
  /** What the filter actually judged: the top-K plus any returned row below it. */
  evaluated: CandidateWire[];
  matches: CandidateWire[];
  constraints: Constraint[];
  sql: string;
  scanned: number;
  passedTotal: number;
  cutCount: number;
  answer: string;
  timings: Timings;
};

function toWire(car: Car, score: number, rank: number, failures: string[]): CandidateWire {
  return {
    id: car.id,
    label: carLabel(car),
    make: car.make,
    model: car.model,
    variant: car.variant,
    year: car.year,
    priceInr: car.priceInr,
    price: formatLakh(car.priceInr),
    km: `${formatKm(car.kmDriven)} km`,
    fuel: car.fuel,
    transmission: car.transmission,
    owners: car.owners,
    score: round(score),
    rank,
    passed: failures.length === 0,
    failures,
  };
}

/* ─────────────────────────── the pipeline ─────────────────────────── */

export function runPipeline(rawQuery: string): PipelineResult {
  const query = rawQuery.trim();

  // Stage 1 — embed.
  const embedStart = now();
  const queryVector = embed(query);
  const embedMs = round(now() - embedStart);

  // Stage 2 — semantic search across every row. No ANN shortcut at 41 rows;
  // production uses an HNSW index because the table is far larger.
  const searchStart = now();
  const scored = index
    .map((entry) => ({ car: entry.car, score: cosine(queryVector, entry.vector) }))
    .sort((a, b) => b.score - a.score);
  const nearest = scored.slice(0, SEARCH_K);
  const searchMs = round(now() - searchStart);

  // Stage 3 — parse constraints, then enforce them exactly.
  const filterStart = now();
  const constraints = parseConstraints(query);
  const failuresFor = (car: Car): string[] =>
    constraints
      .map((constraint) => evaluate(car, constraint))
      .filter((reason): reason is string => reason !== null);

  const rankOf = new Map(scored.map((entry, i) => [entry.car.id, i + 1]));
  const candidates = nearest.map((entry, i) => toWire(entry.car, entry.score, i + 1, failuresFor(entry.car)));

  const passing = scored.filter((entry) => failuresFor(entry.car).length === 0);
  const matches = passing
    .slice(0, MAX_MATCHES)
    .map((entry) => toWire(entry.car, entry.score, rankOf.get(entry.car.id) ?? 0, []));

  // The filter stage shows the nearest neighbours plus any returned row that
  // ranked outside them — otherwise the answer could cite a car the viewer
  // never saw scored, which is exactly the opacity this demo exists to remove.
  const evaluated = [...candidates];
  for (const match of matches) {
    if (!evaluated.some((candidate) => candidate.id === match.id)) evaluated.push(match);
  }
  evaluated.sort((a, b) => a.rank - b.rank);
  const filterMs = round(now() - filterStart);

  const sql = buildSql(constraints, MAX_MATCHES);

  // Stage 4 — compose an answer strictly from what survived.
  const composeStart = now();
  const answer = composeAnswer(constraints, matches, evaluated, passing.length);
  const composeMs = round(now() - composeStart);

  return {
    query,
    dim: EMBED_DIM,
    preview: vectorPreview(queryVector, 32),
    candidates,
    evaluated,
    matches,
    constraints,
    sql,
    scanned: index.length,
    passedTotal: passing.length,
    cutCount: evaluated.filter((c) => !c.passed).length,
    answer,
    timings: { embedMs, searchMs, filterMs, composeMs },
  };
}

/* ─────────────────────────── composition ─────────────────────────── */

function describe(candidate: CandidateWire): string {
  return `${candidate.label} — ${candidate.price}, ${candidate.km}, ${candidate.fuel}, ${candidate.transmission}, ${candidate.owners} owner${candidate.owners === 1 ? "" : "s"}`;
}

function join(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function constraintList(constraints: Constraint[]): string {
  return join(constraints.map((c) => c.label));
}

/**
 * The most instructive cut is the highest-ranked row that failed on exactly
 * one predicate: semantically close, arithmetically wrong, no ambiguity.
 */
function teachingCut(candidates: CandidateWire[]): CandidateWire | undefined {
  const cuts = candidates.filter((c) => !c.passed);
  return cuts.find((c) => c.failures.length === 1) ?? cuts[0];
}

/**
 * A deterministic response builder, not a language model. Every sentence is
 * assembled from rows that actually survived the filter, so the answer
 * cannot assert anything the data does not contain.
 */
export function composeAnswer(
  constraints: Constraint[],
  matches: CandidateWire[],
  candidates: CandidateWire[],
  passedTotal: number,
): string {
  const cut = teachingCut(candidates);
  const lines: string[] = [];

  if (matches.length === 0) {
    lines.push(
      `Nothing in the ${INDEX_SIZE}-row inventory satisfies ${constraints.length > 0 ? constraintList(constraints) : "this request"}.`,
    );
    if (cut) {
      lines.push(
        `The nearest row by meaning is the ${cut.label} at ${cut.price}, and it fails on ${join(cut.failures)}.`,
      );
      lines.push(
        "Semantic search ranked it highly; the constraint filter removed it rather than round the number in its favour.",
      );
    }
    return lines.join(" ");
  }

  if (constraints.length === 0) {
    lines.push(
      `That query carries no hard constraint, so all ${INDEX_SIZE} rows stay eligible and meaning alone decides the order.`,
    );
  } else {
    lines.push(
      `${passedTotal} ${passedTotal === 1 ? "car" : "cars"} in the ${INDEX_SIZE}-row inventory ${passedTotal === 1 ? "satisfies" : "satisfy"} ${constraintList(constraints)}.`,
    );
  }

  lines.push(`Closest on meaning: ${describe(matches[0])}.`);

  if (matches.length > 1) {
    lines.push(`Also available: ${join(matches.slice(1).map((m) => `${m.label} at ${m.price}`))}.`);
  }

  if (cut) {
    lines.push(
      `One high-similarity row was dropped: the ${cut.label} sits close in vector space, but ${join(cut.failures)}.`,
    );
  }

  return lines.join(" ");
}

/** Split an answer into streamable pieces. Word-level, whitespace preserved. */
export function tokenise(answer: string): string[] {
  return answer.match(/\s*\S+/g) ?? [];
}

/* ─────────────────────────── stream events ─────────────────────────── */

export type DemoEvent =
  | { type: "stage"; stage: "embed"; ms: number; dim: number; preview: number[] }
  | { type: "stage"; stage: "search"; ms: number; scanned: number; candidates: CandidateWire[] }
  | {
      type: "stage";
      stage: "filter";
      ms: number;
      constraints: Constraint[];
      sql: string;
      evaluated: CandidateWire[];
      matches: CandidateWire[];
      passedTotal: number;
      cutCount: number;
    }
  | { type: "stage"; stage: "compose"; ms: number; tokenCount: number }
  | { type: "token"; text: string }
  | { type: "done"; totalMs: number; pipelineMs: number; tokenCount: number; tokensPerSec: number }
  | { type: "error"; kind: "rate-limit" | "invalid" | "server"; message: string };
