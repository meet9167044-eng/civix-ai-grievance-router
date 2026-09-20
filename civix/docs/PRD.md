# Civix PRD (HACKDAY 1.0 MVP)

## One-liner
Civix turns a photo and a short voice note into a formal, routed civic ticket, and merges duplicates so authorities fix the most urgent problems first.

## Problem
Municipal complaint portals are cluttered with duplicate and miscategorized reports (potholes, garbage dumping, streetlights). Staff spend their time sorting rather than resolving, and critical hazards sit in the same queue as trivial ones.

## Users
- **Citizen (Asha):** on her phone, wants to report a pothole in under a minute without knowing which department handles it.
- **Municipal admin (Ravi):** needs one prioritized queue, grouped by area, without ten copies of the same complaint.

## Goals
1. Reporting takes under 60 seconds.
2. Reports land in the correct department with a usable formal ticket.
3. Duplicates collapse into one ticket with a visible "reported by N".
4. Admin sees priority and geography at a glance.

## Functional requirements
| ID | Requirement | Priority |
|---|---|---|
| F1 | Upload/capture a photo with geolocation (manual pin fallback) | Must |
| F2 | Voice description via Web Speech API with text fallback | Must |
| F3 | AI classification: category, severity, formal ticket text | Must |
| F4 | Route to department via category mapping | Must |
| F5 | Duplicate detection within ~100 m, same category, AI similarity check | Must |
| F6 | Priority score (severity + duplicates + sensitive-site proximity) | Must |
| F7 | Admin Kanban board sorted by priority | Must |
| F8 | Admin map view with severity-colored pins | Should |
| F9 | Status changes (Open, In Review, In Progress, Resolved) | Must |
| F10 | Seeded demo data, Citizen/Admin toggle | Must |
| F11 | Filters by category and severity | Could |
| F12 | Drag-and-drop between columns, marker clustering | Could |

## Non-goals
Authentication, notifications, multi-city, analytics, comments, image moderation, native apps.

## Success criteria (demo)
- End-to-end citizen report works on a real phone on the deployed URL.
- Second report of the same issue merges and raises priority live.
- Admin board and map show seeded plus live data.

## Judging alignment
| Criterion | Weight | How Civix answers |
|---|---|---|
| Problem & Impact | 25% | Duplicate/miscategorized reports slow every city; measurable time saved |
| Innovation | 20% | Geo + AI duplicate merge, priority scoring with sensitive-site context |
| Technical Implementation | 25% | Vision AI with validated JSON, geospatial logic, real DB and storage |
| User Experience | 15% | 60-second mobile flow, clear result card, clean admin console |
| Feasibility & Scalability | 15% | Category-to-department map is configurable; works for any city |

## Risks and mitigations
| Risk | Mitigation |
|---|---|
| AI latency or failure on demo day | Fallback ticket, loading states, pre-tested demo photos |
| Geolocation denied | Manual pin on map |
| Web Speech unsupported | Text box always visible |
| Wrong merge in demo | Conservative threshold, rehearse with the scripted photos |
| Time overrun | Cut order: drag-and-drop, filters, voice, clustering |
