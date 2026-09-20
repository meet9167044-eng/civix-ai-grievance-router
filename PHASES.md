# Civix: Phase-by-Phase Build Playbook

> One file that drives the whole build. The agent executes **one phase at a time**, proves it works, records progress, and stops for approval.
> Kickoff prompt to paste into Antigravity:
> **"Read PHASES.md fully. Follow the Execution Protocol. Start with the first phase not marked DONE."**

Project: **Civix**, an AI civic grievance triage and router (HACKDAY 1.0, build window 9:00 AM to 5:00 PM).
One-liner: photo + voice/text + geotag becomes a formal, categorized, severity-scored ticket routed to the right department; duplicates merge into one higher-priority ticket; admins get a Kanban board and a map.

---

## 1. Execution Protocol (the agent MUST follow this)

1. **One phase at a time.** Open the Progress Tracker, find the first phase whose status is not `DONE`. Never start a later phase early.
2. **Loop for every phase:**
   1. Read the phase fully. Post a short plan (5 lines max). Do not wait for approval unless the phase says `ASK FIRST`.
   2. Execute the tasks in order.
   3. Run every check in the phase's **Exit Gate**. Show evidence (command output or a browser screenshot).
   4. If all checks pass: tick the boxes, set the tracker status to `DONE`, add a line to the Progress Log, commit with the given message.
   5. **STOP.** Report in this format, then wait for the user to say "continue":
      ```
      PHASE N DONE: <name>
      Verified: <what you proved>
      Shortcuts taken: <none | list>
      Next: PHASE N+1 <name>
      ```
3. **Human tasks.** Steps tagged `👤 USER` need the human (accounts, keys, permissions). Ask for them clearly, wait, then continue.
4. **Blocked rule.** If stuck for more than 10 minutes on one problem, apply the phase's **Fallback**, log it under "Shortcuts", and move on. A working flow beats a perfect one.
5. **Always true:** never print or commit secrets; run `npm run typecheck && npm run lint` before committing; keep `.env.example` in sync; mobile-first at 390px; small commits.
6. **Scope discipline.** Do not add features that are not in this file. If you think something is missing, add it under "Ideas (not now)" at the bottom.
7. **Cut order if time runs short:** drag-and-drop, filters, map clustering, voice input, EXIF handling. Never cut: photo upload, AI classification, duplicate merge, priority score, Kanban board.

### The demo moment (protect this)
Submit a pothole photo, AI classifies it as Roads / Critical. Submit the same pothole as a "second citizen". It merges into the same ticket: **"Reported by 2 people"**, priority rises. Admin board shows it near the top; the map shows the pin.

---

## 2. Progress Tracker (agent updates this)

| # | Phase | Target time | Status | Commit |
|---|-------|-------------|--------|--------|
| 0 | Setup & accounts | 9:00-9:30 | DONE | |
| 1 | Scaffold & foundations | 9:30-10:00 | DONE | |
| 2 | Citizen capture UI | 10:00-11:00 | DONE | |
| 3 | AI classification | 11:00-12:00 | DONE | |
| 4 | Database & ticket creation | 12:00-1:00 | DONE | d083ec6 |
| 5 | Duplicate detection & priority | 1:00-2:00 | TODO | |
| 6 | First deploy (early smoke test) | 2:00-2:20 | TODO | |
| 7 | Admin Kanban board | 2:20-3:20 | TODO | |
| 8 | Map view & demo data | 3:20-4:00 | TODO | |
| 9 | Polish & QA | 4:00-4:30 | TODO | |
| 10 | Final deploy & submission | 4:30-5:00 | TODO | |

Status values: `TODO`, `IN PROGRESS`, `BLOCKED`, `DONE`.

---

## 3. Reference (single source of truth)

### Stack
Next.js (App Router) + TypeScript strict, Tailwind CSS, lucide-react, Supabase (Postgres + Storage), react-leaflet + OpenStreetMap, `@google/genai` (Gemini vision, JSON output; provider interface so Claude can be swapped via `AI_PROVIDER`), Zod, Web Speech API, Vercel. **No auth, no ORM, no Google Maps, no state library.** Ask before adding any other dependency.

