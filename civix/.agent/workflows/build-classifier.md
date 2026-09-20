---
description: Build the AI classification pipeline (image + text to validated ticket JSON) with fallback
---

# /build-classifier

Use the `classify-grievance` skill. Deliverable: `POST /api/reports` can accept a photo and description and return a validated classification.

1. Create `src/lib/ai/schema.ts` with the Zod `ClassificationSchema` (see skill for fields).
2. Create `src/lib/ai/prompts.ts` with the system prompt and user prompt builder.
3. Create `src/lib/ai/client.ts`: a provider interface `analyzeImage({ imageBase64, mimeType, description, lat, lng })`, a Gemini implementation using JSON output, and a stub Claude implementation selected by `AI_PROVIDER`.
4. Create `src/lib/ai/classify.ts`: calls the client, Zod-parses, retries once on failure, and returns the fallback ticket if both attempts fail.
5. Create `src/app/api/reports/route.ts` (multipart form: `image`, `description`, `lat`, `lng`). Validate size (5 MB) and MIME type. For now, return the classification without saving.
6. Write a quick script or curl example in `docs/TASKS.md` to test with 3 sample images (pothole, garbage, streetlight) and one non-civic image.
7. Verify: correct category on all three, `is_civic_issue: false` on the non-civic image, and a graceful fallback when `GEMINI_API_KEY` is intentionally wrong.
8. Run typecheck and lint, then commit: `feat: ai classification pipeline`.
