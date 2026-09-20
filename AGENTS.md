# Civix: AI Civic Grievance Triage & Router

> Cross-tool agent instructions (Antigravity, Cursor, Claude Code, Codex). Antigravity-specific overrides live in `GEMINI.md`. Detailed rules live in `.agent/rules/`.

## What we're building
Civix turns a **photo + short voice/text description + geotag** into a formal, categorized, severity-scored civic ticket routed to the correct municipal department. It **detects duplicates** (same issue, same place) and merges them into one ticket with a higher priority. Admins see a **Kanban board and a clustered map**.

Built for **HACKDAY 1.0** (theme: *Tech for a Better Tomorrow*). Build window: one day, 9 AM to 5 PM. Judged on Problem & Impact 25%, Innovation 20%, Technical 25%, UX 15%, Feasibility 15%.

## The demo moment (protect this above everything)
1. Citizen submits a pothole photo, AI classifies it: Roads, Critical, formal ticket generated.
2. A "second citizen" submits the same pothole from nearby.
3. It **merges** into the existing ticket: "Reported by 2 people", priority score goes up.
4. Admin view shows the ticket moving up the Kanban and a clustered pin on the map.

If a task doesn't serve this flow, it is lower priority.

## Tech stack
Next.js (App Router) + TypeScript, Tailwind CSS, lucide-react, Supabase (Postgres + Storage), Leaflet/react-leaflet + OpenStreetMap (no API key), Gemini API via `@google/genai` (Claude as swappable provider), Zod, Web Speech API. Deploy on Vercel.

## Commands
```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # must pass before deploy
npm run lint
npm run typecheck   # tsc --noEmit
npm run seed        # inserts 15-20 demo tickets
```

## Project structure
```
src/app/                 pages + API routes (App Router)
  page.tsx               landing + Citizen/Admin toggle
  report/page.tsx        citizen reporting flow
  admin/page.tsx         Kanban + Map tabs
  api/reports/route.ts   POST: analyze -> dedupe -> create/merge
  api/tickets/route.ts   GET: list tickets
  api/tickets/[id]/route.ts  PATCH: status update
src/components/{report,admin,ui}/
src/lib/ai/              client, prompts, schema, classify, dedupe
src/lib/{geo,priority,departments,types}.ts
src/lib/supabase/{server,browser}.ts
src/data/{seed,pois}.ts
scripts/seed.ts
docs/                    PRD, ARCHITECTURE, TASKS, DEMO_SCRIPT, PPT_OUTLINE
.agent/{rules,workflows,skills}/
```

## Non-negotiables
- **No auth.** Role is a simple Citizen/Admin toggle stored client-side. Say so in the README.
- **API keys never reach the browser.** All AI calls happen in route handlers. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be public.
- **AI output is validated with Zod** before use. Never trust raw model text.
- **Every AI call has a fallback.** If the model fails, create the ticket as `Other / Needs Review` rather than blocking the citizen.
- **Mobile-first.** The citizen flow is used on a phone; test at 390px width.
- **Ship small.** A working end-to-end flow beats extra features. Commit after every working step.

## Where to look
- Product scope: `docs/PRD.md`
- Architecture, DB schema, API contracts: `docs/ARCHITECTURE.md`
- Task checklist by hour: `docs/TASKS.md`
- Rules: `.agent/rules/` | Workflows (`/scaffold`, `/build-classifier`, ...): `.agent/workflows/`
- Skills: `.agent/skills/`
