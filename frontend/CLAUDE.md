# Frontend (React) — instructions

Follow @GUIDELINES.md for every change in `frontend/`.

Quick reminders:

- Use only the design tokens from `src/styles/tokens.css`. Take API types only from the generated `src/api/schema.d.ts`.
- Put server state in TanStack Query, shareable UI state in the URL, and persisted client state in Zustand.
- Every interactive element gets a `data-testid` (GUIDELINES §6.1).
- Before finishing, run `npm run lint && npm run typecheck && npm run test`.
