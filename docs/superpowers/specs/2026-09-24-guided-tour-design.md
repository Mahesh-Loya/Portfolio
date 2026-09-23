# Guided Tour, Voice Avatar and Product Simulations — Design Spec

**Owner:** Mahesh Loya
**Date:** 2026-09-24
**Status:** Awaiting review

## Goal

The site currently *claims* two things it never lets anyone experience: a WhatsApp copilot
that understands Hinglish voice notes, and a voice agent that survives being interrupted
mid-sentence. This work closes that gap.

Three additions, in order of value:

1. **Product simulations** — a replayable WhatsApp thread and a live phone call, so the two
   flagship claims become things a visitor does rather than reads.
2. **A guided tour** — an opt-in, chaptered walkthrough narrated in Mahesh's own cloned
   voice.
3. **An avatar** — a presence that makes the tour feel authored rather than automated.

Success means a visitor who arrives from LinkedIn on a phone can, in ninety seconds,
*experience* the work rather than take its description on trust.

## Non-negotiable constraints

These are design decisions, not preferences. Each one prevents a specific failure.

| Constraint | Failure it prevents |
| --- | --- |
| Audio never plays without a click | Browsers block autoplay anyway; unprompted speech reads as a 2004 homepage |
| All audio generated at build time, committed as static files | Per-visit API cost, credit exhaustion, latency, and a demo that breaks when the balance hits zero |
| Every spoken word also present as text | Most mobile visitors browse muted; also the accessibility floor |
| Tour exitable at any moment, never modal | A recruiter with ninety seconds must be able to leave instantly |
| `prefers-reduced-motion` disables auto-scroll and particle motion | Vestibular safety |
| Simulations are scripted and offline | No API keys, no runtime cost, cannot fail live |

The build-time audio decision is the load-bearing one: `npm run voice` is a separate manual
script, never part of `next build`. Deploys therefore need no API key and cost nothing.

## The avatar

### Recommendation: a point-cloud portrait

A real photograph of Mahesh, sampled into a 3D point cloud and rendered in WebGL. Each
pixel's luminance becomes a point displaced along Z, so the portrait has genuine depth and
parallax. It drifts gently when idle, tilts subtly with cursor or device orientation, and
the points scatter and settle in response to the actual amplitude of his voice while a
chapter plays.

Why this over the alternatives:

- **It is genuinely 3D and genuinely him** — the two things the brief asked for.
- **It cannot be uncanny**, because it never pretends to lip-sync. Nothing looks worse than
  a mouth that is almost right.
- **It is on-brand.** The site is already built from grain, dithering and waveforms. A
  portrait made of points that react to a voice is the same idea applied to a face.
- **It costs nothing and needs no extra service** — one photo, no ML model, no subscription.
- It stays under ~200KB and renders on a phone.

### On the photoreal video avatar

This was the stated preference, so here is the honest trade-off rather than a silent
override.

A generated talking-head video (HeyGen, D-ID, Synthesia class) would need a paid
subscription, a separate render per chapter, and 2–5MB of video per chapter. Lip-sync
quality on Indian-accented English is inconsistent, and the failure mode is not "slightly
off" but "unsettling". It also reads as a recognisable template to exactly the technical
audience this site is built for — the opposite of what the rest of the site signals.

**Therefore:** the avatar is built behind a `Presenter` interface with the point-cloud
portrait as the first implementation. If the video avatar is still wanted after seeing the
portrait running, it drops in as a second implementation without touching the tour, the
audio pipeline, or the captions. The decision stays reversible and costs nothing to defer.

## The guided tour

### Invitation

After the visitor has been on the page for a few seconds, or when they first pause
scrolling, a small non-modal card appears in the lower corner: the avatar, one line of
text, and two buttons — *Take the tour* and *No thanks*. Dismissal is remembered in
`localStorage`; it never asks twice. It never covers content, never blocks scrolling, and
never makes a sound before it is accepted.

### Chapters

Accepting opens a chapter menu rather than starting a monologue, because a recruiter and a
prospective client want different things.

| # | Chapter | Target | Approx. |
| --- | --- | --- | --- |
| 0 | Who I am and what this is | `#main` | 20s |
| 1 | What I build | `#build` | 35s |
| 2 | Retrieval, with the lid off | `#demo` | 45s |
| 3 | The WhatsApp copilot | `#work` | 40s |
| 4 | The voice agent, and the bug | `/work/voice-ai-receptionist` | 45s |
| 5 | How I think about systems | `#notes` | 35s |
| 6 | Background, and how to reach me | `#about` | 25s |

Roughly four minutes end to end, but no visitor is expected to take all of it — that is the
point of chaptering. Chapter 0 auto-advances into the menu; every other chapter ends by
returning to the menu with the next chapter highlighted.

### While a chapter plays

- The page smooth-scrolls to the chapter's target element, then stops. Scrolling is never
  locked; if the visitor scrolls away, narration continues and a "return to the tour"
  affordance appears.
- Captions appear in a fixed bar at the bottom, word-highlighted using character-level
  timestamps returned by the ElevenLabs API.
- The avatar sits beside the captions, reacting to amplitude.
- Controls: pause, previous, next, exit, mute, and a transcript toggle that reveals the full
  text of the chapter.
- Keyboard: space pauses, arrows move between chapters, Escape exits.

## Product simulations

These ship independently of the tour and are valuable on their own. The tour links to them;
it does not own them.

### WhatsApp simulation — on the Vyavsay Assist case study

A replay of a real-shaped conversation, in a WhatsApp-like thread framed to sit inside the
site rather than imitate a screenshot:

