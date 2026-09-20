# Civix: HACKDAY 1.0 Submission Draft

**Project Title:** Civix: AI Civic Grievance Triage & Router  
**Theme:** Tech for a Better Tomorrow  
**Live Deployed Application:** https://civix-ai-grievance-router-gdw9.vercel.app/  
**Source Code Repository:** https://github.com/meet9167044-eng/civix-ai-grievance-router  

---

### One-Line Pitch
Civix turns a smartphone photo, voice or text note, and geotag into a verified, severity-scored municipal ticket, autonomously detecting duplicates and merging community reports into actionable work orders for city departments.

---

### Problem & Impact (25% Judging Weight)
Every day, municipalities receive thousands of citizen complaints through fragmented helplines, WhatsApp numbers, and outdated web portals. 
- Over **40% of reports are duplicates** for the same visible issues (e.g. 15 people reporting the same burst water pipe), overwhelming dispatchers.
- Citizen descriptions are vague ("big hole here", "garbage smells bad"), lacking standardized severity or departmental routing.
- Crucial contextual risk factors (such as exposed live wires or deep craters directly outside a primary school or hospital) are ignored because complaints are handled strictly first-come, first-served.

Civix solves this at the intake layer:
1. Translating messy citizen inputs into objective, structured municipal work orders.
2. Merging duplicate reports while compounding priority to reflect true community urgency.
3. Geo-fencing sensitive infrastructure (schools, clinics) to escalate hazards before accidents happen.

---

### Innovation & Technical Excellence (45% Judging Weight)
- **Multi-Modal AI Municipal Vision Pipeline:** Powered by Google Gemini (`gemini-3.6-flash`), our triage pipeline classifies issues across 5 core municipal departments, assesses safety hazard levels, and extracts compact 10-word `visual_signature` embeddings without human dispatcher intervention.
- **Smart Duplicate Merging via Spatial-Visual Fusion:** When a report arrives, Civix performs a 100m spatial search, checks physical similarity against nearby open tickets, and merges duplicates into a single ticket with `reports_count += 1`.
- **Dynamic Priority Engine:** Mathematically balances severity weights (Critical = 60, Medium = 30, Low = 10), citizen endorsement (+5 points per unique reporter), and sensitive-site proximity (+10 points for schools/hospitals within 200m).
- **Zero API Key Leakage:** Built with Next.js App Router server endpoints, ensuring AI keys and Supabase service-role credentials never reach the browser.
- **Fault-Tolerant Resilience:** Guaranteed fallback processing ensures that even if external vision APIs or network latency spikes occur, tickets are still logged as `Needs Review` and citizen reports are never dropped.

---

### User Experience (15% Judging Weight)
- **Citizen Experience:** Mobile-first, sub-3-second submission flow with automatic GPS pin detection, client-side canvas photo compression (under 1MB), native Web Speech voice-to-text, and clear real-time progress indicators.
- **Admin Command Center:** Real-time Kanban board with 4 operational stages (Open, In Review, In Progress, Resolved), 10-second automatic polling, instant optimistic status transitions, and an interactive Leaflet/OpenStreetMap geospatial command view with severity-colored clusters.

---

### Feasibility & Scalability (15% Judging Weight)
Civix runs on serverless Next.js edge architecture backed by PostgreSQL on Supabase and Leaflet OpenStreetMap tiles, requiring $0 in proprietary mapping API costs. It seamlessly integrates into existing city municipal ERPs (SAP, CityWorks) via straightforward webhook exports.
