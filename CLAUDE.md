# Furniro — project instructions

Full-stack furniture e-commerce demo built from `Furniro_Web_Design_UI_KIT.pdf`. Scope is the **frontend and
backend only**: do not write automated tests (unit, integration, component or E2E) and do not add test hooks.
The UI carries `data-testid`s so tests can be added later (PLAN.md §8, D-5).

- Plan, scope, phases and decisions: @PLAN.md
- Design tokens and screen spec: @docs/DESIGN_SPEC.md
- REST contract: @docs/API_CONTRACT.md
- Backend rules: `backend/GUIDELINES.md` (loaded through `backend/CLAUDE.md`)
- Frontend rules: `frontend/GUIDELINES.md` (loaded through `frontend/CLAUDE.md`)

## Cross-cutting rules
1. **Contract first.** An API change updates `docs/API_CONTRACT.md`, the backend OpenAPI snapshot, and the regenerated `frontend/src/api/schema.d.ts` in the same change.
2. **Match the design.** Check the screen in `docs/design/screens/` before building UI. Undesigned screens reuse existing tokens and components only. Log deviations in PLAN.md §2.2.
3. **Test IDs, not tests.** Every new interactive element and repeated item gets a `data-testid` (frontend/GUIDELINES.md §6). Keep the seed deterministic and bump `SEED_VERSION` when seed data changes.
4. **Money is integer US cents** end to end. Format it only in the UI's `formatPrice()`, which gives `$2,500.00`.
5. **Definition of Done** is in PLAN.md §9. Track phase progress with the checkboxes in PLAN.md §7. Before finishing, run `make check` (lint, types, build, contract).
6. Keep the docs alive. When a rule, structure or decision changes, edit the relevant `.md` in the same change.
