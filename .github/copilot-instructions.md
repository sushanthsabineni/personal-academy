# AI Coding Agent Instructions (Personal Academy)# AI Coding Agent Instructions



This file gives focused, actionable knowledge for an AI coding agent to be productive in this repo.Welcome to the Personal Academy codebase! This document provides essential guidelines for AI coding agents to be productive and aligned with the project's architecture, workflows, and conventions.



**Key facts (quick):** Next.js (App Router) — v16, React v19, TypeScript v5, Tailwind v3, Supabase (Postgres). Playwright is used for E2E tests.---



## Core areas to inspect first## 📂 Project Overview



- `app/` — Next.js App Router routes. Example: `app/create` contains the multi-step course creation wizard; `app/admin` is the admin dashboard.Personal Academy is an AI-powered e-learning platform built with the following stack:

- `components/` — reusable UI (look in `components/course`, `components/layout`, `components/ui`).- **Framework:** Next.js 15 (App Router) + React 19

- `lib/` — shared utilities: `lib/supabase/` (DB helpers), `lib/auth.ts`, `lib/i18n/`, `lib/analytics.ts` (GA4 hooks).- **Language:** TypeScript 5

- `tests/` — Playwright E2E tests and helpers.- **Styling:** Tailwind CSS 4

- **Database:** Supabase (PostgreSQL)

## Essential scripts (exact)- **Authentication:** Supabase Auth

- **Analytics:** Google Analytics 4

- Start dev server: `npm run dev` (runs `next dev`).

- Build: `npm run build` (runs `next build`).Key features include:

- Lint: `npm run lint` (runs `eslint`).- AI-powered course generation

- E2E: `npm run test:e2e` (runs `playwright test`).- Multi-step course creation wizard

```md

## Environment & infra notes# AI Coding Agent Instructions (Personal Academy)



- Uses Supabase for DB + auth. Put credentials in `.env.local` for local dev. See `DATABASE_SCHEMA.md` for migrations.This file gives focused, actionable knowledge for an AI coding agent to be productive in this repo.

- Storage buckets the app expects: `user-uploads`, `course-exports` (create in Supabase if missing).

- Recommended deploy: Vercel (app uses Next.js). GA4 tracking lives in `lib/analytics.ts`.Key facts (quick): Next.js (App Router) — v16, React v19, TypeScript v5, Tailwind v3, Supabase (Postgres). Playwright is used for E2E tests.



## Third-party integrations to be aware ofCore areas to inspect first

- `app/` — Next.js App Router routes. Example: `app/create` contains the multi-step course creation wizard; `app/admin` is the admin dashboard.

- Supabase (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`).- `components/` — reusable UI (look in `components/course`, `components/layout`, `components/ui`).

- AI SDKs present: Anthropic (`@anthropic-ai/sdk`), Google generative (`@google/generative-ai`), OpenAI (`openai`). Expect server-side usage patterns in `lib/` and `app/api` routes.- `lib/` — shared utilities: `lib/supabase/` (DB helpers), `lib/auth.ts`, `lib/i18n/`, `lib/analytics.ts` (GA4 hooks).

- Payment/export libs: `razorpay`, `docx`, `jspdf`, `pptxgenjs` — used by export and purchase flows.- `tests/` — Playwright E2E tests and helpers.



## Project-specific conventions (discoverable)Essential scripts (exact)

- Start dev server: `npm run dev` (runs `next dev`).

- App Router first: prefer files under `app/` over `pages/` (there is no `pages/` directory). Use server and client components explicitly.- Build: `npm run build` (runs `next build`).

- Shared data access lives in `lib/supabase/*` — prefer these helpers instead of calling Supabase client directly from many places.- Lint: `npm run lint` (runs `eslint`).

- Types: repo uses strict TypeScript. Add or reuse types in `types/` or near the related feature.- E2E: `npm run test:e2e` (runs `playwright test`).

- Styling: Tailwind utility classes (v3). Prefer componentized UI in `components/ui`.

Environment & infra notes

## Quick contract for changes (follow this for PRs)- Uses Supabase for DB + auth. Put credentials in `.env.local` for local dev. See `DATABASE_SCHEMA.md` for migrations.

