# AI Behavior, Privacy and Safety (Always On)

## AI calls
- Only from server route handlers. Prompts live in `src/lib/ai/prompts.ts`; schemas in `src/lib/ai/schema.ts`.
- Request **JSON-only output** (response MIME type `application/json` with a response schema where the SDK supports it) and **validate with Zod**. On parse failure, retry once, then fall back.
- **Fallback ticket:** `category: "other"`, `severity: "medium"`, department "Needs Manual Review", the citizen's raw description as the ticket body. The user must never see a raw AI error.
- Temperature low (0.2) for classification.
- Log model latency and outcome (success / retry / fallback) with `console.info`, never image data or keys.

## Classification guardrails
- If the image does not show a civic issue, return `is_civic_issue: false` and let the UI ask the user to retake.
- Severity must be justified in a one-line `severity_reason`. Critical requires a stated safety hazard.
- Do not invent facts (street names, measurements) that are not visible or stated. Location comes from coordinates and the user's text.
- The model output is a **recommendation** for staff; admins can change category and status.

## Privacy
- Photos may contain faces or license plates. Add a one-line notice on the upload step: "Please avoid capturing people's faces or vehicle plates."
- Reporter identity is anonymous (`Citizen #<n>` label). Do not collect names, phones, or emails.
- Seed data must be fictional. No real addresses of private homes.

## Security
- Service-role key is server-only. Validate all request bodies with Zod. Limit image upload to 5 MB and `image/jpeg|png|webp`.
- Basic rate limit on `POST /api/reports` (in-memory per IP is enough for the MVP).
- Sanitize any text rendered from AI or users (React escapes by default; never use `dangerouslySetInnerHTML`).
