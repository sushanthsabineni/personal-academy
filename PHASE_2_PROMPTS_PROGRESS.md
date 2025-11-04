# Phase 2 — Admin Prompts + Tokenization

Status: Paused (awaiting your changes)

## Snapshot
- Goal: Centralize AI prompts (System + User) with drag-and-drop tokens; keep secrets server-only; make prompts use real course inputs across Essentials → Multimedia → Modules/Lessons → Storyboard.
- Current state: Core infra done, UI delivered, several endpoints wired to templates, token coverage expanded (incl. assessments).

## What’s Implemented
- System + User prompts (server-only)
  - Each AI call now sends a separate System message (persona/guardrails) and a User message (task + tokens).
- Admin Prompts UI (/admin/config/prompts)
  - Pick a prompt key; edit System preamble + Template; insert tokens; preview; save with versioning; view last 10 versions; basic model/temperature/max_tokens inputs.
- Token resolver (server-only)
  - Resolves course, modules/lessons summaries, and Multimedia selections.
  - Defaults enforced (modules=6, lessons=10 per module, files=5, slides=3). Per-template limits support is scaffolded via tokens_schema.
- Multimedia
  - Voice & Tone picker (+ “Let AI decide”). Persisted to DB (courses.voice_tone).
  - Tokenized assessments (knowledge_assessments) and other multimedia flags.
- Endpoints wired to templates
  - Enhance Outcomes → key: `learning_outcomes` (System+User)
  - Generate Structure → key: `course_structure` (System+User)
  - Enhance Content (lesson) → key: `lesson_enhance` (System+User)
  - Enhance Content (module) → key: `module_enhance` (System+User)
  - Generate Slides → key: `slides` (System+User) per lesson
- Streaming templates seeded (not yet wired)
  - `stream_course_structure`, `stream_lesson_content`, `stream_quiz_questions`, `stream_assessment`

## DB Migrations (applied)
- 008_course_voice_tone.sql — adds `voice_tone` (and future-ready `brand_guidelines`).
- 009_admin_prompt_templates.sql — templates + versions tables, admin-only RLS; seeds 4 base templates.
- 010_prompt_streaming_templates.sql — seeds streaming prompt keys.
- 011_module_enhance_template.sql — seeds `module_enhance` template.

## Files of Interest
- UI: `app/admin/config/prompts/page.tsx`
- API (admin):
  - `app/api/admin/prompts/route.ts` (GET/PUT)
  - `app/api/admin/prompts/preview/route.ts` (POST preview)
- Server prompt infra:
  - `lib/prompts/tokenResolver.server.ts`
  - `lib/prompts/templates.server.ts`
  - `lib/prompts/limits.ts`
- Wired endpoints:
  - `app/api/course/enhance-outcomes/route.ts`
  - `app/api/course/generate-structure/route.ts`
  - `app/api/course/enhance-content/route.ts`
  - `app/api/course/generate-slides/route.ts`
- Streaming (pending wiring):
  - `lib/ai/streaming.ts`
  - `app/api/course/ai-stream/route.ts`

## Security & Privacy
- Keys remain server-only; no exposure in client.
- Admin-only RLS on prompt tables; owner-only RLS on course data.
- Prompt resolution/server calls only occur on server routes.

## How to Test (quick)
1) Admin Prompts
   - Visit `/admin/config/prompts`.
   - Select a key; insert tokens (Essentials/Multimedia/Structure); Preview with a real `courseId`; Save.
2) Multimedia
   - Visit `/create/multimedia`; set Voice & Tone (or "Let AI decide") and Assessments; confirm persistence (reload).
3) AI calls
   - `AI Enhance` on Essentials → uses `learning_outcomes`.
   - Generate Structure on Modules → uses `course_structure`.
   - Enhance Content (lesson/module) → uses `lesson_enhance` / `module_enhance`.
   - Storyboard Generate Slides → uses `slides` per lesson.

## Paused Next Steps
- Streaming wiring (Phase 2)
  - Map generationType to streaming templates and render System+User messages via token resolver.
- Limits editor in Admin UI
  - Surface per-template caps (modules/lessons/files/slides) stored in `tokens_schema.limits`.
- Version restore UX
  - One-click "Restore this version" (currently you can load then save).

## Phase 3 (planned)
- Re-ranking & Ensemble (off by default)
  - Add Admin toggles per prompt key (k-sampling re-rank; primary+fallback ensemble) with cost caps.
- Experiments (A/B)
  - Define variants per prompt key; traffic split; log experiment_id in `ai_generations`.

## Rollback Plan
- Admin templates: revert to prior version in UI or deactivate specific keys.
- Endpoints: if needed, disable template usage by clearing template content (fallback logic remains for core flows).

---
This document will track progress while Phase 2 is paused. When ready, we can resume with streaming wiring + limits editor + restore button, then implement re‑ranking/ensemble and experiments.