- Storage buckets the app expects: `user-uploads`, `course-exports` (create in Supabase if missing).

- Inputs: small focused feature/bug + targeted tests.- Recommended deploy: Vercel (app uses Next.js). GA4 tracking lives in `lib/analytics.ts`.

- Output: changed files + unit/e2e test(s) covering critical path + updated docs if behavior changed.

- Error modes: preserve existing behavior; mention any DB migrations and required env vars in PR description.Third-party integrations to be aware of

- Supabase (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`).

## Common places to check for context when editing- AI SDKs present: Anthropic (`@anthropic-ai/sdk`), Google generative (`@google/generative-ai`), OpenAI (`openai`). Expect server-side usage patterns in `lib/` and `app/api` routes.

- Payment/export libs: `razorpay`, `docx`, `jspdf`, `pptxgenjs` — used by export and purchase flows.

- Course creation flows: `app/create/**` (UI + server actions), lesson modules in `lib/`.

- Auth flows: `lib/auth.ts` and any `app/account` routes.Project-specific conventions (discoverable)

- Admin UI & reports: `app/admin` and `docs/ADMIN_*` files.- App Router first: prefer files under `app/` over `pages/` (there is no `pages/` directory). Use server and client components explicitly.

- Shared data access lives in `lib/supabase/*` — prefer these helpers instead of calling Supabase client directly from many places.

## Edge cases to verify while editing- Types: repo uses strict TypeScript. Add or reuse types in `types/` or near the related feature.

- Styling: Tailwind utility classes (v3). Prefer componentized UI in `components/ui`.

- Missing or invalid Supabase env vars (app should fail fast in server logs).

- Large exports (ppt/docx/pdf) memory/timeouts.Quick contract for changes (follow this for PRs)

- i18n keys missing in `lib/i18n/`.- Inputs: small focused feature/bug + targeted tests.

- Output: changed files + unit/e2e test(s) covering critical path + updated docs if behavior changed.

## How to run locally (Win PowerShell)- Error modes: preserve existing behavior; mention any DB migrations and required env vars in PR description.



```powershellCommon places to check for context when editing

# install deps- Course creation flows: `app/create/**` (UI + server actions), lesson modules in `lib/`.

npm install- Auth flows: `lib/auth.ts` and any `app/account` routes.

# start dev server- Admin UI & reports: `app/admin` and `docs/ADMIN_*` files.

npm run dev

# run playwright E2EEdge cases to verify while editing

npm run test:e2e- Missing or invalid Supabase env vars (app should fail fast in server logs).

```- Large exports (ppt/docx/pdf) memory/timeouts.

- i18n keys missing in `lib/i18n/`.

## Example tasks & test templates

How to run locally (Win PowerShell)

For concrete, copy-paste-ready examples of common tasks:```powershell

# install deps

- **`docs/AGENT_EXAMPLE_TASKS.md`** — Two detailed task walk-throughs:npm install

  1. Add a new API route that queries Supabase (with starter code)# start dev server

  2. Add a Playwright test for admin features (with page objects & test template)npm run dev

  - Includes code snippets, error handling patterns, and common patterns for Supabase/Playwright# run playwright E2E

npm run test:e2e

- **Test templates in `tests/e2e/`:**```

  - `admin-login.spec.ts` — admin authentication and dashboard navigation

  - `course-creation-outline.spec.ts` — course wizard flow outlineWhere to update docs

- Add feature-level notes to `docs/` and, when relevant, update `DATABASE_SCHEMA.md` for DB changes.

Adapt these templates to your actual selectors and features.

When in doubt

## Where to update docs- Trace the feature entry in `app/` and then follow to `components/` and `lib/` helpers. Prefer editing helper functions in `lib/` for cross-cutting changes.



- Add feature-level notes to `docs/` and, when relevant, update `DATABASE_SCHEMA.md` for DB changes.Please review — if there are areas you'd like more specifics for (example API route names, common helpers), tell me which surface and I will expand this file.

``` 
## When in doubt

- Trace the feature entry in `app/` and then follow to `components/` and `lib/` helpers. Prefer editing helper functions in `lib/` for cross-cutting changes.
- Review `docs/AGENT_EXAMPLE_TASKS.md` for concrete patterns on API routes, tests, and Supabase usage.
