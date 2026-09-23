# Frontend (React) — instructions

Follow @GUIDELINES.md for every change in `frontend/`.

Quick reminders:

- Use only the design tokens from `src/styles/tokens.css`. Take API types only from the generated `src/api/schema.d.ts`.
- Put server state in TanStack Query, shareable UI state in the URL, and persisted client state in Zustand.
- Every interactive element, repeated item and displayed value gets a `data-testid` (GUIDELINES §6). Do not write tests (PLAN.md D-5).
- Before finishing, run `npm run lint && npm run typecheck && npm run build`.