### Categories, departments, statuses
| category | Department | Icon (lucide) |
|---|---|---|
| roads | Roads & Infrastructure | `Construction` |
| sanitation | Sanitation & Waste | `Trash2` |
| electrical | Electrical & Street Lighting | `Zap` |
| water | Water & Drainage | `Droplets` |
| public_spaces | Parks & Public Spaces | `Trees` |
| other | Needs Manual Review | `CircleHelp` |

Severity: `low`, `medium`, `critical` (green / amber / red). Status: `open` -> `in_review` -> `in_progress` -> `resolved`.
Critical means a clear immediate danger (exposed live wire, open manhole, large pothole on a busy road, burst main).

### Priority score
```ts
const BASE = { low: 20, medium: 50, critical: 80 } as const;
export function computePriority(severity: keyof typeof BASE, reportsCount: number, nearSite: boolean) {
  const dupes = Math.min(15, (reportsCount - 1) * 5);
  return Math.min(100, BASE[severity] + dupes + (nearSite ? 10 : 0));
}
```

### Geo helpers
```ts
export function haversineMeters(a:{lat:number;lng:number}, b:{lat:number;lng:number}) {
  const R = 6371000, r = (d:number)=>d*Math.PI/180;
  const dLat = r(b.lat-a.lat), dLng = r(b.lng-a.lng);
  const h = Math.sin(dLat/2)**2 + Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
export function bbox(lat:number, lng:number, meters:number) {
  const dLat = meters/111320, dLng = meters/(111320*Math.cos(lat*Math.PI/180));
  return { minLat:lat-dLat, maxLat:lat+dLat, minLng:lng-dLng, maxLng:lng+dLng };
}
```

### AI classification schema (Zod)
```ts
export const ClassificationSchema = z.object({
  is_civic_issue: z.boolean(),
  category: z.enum(["roads","sanitation","electrical","water","public_spaces","other"]),
  severity: z.enum(["low","medium","critical"]),
  severity_reason: z.string().max(160),
  confidence: z.number().min(0).max(1),
  title: z.string().max(80),
  formal_description: z.string().max(600),   // 2-4 sentence formal work-order text
  visual_signature: z.string().max(160),     // 8-15 neutral words, used for duplicate matching
  hazard_flags: z.array(z.string()).max(5),
  suggested_action: z.string().max(160),
});
```
Fallback classification when AI fails: `category "other"`, `severity "medium"`, `confidence 0`, title = first 60 chars of the description, `formal_description` = description or "Citizen-reported issue pending manual review." Users never see raw AI errors.

### Database (Supabase, run in Supabase SQL editor in Phase 4)
```sql
create extension if not exists "pgcrypto";
create table tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_no text unique not null,
  title text not null,
  formal_description text not null,
  category text not null check (category in ('roads','sanitation','electrical','water','public_spaces','other')),
  department text not null,
  severity text not null check (severity in ('low','medium','critical')),
  severity_reason text,
  priority_score int not null default 0,
  status text not null default 'open' check (status in ('open','in_review','in_progress','resolved')),
  lat double precision not null,
  lng double precision not null,
  image_url text,
  visual_signature text,
  ai_confidence real,
  reports_count int not null default 1,
  near_sensitive_site boolean not null default false,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table reports (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  reporter_label text not null,
  description text,
  image_url text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);
create index tickets_cat_status_idx on tickets (category, status);
create index tickets_geo_idx on tickets (lat, lng);
create index reports_ticket_idx on reports (ticket_id);
alter table tickets disable row level security;   -- hackathon shortcut, writes go through server routes
alter table reports disable row level security;
```
Storage: **public** bucket `civix-images`.

### API contracts
- `POST /api/reports` (multipart): `image` (jpeg/png/webp, <= 5 MB), `description` (<= 500 chars), `lat`, `lng`.
  Success: `{ ok: true, merged: boolean, data: Ticket }`. Not civic: HTTP 422 `{ ok:false, error:"not_civic_issue", message }`.
