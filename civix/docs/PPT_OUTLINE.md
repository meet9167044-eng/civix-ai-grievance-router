# PPT Outline (5 slides, minimal text)

**Slide 1: Problem**
Title: "Complaint portals are drowning in duplicates."
- Same pothole reported dozens of times; wrong department; critical issues buried.
- One visual: cluttered queue vs. one clean ticket.

**Slide 2: Solution**
Title: "Civix: photo in, prioritized ticket out."
- Photo + voice + location; AI classification; duplicate merge; priority score; admin board and map.
- Simple 4-step flow diagram.

**Slide 3: Live demo**
- Screenshots: result card, "reported by 2 people" merge, Kanban, map. QR code to deployed link.

**Slide 4: Tech**
- Next.js, Tailwind, Supabase, Gemini vision with validated JSON, geospatial dedupe, Leaflet.
- Architecture diagram from `ARCHITECTURE.md`.
- Note reliability: schema validation and fallback ticket.

**Slide 5: Impact and scale**
- Less triage time, faster response for critical hazards, fewer duplicate work orders.
- Scale: configurable department map, SMS/WhatsApp intake, SLA tracking, municipal system integration.
- Team names, repo and live links.

Tip: use `<placeholder>` metrics honestly. Do not invent statistics; frame as "potential" unless you measured it.
