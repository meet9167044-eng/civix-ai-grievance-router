---
description: Pre-flight checks and deploy to Vercel with correct environment variables
---

# /deploy

1. Run `npm run typecheck && npm run lint && npm run build`. Fix all failures.
2. Confirm `.env.local` is gitignored and no secrets appear in the repo (`git grep -nE "AIza|service_role|sk-"`).
3. Confirm `.env.example` lists every variable used.
4. Verify Leaflet CSS is imported and the map is loaded with `dynamic(..., { ssr: false })`, otherwise the production build breaks.
5. Push to GitHub (public repo, so judges can open it). Ask the user for the remote URL if not set.
6. Deploy on Vercel (import repo, or `npx vercel --prod`). Set env vars in the Vercel dashboard: all values from `.env.example`. Server-only keys must NOT have the `NEXT_PUBLIC_` prefix.
7. Confirm the Supabase Storage bucket is public-read and CORS allows the Vercel domain.
8. Smoke test on the deployed URL from a real phone: report a photo end to end, check the admin board, check the map.
9. Save the deployed URL into `README.md`.
10. Commit: `chore: deploy config`.