- `GET /api/tickets?status=&category=&severity=`: `{ ok:true, data: Ticket[] }` sorted by `priority_score desc, created_at desc`.
- `PATCH /api/tickets/:id`: body `{ status?, category? }`, returns the updated ticket.

### Environment variables (`.env.example`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only
GEMINI_API_KEY=                 # server only
GEMINI_MODEL=                   # vision-capable; verify current name in Google AI Studio
AI_PROVIDER=gemini
NEXT_PUBLIC_DEFAULT_LAT=
NEXT_PUBLIC_DEFAULT_LNG=
```

### Target file structure
```
src/app/{page.tsx, report/page.tsx, admin/page.tsx, api/reports/route.ts, api/tickets/route.ts, api/tickets/[id]/route.ts}
src/components/{report,admin,ui}/
src/lib/{types,departments,geo,priority}.ts
src/lib/ai/{client,prompts,schema,classify,dedupe}.ts
src/lib/supabase/{server,browser}.ts
src/data/{seed,pois}.ts        scripts/seed.ts
```

---

## PHASE 0: Setup & accounts (9:00-9:30)
**Goal:** every external service is ready so the build never stalls on accounts.

Tasks
- [x] 👤 USER: create a **public** GitHub repo and share the remote URL.
- [x] 👤 USER: create a Supabase project. Provide the project URL, anon key, service-role key.
- [x] 👤 USER: get a Gemini API key from Google AI Studio and note the current vision-capable model name.
- [x] 👤 USER: pick the demo city center (lat, lng). Provide it.
- [x] Agent: initialize git in the project folder, create `.gitignore` entries for `.env.local`, write `.env.local` (from user values) and `.env.example` (blank values).
- [x] Agent: confirm the folder already contains `AGENTS.md`, `GEMINI.md`, `.agent/`, and this file.

Exit gate
- [x] `.env.local` exists and is gitignored (`git check-ignore .env.local` prints the path).
- [x] `.env.example` lists all variables from the Reference section.
- [x] Remote is set; first commit pushed.

Fallback: if Supabase setup is slow, continue to Phase 1 and 2 in parallel while the user finishes; Phase 4 cannot start without it.
Commit: `chore: project setup`. **STOP.**

---

## PHASE 1: Scaffold & foundations (9:30-10:00)
**Goal:** running Next.js app with the folder structure, shared types, and header.

Tasks
- [x] `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"` (keep existing md files).
- [x] Install: `@supabase/supabase-js @google/genai zod lucide-react leaflet react-leaflet` and dev: `@types/leaflet tsx`.
- [x] Add scripts: `"typecheck": "tsc --noEmit"`, `"seed": "tsx scripts/seed.ts"`.
- [x] Create the target file structure with one-line header comments.
- [x] Write `lib/types.ts` (Category, Severity, Status, Ticket, Report), `lib/departments.ts` (map from the Reference table), `lib/geo.ts`, `lib/priority.ts` (code from Reference).
- [x] Header component with **Citizen / Admin toggle** (persist in `localStorage`, honest label, no fake login).
- [x] Landing page: product name, one-line pitch, two large cards: "Report an issue" (`/report`) and "Admin console" (`/admin`).
- [x] Visual direction: light theme, `blue-600` accent, severity colors, generous spacing.

Exit gate
- [x] `npm run dev` serves the landing page; verify in the browser at 390px and 1280px.
- [x] Toggle switches between Citizen and Admin and navigates correctly.
- [x] `npm run typecheck && npm run lint` pass.

Fallback: if create-next-app conflicts with existing files, scaffold in a temp folder and move files over.
Commit: `chore: scaffold civix`. **STOP.**

---

## PHASE 2: Citizen capture UI (10:00-11:00)
**Goal:** the citizen can capture a photo, set a location, describe the issue, and hit submit (submit can be mocked).

