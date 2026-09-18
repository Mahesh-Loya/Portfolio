# maheshloya.dev

Personal site for Mahesh Loya — full-stack and AI engineer.

The thesis of the site is the thesis of the work: **noisy reality becomes structured
action.** Hinglish voice notes become booked appointments; a customer's blurry photo
becomes a make and model; a paper queue becomes a status workflow.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run typecheck
```

No environment variables are required. The site runs, and the demo works, with nothing
configured.

The canonical origin used for metadata, Open Graph tags and the sitemap is resolved
at build time: Vercel's own production domain is detected automatically, so deploying
needs no configuration. Once a custom domain exists, set `NEXT_PUBLIC_SITE_URL` and it
takes precedence.

## Link previews

`opengraph-image.tsx` renders the share card for the homepage, and
`work/[slug]/opengraph-image.tsx` renders one per case study from that project's own
title, premise and stack — so a shared case-study link previews as itself rather than
as a generic site card. Both are generated with `ImageResponse` and prerendered at
build time; the fonts are bundled in `assets/` so rendering never depends on the
network.

## The glass box

The centrepiece is an interactive demo that reproduces the hybrid retrieval pipeline
from Vyavsay Assist: a visitor asks something like *"do you have a 2019 Swift under 6
lakh?"* and sees the answer alongside the machinery that produced it — the query
embedding, the ranked candidates with cosine scores, the parsed constraints, the exact
SQL predicate, and which semantically-close candidates were cut and why.

It runs entirely locally. Retrieval, scoring and constraint enforcement are genuinely
computed at request time using a deterministic local embedding over synthetic inventory
— no API keys, no vector database, no per-visit cost. The UI states this plainly. The
production system it models uses OpenAI embeddings on pgvector with an HNSW index.

The demo's point is not that a model can talk. It is that hybrid retrieval is legible
once you can see it: embeddings are good at what someone *means* and bad at what they
*require*, so numeric constraints belong in the database rather than the latent space.

## Structure

```
src/
  app/              routes; /work/[slug] renders case studies
  components/       sections and the glass-box demo
  content/site.ts   single source of truth for every fact on the site
  lib/              embedding, retrieval and inventory for the demo
docs/superpowers/specs/   the design spec this was built from
```

All content lives in `src/content/site.ts`. Nothing on the site is hardcoded in a
component, so facts stay consistent and editable in one place.

## Stack

Next.js 15 (App Router, RSC) · React 19 · TypeScript · Tailwind CSS v4 · Motion ·
deployed on Vercel.

## Accessibility

Keyboard navigable end to end, including the command palette and the architecture
diagram stepper. `prefers-reduced-motion` is respected by the hero shader, the grain
and every scroll animation. Both themes meet WCAG AA contrast.
