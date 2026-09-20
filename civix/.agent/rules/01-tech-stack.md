# Tech Stack and Dependencies (Always On)

## Use these
- **Next.js (App Router) + TypeScript (strict).** Server logic in route handlers under `src/app/api`.
- **Tailwind CSS** for all styling. No CSS modules, no styled-components.
- **lucide-react** for icons. No other icon library.
- **Supabase** (`@supabase/supabase-js`) for Postgres and Storage. Bucket: `civix-images` (public read).
- **react-leaflet + leaflet** with OpenStreetMap tiles. Load the map with `next/dynamic` and `ssr: false`. Marker clustering with `react-leaflet-cluster` only if time allows.
- **@google/genai** for Gemini (vision + JSON output). Keep a provider interface in `src/lib/ai/client.ts` so Claude can be swapped in via `AI_PROVIDER`.
- **Zod** for validating AI output and API request bodies.
- **Web Speech API** (`webkitSpeechRecognition`) for voice. Feature-detect and fall back to text.

## Do not add
Redux/Zustand (React state is enough), an ORM (use the Supabase client), Google Maps (needs billing), any auth library, UI kits that need heavy setup. Ask before adding any dependency not listed above.

## Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server only
GEMINI_API_KEY=              # server only
GEMINI_MODEL=                # vision-capable model; verify current name in Google AI Studio
AI_PROVIDER=gemini
NEXT_PUBLIC_DEFAULT_LAT=
NEXT_PUBLIC_DEFAULT_LNG=
```
Keep `.env.example` in sync with every new variable. Never commit `.env.local`.

## Performance guards
- Compress images client-side to max 1280px and about 0.8 JPEG quality before upload.
- Cap audio transcript at 500 characters.
- One AI call for classification, at most one more for duplicate comparison.