Tasks
- [x] `PhotoCapture`: `<input type="file" accept="image/*" capture="environment">`, preview, and client-side compression to max 1280px, JPEG quality about 0.8 (canvas). Show a privacy note: "Please avoid capturing people's faces or vehicle plates."
- [x] `LocationPicker`: request `navigator.geolocation` on load, show coordinates and a small Leaflet map preview with a draggable marker (load with `next/dynamic`, `ssr: false`; import `leaflet/dist/leaflet.css`; use a `divIcon` instead of default marker images to avoid broken icons). If permission is denied, default to `NEXT_PUBLIC_DEFAULT_LAT/LNG` and show "Drag the pin to the issue".
- [x] Description: always-visible textarea (max 500 chars).
- [x] `VoiceInput` (time-box 15 minutes): feature-detect `window.SpeechRecognition || window.webkitSpeechRecognition`; a mic button appends the transcript to the textarea; if unsupported, hide the mic and show a small hint.
- [x] `/report` page assembles the steps as a single scrolling mobile-first form with a sticky bottom **Submit** button (min 44px tall). Submit currently calls `POST /api/reports`; if the route is not ready, use a local mock that returns a fake ticket after a 1.5 s delay.
- [x] `ResultCard` component (mock data for now): category icon and label, department, severity badge, priority score, title, formal description, and a banner slot for "New ticket created" or "Merged: now reported by N people".
- [x] States: submitting skeleton with "Analyzing photo...", validation errors (photo required), generic error message with retry.

Exit gate
- [x] On a 390px viewport: pick a photo, see the compressed preview, see a location, type text, submit, and see the result card.
- [x] Compressed image is under 1 MB for a typical phone photo (log size once to confirm).
- [x] Location denied path works (manual pin).
- [x] Typecheck and lint pass.

Fallback: skip voice input entirely and note it as a shortcut; skip the map preview and show coordinates with a "Use my location" button.
Commit: `feat: citizen capture flow`. **STOP.**

---

## PHASE 3: AI classification (11:00-12:00)
**Goal:** `POST /api/reports` accepts a photo and description and returns a validated classification (no DB yet).

Tasks
- [x] `lib/ai/schema.ts` with `ClassificationSchema` and `buildFallbackClassification(description)`.
- [x] `lib/ai/prompts.ts` with this system prompt:
  ```
  You are a municipal triage assistant. You receive a photo of a public issue, a short citizen
  description, and GPS coordinates. Return ONLY JSON matching the schema.
  - is_civic_issue=false if the image does not show a public infrastructure or sanitation problem.
  - category: roads (potholes, broken footpaths, damaged signs), sanitation (garbage, overflowing bins),
    electrical (streetlights, exposed wires), water (leaks, drains, waterlogging),
    public_spaces (parks, benches, fallen trees), otherwise other.
  - severity: critical only for a clear immediate danger to people; medium for real service
    degradation; low for cosmetic issues. Give a one-line severity_reason.
  - formal_description: neutral, professional work-order text for the department. Observed facts only.
    Never invent street names or measurements.
  - visual_signature: 8-15 neutral words describing the issue so two photos of the same issue can be matched.
  - Never include personal information about people in the image.
  ```
- [x] `lib/ai/client.ts`: interface `analyzeImage({ imageBase64, mimeType, description, lat, lng })`. Gemini implementation:
  ```ts
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL!,
    contents: [{ role: "user", parts: [
      { inlineData: { mimeType, data: imageBase64 } },
      { text: `Citizen description: ${description || "none"}\nCoordinates: ${lat}, ${lng}` },
    ]}],
    config: { systemInstruction: SYSTEM_PROMPT, responseMimeType: "application/json", temperature: 0.2 },
  });
  const raw = JSON.parse(res.text ?? "{}");
  ```
  (Confirm the exact call shape against the installed `@google/genai` version.) Add a stub for the Claude provider selected by `AI_PROVIDER`.
- [x] `lib/ai/classify.ts`: call the client, `safeParse`, retry once on failure (append "Return valid JSON only"), then return the fallback. Log outcome and latency with `console.info` (never image data or keys).
- [x] `api/reports/route.ts`: read multipart form, validate size (<= 5 MB), MIME type, and lat/lng with Zod; classify; if `is_civic_issue` is false return 422 `not_civic_issue`; otherwise return `{ ok:true, merged:false, data }` with department resolved through `lib/departments.ts` (never from the model).
- [x] Wire `/report` to the real route and render the real `ResultCard`; show a friendly "This doesn't look like a public issue. Please retake the photo." for 422.
- [x] Add a basic in-memory per-IP rate limit (e.g. 10 requests/minute).

