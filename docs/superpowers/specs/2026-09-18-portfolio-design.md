# Portfolio — Design Spec

**Owner:** Mahesh Loya
**Date:** 2026-09-18
**Status:** Approved

## Goal

A personal site aimed at the developer/AI community that establishes Mahesh as an engineer who
builds AI-native systems that ship and get used — not an engineer who has read about them.

Success means a reader who has never heard of him comes away able to name a specific technical
insight of his, and shares the link.

## Concept: Signal

Every system in his portfolio performs the same transformation: messy real-world signal becomes
structured action.

- Hinglish voice notes → a booked appointment
- A customer's blurry car photo → a make and model
- A phone call in Marathi → a qualified lead
- A paper form queue → a status workflow

The site's thesis: **"I make noisy reality machine-readable."** This governs both the content
hierarchy and the visual language (waveforms, grain, dithering, vector space).

## Audience and consequences

Primary audience is the dev/AI community (X, LinkedIn, GitHub, Hacker News).

Design consequences:

- Depth beats breadth. One deeply explained system outperforms six listed ones.
- The site's own build quality is part of the argument; it will be read as a work sample.
- Content must teach. This audience shares things that make them smarter, not things that
  make someone else look good.
- Recruiters remain a secondary audience and must be able to get the resume in one click.

## Visual identity

| Token | Value | Notes |
| --- | --- | --- |
| Canvas (dark) | `#0A0A0B` | Default theme |
| Canvas (light) | `#FBFBF9` | Full parity, not an afterthought |
| Text | Bone white `#EDEDE8` / ink `#141414` | |
| Accent | Acid lime `#C6F24E` | Single accent. Deliberately not default-LLM purple |
| Muted | Slate greys, 4 steps | |

- **Type:** tight grotesk for UI, true mono for data/code, editorial serif for long-form prose.
  The serif signals that case studies are meant to be read.
- **Texture:** film grain plus ordered dithering over the dark ground. Subtle. Gives the site a
  photographed rather than generated feel, consistent with his Pictoreal photography role.
- **Motion:** a custom GPU shader in the hero — a flow field resolving from noise into a clean
  waveform. States the concept in one gesture. Honours `prefers-reduced-motion` with a static
  frame and pauses when offscreen.

## Structure

1. **Hero** — shader, name, one-line thesis, live status
2. **Glass-box demo** — the hero moment (below)
3. **Case studies** — Vyavsay Assist, Voice AI Receptionist, Blood Donation Drive; each with a
   steppable animated architecture diagram
4. **Engineering notes** — short essays on the barge-in playout-buffer bug, TTL as a correctness
   control, and exact-vs-approximate filtering. The primary shareable surface.
5. **Capability map** — the stack rendered as a system diagram, not a badge wall
6. **Credentials** — hackathon win, PICT, Pictofest leadership; compact
7. **Contact** — plus one-click resume download

A ⌘K command palette provides navigation and speaks the audience's idiom.

## The glass-box demo

A visitor asks a natural-language question such as *"do you have a 2019 Swift under 6 lakh?"*
The view splits:

- **Left:** the answer streaming token by token.
- **Right:** the machinery, live — query embedding, retrieved inventory chunks with cosine
  scores, the SQL filter (`year = 2019 AND price <= 600000`) applied exactly, tool calls,
  tokens/sec, end-to-end latency.

The demo's purpose is not to show that a model can talk. It is to show a RAG pipeline with the
lid off, demonstrating the resume's specific claim — fusing semantic search with hard SQL
constraints so numeric limits are enforced rather than approximated.

### Constraints

- Embeddings precomputed at build time over a fixed synthetic inventory (~40 vehicles).
- Cosine similarity computed in memory. No vector database, no running infrastructure cost.
- Per-IP rate limiting and a hard daily spend ceiling.
- On budget exhaustion, missing API key, or upstream failure, the demo replays a recorded
  transcript with the same visuals. It degrades; it never breaks.
- The synthetic inventory is labelled as synthetic in the UI. No fabricated dealership data.

## Stack

- Next.js 15 (App Router, React Server Components, streaming) + React 19
- TypeScript, strict
- Tailwind CSS v4 (CSS-first `@theme` configuration)
- Motion for orchestration; native CSS scroll-driven animations where supported
- View Transitions API for route transitions
- MDX for case studies and engineering notes
- Vercel AI SDK v5 for the streaming demo route
- Deployed on Vercel

Chosen to be modern enough that the build is itself a credential, and conventional enough to
still work in two years.

## Non-goals

- No CMS. Content lives in MDX in the repo.
- No blog engine, comments, or newsletter.
- No analytics beyond privacy-respecting page counts.
- No three.js scene. One restrained shader only.
- No "chat with my resume" agent. The glass-box demo covers the AI surface with more substance.

## Accessibility and performance budget

- Keyboard navigable end to end, including the command palette and diagram stepper.
- `prefers-reduced-motion` respected by the shader, grain, and all scroll animations.
- Colour contrast meets WCAG AA in both themes.
- Lighthouse performance ≥ 90 on mobile; LCP under 2.5s on a mid-tier device.
- The site renders fully without JavaScript for all content sections; only the demo, shader,
  and palette require it.

## Open assumptions

1. Deployment to Vercel on a custom domain.
2. GitHub repositories are public and linkable from case studies.

These do not block implementation; both degrade gracefully if untrue.
