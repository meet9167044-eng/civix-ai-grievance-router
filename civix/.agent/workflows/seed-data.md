---
description: Generate 15-20 realistic fictional tickets so the admin board and map look alive for the demo
---

# /seed-data

1. Read `docs/ARCHITECTURE.md` for the tickets schema and `src/data/pois.ts` for demo POIs.
2. Pick one demo neighborhood (use `NEXT_PUBLIC_DEFAULT_LAT/LNG`). Generate coordinates within about 1.5 km.
3. Write `src/data/seed.ts` with 18 tickets:
   - Mix: roads 6, sanitation 4, electrical 4, water 3, public_spaces 1.
   - Severity mix: about 4 critical, 8 medium, 6 low.
   - Statuses: 8 open, 4 in_review, 4 in_progress, 2 resolved.
   - 3 tickets with `reports_count` between 3 and 7 to show clusters.
   - 2 tickets near a school or hospital POI.
   - Ages spread over the last 10 days.
   - Formal, realistic ticket text (2-3 sentences). No real private addresses; use generic street names.
   - Use royalty-free placeholder image URLs or leave `image_url` null and render a category icon.
4. **Leave one clean spot** for the live demo pothole: do not seed anything within 150 m of the demo location noted in `docs/DEMO_SCRIPT.md`, except one pre-seeded pothole ticket the demo will merge into (if the script says so).
5. Write `scripts/seed.ts`: clears existing seeded rows (flag `is_seed = true`) and reinserts. Uses the service-role key. Idempotent.
6. Run `npm run seed` and confirm the Kanban and map render. Commit: `chore: seed demo data`.
