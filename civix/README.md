# Civix 🏙️
**AI civic grievance triage & router.** Snap a photo, describe the problem, and Civix produces a formal ticket, routes it to the right department, and merges duplicates so authorities see what matters first.

Built for **HACKDAY 1.0** by Team DECODEP participants. Theme: *Tech for a Better Tomorrow*.

## The problem
Municipal complaint portals are flooded with duplicate and miscategorized reports (potholes, garbage dumping, broken streetlights). Staff waste time sorting instead of fixing, and critical hazards wait in the same queue as trivial ones.

## The solution
1. **One-tap report:** geotagged photo + voice or text description.
2. **AI triage:** category, department, severity (Low / Medium / Critical), and a formal public-works ticket.
3. **Duplicate merge:** same category within ~100 m becomes one ticket with a "reported by N" count.
4. **Priority score:** severity + duplicate count + proximity to schools/hospitals.
5. **Admin console:** Kanban board and clustered map, sorted by priority.

## Live demo
- App: `<DEPLOYED_URL>` (Deploy to Vercel in Phase 6)
- Repo: `https://github.com/meet9167044-eng/civix-ai-grievance-router`

## Tech stack
Next.js, TypeScript, Tailwind CSS, Lucide, Supabase, Leaflet + OpenStreetMap, Gemini API, Web Speech API, Vercel.

## Run locally
```bash
git clone https://github.com/meet9167044-eng/civix-ai-grievance-router.git && cd civix-ai-grievance-router/civix
npm install
cp .env.example .env.local   # fill in keys
npm run dev
npm run seed                 # optional demo data
```

### Environment variables
| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, used by route handlers and seed |
| `GEMINI_API_KEY` | Server-only AI key |
| `GEMINI_MODEL` | Vision-capable Gemini model name |
| `AI_PROVIDER` | `gemini` (default) or `claude` |

## Notes and limitations
- Auth is intentionally omitted for the hackathon. The Citizen/Admin switch is a UI toggle, not a security boundary.
- Voice input uses the browser Web Speech API (best in Chrome/Edge). Text input is always available.
- Demo data is fictional.

## Impact and scalability
Works for any city with a department list and a map. Next steps: real authentication, department-specific SLAs, SMS/WhatsApp intake, citizen status tracking, and integration with existing municipal systems via API.

## Team
`<NAMES>`
