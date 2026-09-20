---
name: duplicate-detection
description: Detect and merge duplicate civic reports using geospatial proximity plus AI similarity, and recompute priority. Use when writing or editing dedupe, priority, or merge logic in Civix.
---

# Skill: duplicate-detection

## Strategy (cheap first, AI second)
1. **Geo filter (no AI):** fetch open tickets with the same `category` inside a bounding box around the new point, then keep those within **100 m** using haversine.
2. **AI compare (one call):** send the new report's `visual_signature` and description, plus each candidate's `title` and `visual_signature` (max 5 candidates, nearest first). Optionally include the candidate image URLs only if using vision comparison; text-only is enough for the MVP.
3. **Decide:** model returns `{ duplicate_of: string | null, confidence: number }`. Duplicate if `confidence >= 0.6`.
4. **Fallback if the AI call fails:** duplicate if a same-category ticket is within **30 m**.

## Geo helpers (`src/lib/geo.ts`)
```ts
export function haversineMeters(a:{lat:number;lng:number}, b:{lat:number;lng:number}) {
  const R = 6371000, toRad = (d:number)=>d*Math.PI/180;
  const dLat = toRad(b.lat-a.lat), dLng = toRad(b.lng-a.lng);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
// ~0.0009 degrees latitude is about 100 m
export function bbox(lat:number,lng:number,meters:number){
  const dLat = meters/111320, dLng = meters/(111320*Math.cos(lat*Math.PI/180));
  return { minLat:lat-dLat, maxLat:lat+dLat, minLng:lng-dLng, maxLng:lng+dLng };
}
```

## Compare prompt (starting point)
```
A citizen submitted a new report. Decide whether it describes the SAME physical issue
as one of the existing tickets (same object at the same spot), not merely a similar issue.
Return ONLY JSON: {"duplicate_of": "<ticket id or null>", "confidence": 0-1}.
Be conservative: if unsure, return null.
```

## Merge behavior
- Insert a row in `reports` linked to the existing `ticket_id` (with its own image, description, coordinates).
- `tickets.reports_count += 1`, `updated_at = now()`.
- Keep the **higher** severity of the existing ticket and the new classification.
- Recompute `priority_score` via `computePriority`.
- API returns `{ ticket, merged: true }` and the UI shows "Now reported by N people."
- Do NOT overwrite the original ticket's formal text.

## Priority formula (`src/lib/priority.ts`)
```
base   = { low: 20, medium: 50, critical: 80 }[severity]
dupes  = min(15, (reportsCount - 1) * 5)
site   = nearSensitiveSite ? 10 : 0        // school/hospital within 200 m
score  = min(100, base + dupes + site)
```

## Tests (write as a quick script or vitest if time allows)
- Two points 20 m apart, same category: merged.
- Two points 250 m apart: not merged.
- Same location, different categories: not merged.
- Score for critical + 3 reports + near school = 80 + 10 + 10 = 100.