1. Customer sends a text in Hinglish.
2. Typing indicator, then the assistant replies with matching inventory.
3. Customer sends a **voice note** — a real audio bubble with a waveform and a working
   play button, in Mahesh's cloned voice speaking Hinglish.
4. Assistant transcribes it on screen and answers.
5. Customer sends a **photo** of a car; the assistant identifies make and model.
6. Assistant books a test drive and confirms.

Controls: play, restart, and step-through. Message timing and typing durations are scripted
per message so it feels like a conversation rather than a dump. Every bubble is real text in
the DOM, so it is readable with audio off and by screen readers.

A small caption states plainly that this is a scripted replay of a real product, with a link
to the live product. The site does not pretend a simulation is a live system.

### Call simulation — on the Voice AI Receptionist case study

A phone-call interface: an incoming call, an answer button, then the conversation playing
with a transcript building live and the pipeline stages (VAD → STT → LLM → TTS) lighting as
each turn passes through them.

**The interrupt demo — the centrepiece.** A button labelled *Interrupt him* appears while
the agent is speaking, with a toggle beside it:

- **Without the fix:** generation halts, but the already-buffered audio keeps playing. The
  visitor hears the agent talk over them, and the UI shows the playout buffer still draining.
- **With the fix:** an explicit clear control frame flushes the buffer. The agent stops
  mid-word, instantly.

The visitor can hear the bug and then hear it fixed. This turns the single sharpest
engineering insight on the site into something experienced rather than described, and it is
the most defensible "I actually built this" signal available.

## Architecture

```
scripts/generate-voice.ts        Build-time only. Reads narration + scripts,
                                 calls ElevenLabs with timestamps, writes
                                 public/audio/*.mp3 and timings JSON.
                                 Run via `npm run voice`. Never in `next build`.

src/content/narration.ts         Chapter scripts (text + target element)
src/content/whatsapp-script.ts   Message sequence with timing
src/content/call-script.ts       Call turns, stage timings, interrupt points
src/content/audio-timings.json   Generated. Character-level alignment.

src/components/tour/
  tour-provider.tsx              State machine + context
  use-tour-audio.ts              Single audio element + AnalyserNode
  tour-invitation.tsx            The opt-in card
  tour-menu.tsx                  Chapter chooser
  tour-hud.tsx                   Captions, controls, progress
  presenter.tsx                  Presenter interface + point-cloud portrait

src/components/sim/
  whatsapp-thread.tsx
  call-console.tsx
```

The tour mounts once in the root layout. Simulations mount only on their own case-study
pages, and their audio loads on interaction, never on page load.

### State machine

`idle → invited → (dismissed | menu) → playing → (paused | menu | exited)`

One `HTMLAudioElement` for the whole tour, reused across chapters, so only one sound can
ever play. The simulations use their own element and pause the tour if it is running —
two voices must never overlap.

## Performance budget

- Audio lazy-loads on interaction only; nothing audio-related touches first load.
- Target total audio under 3MB at 64kbps mono; individual chapters under 400KB.
- The point-cloud canvas mounts only when the avatar is on screen and pauses when hidden.
- Lighthouse performance must not drop below its current level; LCP must be unchanged,
  because none of this is above the fold.

## Accessibility

- Every word spoken is present as text, in captions and in a transcript panel.
- The tour is fully keyboard operable and the HUD is a labelled region, not a dialog trap.
- `prefers-reduced-motion` disables auto-scroll, particle motion and typing animations;
  simulations render their full thread immediately instead of replaying.
- Captions meet AA contrast against the page beneath them.
- The invitation is dismissible by keyboard and never steals focus.

## What Mahesh needs to prepare

1. **Voice samples** for cloning — two to three minutes of clean speech, one take, quiet
   room, no music, speaking naturally rather than reading stiffly. ElevenLabs Instant Voice
   Cloning needs consent that the voice is his own, which it is.
2. **A photo** for the avatar — high resolution, face well lit, plain or simple background,
   looking at the camera. The point cloud is built from luminance, so contrast matters more
   than colour.
3. **An ElevenLabs API key**, in `.env.local` as `ELEVENLABS_API_KEY`. Used only by
   `npm run voice`, never at runtime, never committed.
4. **A decision on the call script's language** — the demo is more convincing in Hindi or
   Marathi with English captions, matching the real product.

## Non-goals

- No live LLM calls anywhere in this feature. Everything is pre-generated.
- No lip-sync, in any implementation.
- No video avatar in this phase; the interface leaves room for one.
- No background music.
- No analytics on tour completion.

## Risks

| Risk | Mitigation |
| --- | --- |
| Tour feels patronising to a technical visitor | Chaptered, skippable, never auto-starts, never blocks |
| Cloned voice sounds unconvincing | Sample quality is the main driver; re-record before writing scripts. If it is not good, stock voice is a one-line swap |
| Simulations read as fake | Say plainly that they are scripted replays, and link to the live product |
| Audio weight hurts mobile | Lazy-loaded on interaction, budgeted, never on first load |
| Scope is large for one session | Simulations ship first and stand alone; the tour can land in a second pass |

## Build order

The simulations carry most of the value and have none of the tour's risk, so they go first.

1. Voice generation script and the cloned voice, verified on one line of audio.
2. WhatsApp simulation.
3. Call simulation, including the interrupt demo.
4. Tour state machine, captions and HUD.
5. Point-cloud avatar.
6. Invitation and chapter menu.

Each step is independently shippable. If the session ends after step 3, the site is already
meaningfully better and nothing is half-built.
