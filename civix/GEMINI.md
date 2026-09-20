# GEMINI.md (Antigravity overrides for Civix)

Read `AGENTS.md` first. It is the source of truth. This file only adds Antigravity-specific behavior.

## How to work in this repo
- **Plan before coding** for any task touching more than 2 files. Produce a short implementation plan artifact and wait for approval on architecture changes only; proceed autonomously on routine tasks.
- **Verify in the browser.** After UI changes, open the running dev server and check the flow at mobile width (390px) and desktop. Attach a screenshot artifact for the citizen flow and the admin board.
- **Run `npm run typecheck && npm run lint`** before declaring a task done. Run `npm run build` before any deploy step.
- **Prefer workflows.** For scaffolding, classifier, duplicate detection, seeding, deploy, and submission, use the matching `/workflow` in `.agent/workflows/`.
- **Use skills.** Load `classify-grievance` and `duplicate-detection` from `.agent/skills/` when touching AI logic.
- **Small commits.** Commit after each working milestone with a conventional message (`feat:`, `fix:`, `chore:`).
- **Ask before** deleting files, changing the DB schema, adding a new paid/keyed service, or changing the tech stack.
- **Never** print, log, or commit secrets. `.env.local` is gitignored; keep `.env.example` current.

## Time awareness
This is a one-day hackathon build. When choosing between "clean" and "working", choose working, then note the shortcut in `docs/TASKS.md` under "Known shortcuts". Cut scope in this order: drag-and-drop, filters, voice input, map clustering.