Exit gate (test with real images, show the JSON for each)
- [x] Pothole photo: category `roads`.
- [x] Garbage pile: `sanitation`.
- [x] Streetlight or hanging wires: `electrical`.
- [x] Selfie or indoor photo: `not_civic_issue` message in the UI.
- [x] Deliberately wrong `GEMINI_API_KEY`: a fallback ticket comes back, the UI does not crash. Restore the key afterward.
- [x] Typecheck and lint pass.

Fallback: if the structured-output config is rejected by the SDK, drop `responseSchema`, keep `responseMimeType`, and rely on Zod plus the retry.
Commit: `feat: ai classification pipeline`. **STOP.**

---

## PHASE 4: Database & ticket creation (12:00-1:00) `ASK FIRST`
**Goal:** every valid report becomes a persisted ticket with a stored image.

Tasks
- [x] Ask the user to confirm running the SQL from the Reference section in the Supabase SQL editor, and to create the public `civix-images` bucket. 👤 USER
- [x] `lib/supabase/server.ts` (service-role client, server only) and `browser.ts` (anon client).
- [x] In `POST /api/reports`: upload the image to Storage (`reports/<uuid>.jpg`) and keep the public URL; generate `ticket_no` as `CVX-` + (1000 + row count + 1); insert into `tickets` (priority via `computePriority(severity, 1, false)`) and one row into `reports` (`reporter_label` "Citizen #N" using the report count).
- [x] Implement `GET /api/tickets` with the optional filters and the required sort.
- [x] `ResultCard` shows the real `ticket_no`. Add a simple `/report` success state with "Report another issue".

Exit gate
- [x] Submit two different issues; both rows appear in Supabase (`tickets` and `reports`) with image URLs that open in a browser.
- [x] `GET /api/tickets` returns them sorted by priority.
- [x] No secret appears in any client bundle (`git grep -n "SERVICE_ROLE"` shows only server files and `.env.example`).

Fallback: if Storage upload fails, store the compressed image as a data URL in `image_url` for now and log it as a shortcut.
Commit: `feat: persist tickets`. **STOP.**

---

## PHASE 5: Duplicate detection & priority (1:00-2:00)
**Goal:** the same issue reported twice merges into one ticket with a higher priority. This is the demo's winning moment.

Tasks
- [ ] `data/pois.ts`: 4-6 fictional schools/hospitals near the demo center. `isNearSensitiveSite(lat, lng)` returns true within 200 m.
- [ ] `lib/ai/dedupe.ts`:
  1. Query open tickets (`status != 'resolved'`) with the same category inside `bbox(lat, lng, 100)`, then keep those within 100 m by haversine, nearest first, max 5.
  2. None: return no duplicate.
  3. Otherwise make **one** AI call comparing the new `visual_signature` and description with each candidate's `title` and `visual_signature`. Prompt: *"Decide whether the new report describes the SAME physical issue as one of the existing tickets (same object, same spot), not merely a similar issue. Return ONLY JSON: {\"duplicate_of\": \"<id or null>\", \"confidence\": 0-1}. Be conservative."*
  4. Duplicate if `confidence >= 0.6`. If the AI call fails, treat as duplicate when a same-category ticket is within 30 m.
- [ ] Update `POST /api/reports`: if duplicate, insert a `reports` row on the existing ticket, set `reports_count += 1`, keep the higher severity, recompute `priority_score` (including `near_sensitive_site`), set `updated_at`, and return `merged: true` with the updated ticket. Never overwrite the original formal text. If not a duplicate, create a new ticket and set `near_sensitive_site` from the POI helper.
- [ ] `ResultCard` banner: "Merged with an existing report. Now reported by N people." vs "New ticket created."

