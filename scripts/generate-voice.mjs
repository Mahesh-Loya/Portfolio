/**
 * Generates the tour narration once, on this machine, and writes static MP3s.
 *
 *   npm run voice           regenerate anything whose text changed
 *   npm run voice -- --all  regenerate everything
 *   npm run voice -- intro  regenerate one chapter
 *
 * Deliberately NOT part of `next build`: deploys need no API key, cost nothing,
 * and the demo keeps working at zero credits because the audio is committed.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "audio");
const NARRATION = join(ROOT, "src", "content", "narration.json");
const MANIFEST = join(ROOT, "src", "content", "audio-manifest.json");

const API = "https://api.elevenlabs.io/v1";

/** Reads .env.local without pulling in a dependency to do it. */
async function loadEnv() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  const text = await readFile(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (value && !process.env[key]) process.env[key] = value;
  }
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

const hash = (value) => createHash("sha1").update(value).digest("hex").slice(0, 12);

async function readManifest() {
  if (!existsSync(MANIFEST)) return { chapters: {} };
  try {
    return JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch {
    return { chapters: {} };
  }
}

/**
 * Asks for character-level timings alongside the audio so captions can be
 * highlighted word by word rather than guessed at.
 */
async function synthesize({ apiKey, voiceId, text, model, settings }) {
  const response = await fetch(
    `${API}/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: model, voice_settings: settings }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 401) fail("ElevenLabs rejected the key (401). Check ELEVENLABS_API_KEY.");
    if (response.status === 402) fail("Out of ElevenLabs credits (402). Nothing was written.");
    if (response.status === 422) fail(`ElevenLabs rejected the request (422).\n  ${body.slice(0, 400)}`);
    fail(`ElevenLabs returned ${response.status}.\n  ${body.slice(0, 400)}`);
  }

  const payload = await response.json();
  return {
    audio: Buffer.from(payload.audio_base64, "base64"),
    alignment: payload.normalized_alignment ?? payload.alignment ?? null,
  };
}

async function main() {
  await loadEnv();

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) fail("ELEVENLABS_API_KEY is empty. Add it to .env.local, then run this again.");
  if (!voiceId) fail("ELEVENLABS_VOICE_ID is empty. Add it to .env.local, then run this again.");

  const spec = JSON.parse(await readFile(NARRATION, "utf8"));
  const manifest = await readManifest();
  await mkdir(OUT_DIR, { recursive: true });

  const args = process.argv.slice(2);
  const force = args.includes("--all");
  const only = args.filter((a) => !a.startsWith("--"));

  const chapters = only.length
    ? spec.chapters.filter((c) => only.includes(c.id))
    : spec.chapters;

  if (!chapters.length) fail(`No chapters matched: ${only.join(", ")}`);

  const settingsKey = JSON.stringify(spec.voiceSettings) + spec.model + voiceId;
  let written = 0;
  let skipped = 0;
  let characters = 0;

  for (const chapter of chapters) {
    const fingerprint = hash(chapter.text + settingsKey);
    const file = join(OUT_DIR, `${chapter.id}.mp3`);
    const unchanged =
      !force && manifest.chapters[chapter.id]?.hash === fingerprint && existsSync(file);

    if (unchanged) {
      skipped += 1;
      console.log(`  skip   ${chapter.id.padEnd(8)} unchanged`);
      continue;
    }

    process.stdout.write(`  write  ${chapter.id.padEnd(8)} ${chapter.text.length} chars … `);
    const { audio, alignment } = await synthesize({
      apiKey,
      voiceId,
      text: chapter.text,
      model: spec.model,
      settings: spec.voiceSettings,
    });

    await writeFile(file, audio);
    manifest.chapters[chapter.id] = {
      hash: fingerprint,
      file: `/audio/${chapter.id}.mp3`,
      bytes: audio.length,
      title: chapter.title,
      target: chapter.target,
      text: chapter.text,
      alignment,
    };
    written += 1;
    characters += chapter.text.length;
    console.log(`${(audio.length / 1024).toFixed(0)} KB`);
  }

  manifest.voiceId = voiceId;
  manifest.model = spec.model;
  manifest.generatedAt = new Date().toISOString();
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  const total = Object.values(manifest.chapters).reduce((sum, c) => sum + (c.bytes ?? 0), 0);
  console.log(
    `\n  ${written} written, ${skipped} unchanged · ${characters} characters used · ${(total / 1024 / 1024).toFixed(2)} MB total\n`,
  );
}

main().catch((error) => fail(error?.stack ?? String(error)));
