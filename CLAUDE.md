# Furniro — project instructions

Full-stack furniture e-commerce demo built from `Furniro_Web_Design_UI_KIT.pdf`. It is used as a
**target for software testing**, so stability, determinism and test hooks matter as much as features.

- Plan, scope, phases and decisions: @PLAN.md
- Design tokens and screen spec: @docs/DESIGN_SPEC.md
- REST contract: @docs/API_CONTRACT.md
- Backend rules: `backend/GUIDELINES.md` (loaded through `backend/CLAUDE.md`)
- Frontend rules: `frontend/GUIDELINES.md` (loaded through `frontend/CLAUDE.md`)

## Cross-cutting rules
1. **Contract first.** An API change updates `docs/API_CONTRACT.md`, the backend OpenAPI snapshot, and the regenerated `frontend/src/api/schema.d.ts` in the same change.
2. **Match the design.** Check the screen in `docs/design/screens/` before building UI. Undesigned screens reuse existing tokens and components only. Log deviations in PLAN.md §2.2.
3. **Keep it testable.** Add a `data-testid` to new interactive elements. Keep the seed deterministic and bump `SEED_VERSION` when seed data changes. Never expose `/__test__` routes outside `APP_ENV=test`.
4. **Money is integer US cents** end to end. Format it only in the UI's `formatPrice()`, which gives `$2,500.00`.
5. **Bug toggles** (PLAN.md §13) are off by default and never allowed in prod. Defect code sits only behind `bugs.is_active()` or `useBug()`, and `docs/BUG_CATALOGUE.md` must match the code.
6. **Definition of Done** is in PLAN.md §9. Track phase progress with the checkboxes in PLAN.md §7.
7. Keep the docs alive. When a rule, structure or decision changes, edit the relevant `.md` in the same change.