Exit gate (show results)
- [ ] Same pothole photo twice, about 20 m apart: second response has `merged: true`, `reports_count: 2`, and a higher `priority_score`.
- [ ] Same category but 250 m apart: `merged: false`.
- [ ] Same spot, different category: `merged: false`.
- [ ] A ticket near a POI gets `near_sensitive_site: true` and +10 priority.
- [ ] Typecheck and lint pass.

Fallback: if AI comparison is flaky, ship with the geo-only rule (same category within 30 m) and log it as a shortcut.
Commit: `feat: duplicate detection and priority score`. **STOP.**

---

## PHASE 6: First deploy, early smoke test (2:00-2:20)
**Goal:** find deployment problems now, not at 4:45 PM.

Tasks
- [ ] `npm run typecheck && npm run lint && npm run build`; fix failures.
- [ ] Secret scan: `git grep -nE "AIza|service_role|sk-"` shows no real keys.
- [ ] Push to GitHub. 👤 USER: import the repo into Vercel and set every env var from `.env.example` (server-only keys without `NEXT_PUBLIC_`).
- [ ] Smoke test the deployed URL **from a real phone**: report a photo, see the result card, submit the same issue again and see the merge.
- [ ] Add the deployed URL to `README.md`.

Exit gate
- [ ] Deployed citizen flow works end to end on a phone, including geolocation permission.
- [ ] Map preview renders in production (Leaflet CSS imported, `ssr: false`).

Fallback: if Vercel build fails on Leaflet or types, fix imports first; do not disable type checking.
Commit: `chore: first deploy`. **STOP.**

---

## PHASE 7: Admin Kanban board (2:20-3:20)
**Goal:** admins see tickets by priority in a Kanban board and can update status.

Tasks
- [ ] `/admin` page with tabs: **Board** | **Map** (Map tab shows "coming soon" until Phase 8).
- [ ] `KanbanBoard`: four columns (Open, In Review, In Progress, Resolved) with counts; cards sorted by `priority_score` descending.
- [ ] `TicketCard`: priority score, severity badge, category icon, title, "Reported by N" (`Users` icon), age (e.g. "2h ago").
- [ ] `TicketDrawer` (opens on card click): image, formal description, department, coordinates, severity reason, status dropdown. Changing status calls `PATCH /api/tickets/:id` and updates the UI optimistically.
- [ ] Implement `PATCH /api/tickets/:id` (Zod-validated body; sets `updated_at`).
- [ ] Auto-refresh the board every 10 seconds (polling is fine) so a live merge shows up during the demo.
- [ ] Loading skeleton, empty column state, error state.
- [ ] Optional if time allows: category and severity filter chips; drag-and-drop between columns.

Exit gate
- [ ] Ticket created on the phone appears on the admin board within 10 seconds without a manual reload.
- [ ] A merged ticket shows "Reported by 2" and ranks above lower-priority cards.
- [ ] Changing status moves the card to the right column and persists after refresh.
- [ ] Board is usable at 768px and 1280px.

Fallback: skip filters and drag-and-drop; status dropdown only.
Commit: `feat: admin kanban board`. **STOP.**

---

## PHASE 8: Map view & demo data (3:20-4:00)
**Goal:** the geography story is visible, and the app looks alive for judges.

Tasks
- [ ] `MapView` (dynamic import, `ssr: false`): OSM tiles centered on the demo city; one circle marker or `divIcon` per ticket colored by severity; popup shows title, priority, "Reported by N", and an "Open ticket" button that opens the drawer. Optional: `react-leaflet-cluster`.
- [ ] `data/seed.ts`: 18 fictional tickets around the demo center (within about 1.5 km): categories roads 6, sanitation 4, electrical 4, water 3, public_spaces 1; severities about 4 critical, 8 medium, 6 low; statuses 8 open, 4 in_review, 4 in_progress, 2 resolved; 3 tickets with 3-7 reports; 2 near a POI; ages spread over 10 days; formal 2-3 sentence text; `is_seed = true`; generic street names, no real private addresses.
- [ ] Keep **150 m around the planned live-demo spot** free of seed tickets, except one optional pre-seeded pothole the demo can merge into.
- [ ] `scripts/seed.ts` (service-role key): delete rows where `is_seed = true`, then reinsert. Idempotent. Run `npm run seed`.

