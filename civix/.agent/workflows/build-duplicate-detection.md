---
description: Implement geo + AI duplicate detection, merge logic, and priority scoring
---

# /build-duplicate-detection

Use the `duplicate-detection` skill. Deliverable: submitting the same issue twice merges into one ticket with a higher priority.

1. Create the Supabase tables per `docs/ARCHITECTURE.md` (run the SQL in the Supabase SQL editor) and the `civix-images` public storage bucket. Ask the user to confirm this step since it changes the database.
2. Implement `src/lib/supabase/server.ts` (service-role client) and `browser.ts` (anon client).
3. Implement `src/lib/geo.ts` `haversineMeters` and a bounding-box helper for pre-filtering.
4. Implement `src/lib/priority.ts`: `computePriority({ severity, reportsCount, nearSensitiveSite })` (formula in `docs/ARCHITECTURE.md`), plus `src/data/pois.ts` and a `isNearSensitiveSite(lat, lng)` helper (200 m radius).
5. Implement `src/lib/ai/dedupe.ts`:
   - Query open tickets (status not `resolved`) with the same category within 100 m.
   - If none: no duplicate.
   - If one or more: ask the model to compare the new report with the candidates (one call) and return `{ duplicateOf: id | null, confidence }`. Treat confidence at or above 0.6 as a duplicate. If the AI call fails, fall back to "duplicate if within 30 m and same category".
6. Update `POST /api/reports`: upload image to Storage, classify, dedupe, then either insert a new ticket + report or insert a report on the existing ticket, increment `reports_count`, and recompute `priority_score`. Return `{ ticket, merged: boolean }`.
7. Verify by submitting the same pothole photo twice from points about 20 m apart. Expect `merged: true`, `reports_count: 2`, and a higher priority score.
8. Run typecheck and lint, then commit: `feat: duplicate detection and priority score`.
