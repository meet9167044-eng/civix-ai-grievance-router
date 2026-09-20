# Code Style (Always On)

- TypeScript strict mode. No `any`; use `unknown` and narrow, or Zod-parse.
- Functional React components, named exports for components, default export only for `page.tsx` / `layout.tsx`.
- Server Components by default. Add `"use client"` only where state, effects, or browser APIs are needed (report flow, voice, map, Kanban).
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities.
- Keep components under about 150 lines; extract subcomponents when they grow.
- Pure logic (haversine, priority score, dedupe filtering) lives in `src/lib` and must be side-effect free so it can be unit-tested quickly.
- Use path alias `@/` for `src/`.
- Route handlers return `NextResponse.json({ ... })` with a consistent shape: `{ ok: true, data }` or `{ ok: false, error }` and correct HTTP status codes.
- Handle every `await` that can fail with try/catch in route handlers; never let a raw stack trace reach the client.
- Comments explain *why*, not *what*. Add a one-line header comment to each `lib/` file describing its job.
- Commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `style:`.
- Before finishing any task: `npm run typecheck && npm run lint` must pass.
