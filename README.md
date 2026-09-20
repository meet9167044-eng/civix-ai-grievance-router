# Civix: AI Civic Grievance Triage & Router

> **Tech for a Better Tomorrow** — Built for HACKDAY 1.0  
> **Live Demo:** [https://civix-ai-grievance-router-gdw9.vercel.app/](https://civix-ai-grievance-router-gdw9.vercel.app/)  
> **Repository:** [https://github.com/meet9167044-eng/civix-ai-grievance-router](https://github.com/meet9167044-eng/civix-ai-grievance-router)

---

## 🏛️ What is Civix?

Municipal complaint systems in modern cities are broken: citizens submit vague complaints that get lost across fragmented departments, while public works staff are inundated with duplicate reports for the same high-visibility issues (like major potholes or water leaks) with zero sense of true severity or urgency.

**Civix** reimagines civic grievance reporting:
1. **Citizen Flow:** Capture a photo, tap to speak or type a brief description, and auto-detect GPS location.
2. **AI Municipal Triage:** Vision models analyze the photo and description, classify the municipal department (`Roads & Infrastructure`, `Sanitation & Waste`, `Electrical & Power`, `Water Supply & Drainage`, `Parks & Public Spaces`), evaluate physical severity (`critical`, `medium`, `low`), and generate neutral, factual work-order descriptions.
3. **Smart Duplicate Detection & Auto-Merge:** When multiple citizens report the same issue in the same vicinity (100m radius), Civix detects physical identity via spatial bounding boxes and AI visual signatures. Instead of flooding dispatchers with duplicate tickets, it merges them: **"Reported by N citizens"** and dynamically boosts priority.
4. **Context-Aware Priority Engine:** Priority scores (0–100) factor in severity, repeat community reports (+5 per citizen), and proximity to sensitive public infrastructure (+10 for schools, hospitals, childcare facilities within 200m).
5. **Admin Operations Center:** Municipal admins get a real-time Kanban board (Open, In Review, In Progress, Resolved) with 10-second auto-polling, instant status dispatching, and an interactive geographic map view with severity-coded pins.

---

## 🚀 The Winning Demo Moment

1. **Citizen A** takes a photo of a road cavity near a school and types "bad pothole". Civix classifies it as `Roads & Infrastructure`, marks severity as `critical`, adds sensitive-site priority boost, and creates ticket `#CVX-1001` (Priority: 80).
2. **Citizen B** 5 minutes later snaps the same pothole from another angle 15m away and writes "broken road".
3. **Civix AI Deduplicator** finds the active nearby ticket, compares visual signatures, and **merges** the report into `#CVX-1001`. The citizen immediately sees: *"Merged with an existing report — Reported by 2 people"*, with priority dynamically climbing to 85.
4. **Admin Dashboard** updates live without manual refresh, ranking the merged issue higher on the Kanban board and clustering the map pin.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router, Turbopack) + TypeScript |
| **Styling** | Tailwind CSS + CSS Variables design tokens |
| **Icons** | Lucide React |
| **Database & Storage**| Supabase (PostgreSQL + Public `civix-images` Storage Bucket) |
| **AI Vision & Triage** | Google Gemini API (`@google/genai` with `gemini-3.6-flash`) |
| **Maps & Geo** | Leaflet + OpenStreetMap + CARTO tiles (`react-leaflet`, `ssr: false`) |
| **Audio / Voice** | Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) |
| **Validation** | Zod schema validation on all inputs and AI outputs |
| **Deployment** | Vercel Serverless |

---

## ⚙️ Environment Variables

Create `.env.local` inside the `civix/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.6-flash
AI_PROVIDER=gemini

NEXT_PUBLIC_DEFAULT_LAT=19.0760
NEXT_PUBLIC_DEFAULT_LNG=72.8777
```

---

## 💻 Local Development Setup

```bash
# Clone the repository
git clone https://github.com/meet9167044-eng/civix-ai-grievance-router.git
cd civix-ai-grievance-router/civix

# Install dependencies
npm install

# Run database seed (inserts 18 realistic municipal tickets)
npm run seed

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser. Test on mobile viewports (390px) for the citizen reporting experience.

### Verification Scripts
```bash
npm run typecheck   # tsc --noEmit (0 TypeScript errors)
npm run lint        # eslint (0 errors, clean code quality)
npm run build       # Next.js production build verification
```

---

## 🔒 Architecture & Engineering Principles

- **Zero Client Key Exposure:** `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` reside exclusively in server-side Next.js route handlers (`/api/reports`, `/api/tickets`).
- **Resilient AI Pipelines:** Every AI call is protected by Zod schemas, single-prompt retries, and algorithmic fallback rules (e.g. spatial duplicate detection if vision API experiences downtime).
- **Graceful Fallback Store:** An in-memory cache mirrors Supabase operations ensuring uninterrupted local evaluation even in degraded network conditions.
- **Hackathon Scope Notice:** For HACKDAY 1.0, user authentication is omitted in favor of a quick client-side role toggle (Citizen ↔ Admin) to streamline judging and live demonstrations.
