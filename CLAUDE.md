# CLAUDE.md — prototype-starter

Template for client prototype projects. Instrumented, testable prototypes for user research and AI product validation. Every spawned project inherits these conventions.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, PostHog, Vercel. AI features use the Anthropic API via server routes, optionally the Vercel AI SDK for streaming.

## Non-negotiables

- The Anthropic API key lives server-side only. All model calls go through `/app/api/*` routes. Never expose the key to the client.
- PostHog init sets `capture_pageview: false`; pageviews are captured manually to avoid App Router duplicates.
- No client data or real user PII in this template repo, ever. Mock data only.
- Prototypes ship with instrumentation on. If an interaction matters to the research question, it has an event.

## Event naming

- snake_case, `object_action` order: `variant_switched`, `transcript_uploaded`, `synthesis_accepted`.
- Every event carries a `variant` property when variants are active.
- Name only research-relevant events. No autocapture noise in dashboards.

## Variant switching

- Variants are driven by a URL param (`?variant=b`) resolved into a typed config object, defaulting to `a`.
- Variant differences live in config, not scattered conditionals. One file defines what changes per variant.

## Component conventions

- Functional components, typed props, named exports for shared components, default export for pages.
- Motion defaults: Framer Motion spring transitions; respect `prefers-reduced-motion`.
- Mock data comes from the data layer (Faker-seeded), never inline lorem ipsum. Include edge cases: long names, empty states, error states.

## Writing style (docs, handoffs, UI copy)

- No dash-based sentence constructions ("it's not just X — it's Y"). Plain, direct sentences.
