---
name: classify-grievance
description: Classify a civic issue from a photo and short description into category, department, severity, and a formal public-works ticket. Use when writing or editing the AI classification code, prompts, or schema in Civix.
---

# Skill: classify-grievance

## When to use
Any time you touch `src/lib/ai/prompts.ts`, `schema.ts`, `classify.ts`, or `client.ts`.

## Output contract (Zod schema, all fields required)
```ts
export const ClassificationSchema = z.object({
  is_civic_issue: z.boolean(),
  category: z.enum(["roads","sanitation","electrical","water","public_spaces","other"]),
  severity: z.enum(["low","medium","critical"]),
  severity_reason: z.string().max(160),
  confidence: z.number().min(0).max(1),
  title: z.string().max(80),                 // e.g. "Large pothole on main carriageway"
  formal_description: z.string().max(600),   // 2-4 sentence formal ticket text
  visual_signature: z.string().max(160),     // short neutral description used for duplicate matching
  hazard_flags: z.array(z.string()).max(5),  // e.g. ["traffic_hazard","exposed_wiring"]
  suggested_action: z.string().max(160),
});
```

## System prompt (starting point, keep in `prompts.ts`)
```
You are a municipal triage assistant. You receive a photo of a public issue,
a short citizen description, and GPS coordinates. Return ONLY JSON matching
the schema. Rules:
- Set is_civic_issue=false if the image does not show a public infrastructure or
  sanitation problem.
- category: roads (potholes, broken footpaths, damaged signs), sanitation (garbage,
  overflowing bins), electrical (streetlights, exposed wires), water (leaks, drains,
  waterlogging), public_spaces (parks, benches, fallen trees), else other.
- severity: critical only if there is a clear immediate danger to people (exposed live
  wire, open manhole, large deep pothole on a busy road, burst main). medium for real
  service degradation. low for cosmetic issues. Give a one-line severity_reason.
- Write formal_description in a neutral, professional tone as a work order for the
  department. Mention observed facts only. Do not invent street names or measurements.
- visual_signature: 8-15 neutral words describing the issue so two photos of the same
  issue can be matched (object, size, surroundings).
- Never include personal information about people visible in the image.
```

## User prompt builder
Include: citizen description (or "none provided"), `lat, lng`, and the image as inline data. Keep it short.

## Implementation notes
- Gemini: use `responseMimeType: "application/json"` and `responseSchema` if supported by the SDK version. Temperature 0.2.
- Parse with `ClassificationSchema.safeParse`. On failure, retry once with an added instruction "Return valid JSON only". On second failure, return `buildFallbackClassification(description)`.
- Fallback: `category "other"`, `severity "medium"`, `confidence 0`, title from first 60 chars of description, `formal_description` = description or "Citizen-reported issue pending manual review."
- Map `category` to department only through `src/lib/departments.ts`. Never let the model name a department.

## Test cases (must pass before moving on)
| Input | Expect |
|---|---|
| Deep pothole photo | roads, medium or critical |
| Pile of garbage on a corner | sanitation |
| Dark streetlight or hanging wires | electrical, critical if wires exposed |
| Selfie or indoor photo | `is_civic_issue: false` |
| Bad API key | fallback ticket, no crash |
