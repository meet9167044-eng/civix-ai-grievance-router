---
description: Scaffold the Civix Next.js project, dependencies, folder structure, and env template
---

# /scaffold

Goal: a running Next.js app with the Civix folder structure in under 15 minutes.

1. Read `AGENTS.md` and `.agent/rules/01-tech-stack.md`.
2. Create the app in the current directory: Next.js App Router, TypeScript, Tailwind, ESLint, `src/` directory, import alias `@/*`. Use `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`.
3. Install dependencies: `@supabase/supabase-js`, `@google/genai`, `zod`, `lucide-react`, `leaflet`, `react-leaflet`, `@types/leaflet`. Install `tsx` as a dev dependency for the seed script.
4. Add scripts to `package.json`: `typecheck` (`tsc --noEmit`) and `seed` (`tsx scripts/seed.ts`).
5. Create the folder structure listed in `AGENTS.md` with placeholder files and one-line header comments.
6. Write `src/lib/types.ts` (Ticket, Report, Severity, Category, Status), `src/lib/departments.ts` (category to department map with lucide icon names), and `src/lib/geo.ts` (`haversineMeters`).
7. Create `.env.example` (see `01-tech-stack.md`), and make sure `.env.local` is in `.gitignore`.
8. Build the header with the Citizen/Admin toggle and the landing page with two large entry cards.
9. Run `npm run dev` and verify the landing page in the browser at 390px and desktop.
10. Run `npm run typecheck && npm run lint`, then commit: `chore: scaffold civix`.

Stop and report if any install fails. Do not add dependencies outside the approved list.