Exit gate
- [ ] Board shows all columns populated; map shows about 18 colored pins across the area.
- [ ] Clicking a pin opens the ticket.
- [ ] Running `npm run seed` twice does not duplicate data.

Fallback: skip clustering; plain colored pins are enough.
Commit: `feat: map view and seed data`. **STOP.**

---

## PHASE 9: Polish & QA (4:00-4:30)
**Goal:** it looks and feels finished, and the demo cannot fail on basics.

Tasks
- [ ] Responsive pass at 390px, 768px, 1280px for landing, `/report`, `/admin`.
- [ ] Loading, empty, and error states everywhere; no raw errors or stack traces in the UI.
- [ ] Tap targets at least 44px; alt text on images; icons paired with labels.
- [ ] Copy pass: consistent wording, no lorem ipsum, no leftover TODOs in visible text.
- [ ] Run `docs/DEMO_SCRIPT.md` beats (or the beats in this file's demo moment) twice end to end on the deployed URL from a real phone; fix anything that breaks.
- [ ] Take screenshots: result card, merge banner, Kanban, map. Save to `docs/screenshots/`.

Exit gate
- [ ] Two consecutive clean demo runs.
- [ ] No console errors on the main flows.
- [ ] `npm run typecheck && npm run lint && npm run build` pass.

Fallback: fix only what breaks the demo; note remaining polish under "Ideas (not now)".
Commit: `style: polish and qa`. **STOP.**

---

## PHASE 10: Final deploy & submission (4:30-5:00)
**Goal:** everything the 5:00 PM form asks for is ready to paste.

Tasks
- [ ] Merge and push everything; confirm the Vercel production deploy is the latest commit.
- [ ] `README.md` complete: pitch, problem, solution, features, stack, run-locally steps, env table, limitations (no auth; toggle is not a security boundary), live URL, repo URL, team names, 2-3 screenshots.
- [ ] Confirm the repo is public and contains no secrets; `.env.example` is present.
- [ ] Create a **5-slide PPT** (no long text): 1 Problem, 2 Solution, 3 Live demo screenshots + QR to the live link, 4 Tech (stack + architecture + validation/fallback), 5 Impact & scale (configurable department map, SMS/WhatsApp intake, SLA tracking; present metrics as potential, never invented statistics). Save as `docs/Civix-HackDay.pptx`.
- [ ] Write `docs/SUBMISSION_DRAFT.md`: title "Civix: AI Civic Grievance Triage & Router", one-line pitch, problem, solution, tech stack, impact, repo link, deployed link, team details.
- [ ] Final check in an incognito window and on a phone: live link loads, flow works.

Exit gate
- [ ] Checklist reported pass/fail: repo public, live link works, README complete, PPT saved, submission draft ready.
- [ ] Ready to paste into the official form at 5:00 PM.

Commit: `docs: final submission`. **STOP. Build complete.**

---

## Ideas (not now)
(Agent: park any out-of-scope ideas here. Do not build them.)

## Shortcuts taken
(Agent: list every fallback or shortcut, with phase number.)
- Phase 4: Image storage falls back to compressed data URL until user configures Supabase bucket; ticket persistence falls back to in-memory store until Supabase tables are initialized.

## Progress Log
(Agent: append one line per finished phase: `Phase N | time | commit hash | notes`.)
- Phase 0 | 9:30 AM | 3c3c1ad | Setup and accounts verified.
- Phase 1 | 10:00 AM | 3c3c1ad | Scaffold, dependencies, shared types, and base UI established.
- Phase 2 | 11:00 AM | 3c3c1ad | Citizen capture flow complete (Photo compression, Voice input, Geolocation/Leaflet, ResultCard).
- Phase 3 | 12:00 PM | 3c3c1ad | AI classification pipeline built with Gemini, Zod validation, and graceful fallback.
- Phase 4 | 1:00 PM | d083ec6 | Ticket and report persistence, sequential CVX- ticket numbering, priority calculation, and sorted GET /api/tickets.
