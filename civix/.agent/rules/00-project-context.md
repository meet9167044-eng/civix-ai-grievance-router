# Project Context (Always On)

**Product:** Civix, an AI civic grievance triage and router.
**Users:** Citizens (report issues from a phone) and municipal admins (triage on a dashboard).
**Goal:** Reduce duplicate and miscategorized complaints so critical issues get fixed faster.

## Scope: what is IN
- Geotagged photo upload with browser geolocation (manual pin fallback)
- Voice description via Web Speech API, plus a text fallback
- AI classification: category, department, severity, confidence, formal ticket text
- Duplicate detection (same category, within ~100 m, similar description)
- Priority score (severity + duplicate count + sensitive-site proximity)
- Admin: Kanban board (Open, In Review, In Progress, Resolved) and map view
- Seeded demo data, Citizen/Admin toggle

## Scope: what is OUT (do not build)
Authentication, user accounts, email/SMS notifications, payments, native apps, multi-city support, analytics dashboards, comment threads, image moderation pipelines.

## Categories and departments (single source of truth: `src/lib/departments.ts`)
| Category | Department | Examples |
|---|---|---|
| roads | Roads & Infrastructure | potholes, broken footpath, damaged signage |
| sanitation | Sanitation & Waste | garbage dumping, overflowing bins |
| electrical | Electrical & Street Lighting | dead streetlight, exposed wires |
| water | Water & Drainage | leaking pipe, blocked drain, waterlogging |
| public_spaces | Parks & Public Spaces | broken bench, fallen tree |
| other | Needs Manual Review | anything unclear or not civic |

## Severity definitions
- **critical:** immediate danger to life or safety (exposed live wire, large pothole on a fast road, open manhole, major water main burst).
- **medium:** significant nuisance or degraded service, no immediate danger.
- **low:** cosmetic or minor inconvenience.

## Ticket statuses
`open` -> `in_review` -> `in_progress` -> `resolved`
