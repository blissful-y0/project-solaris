# Landing Header Review Fixes Design

## Context
PR #6 introduces a fixed header and returning-visitor hero skip. Review identified two risks:
1) SSR/client mismatch in hero skip decision
2) Anchor navigation obscured by fixed header

## Scope
- Fix hero skip initialization so first render is SSR-consistent.
- Add anchor offset for `#section-world`, `#section-factions`, `#section-system`.
- Exclude Discord URL changes.

## Design
- Move skip decision to client mount effect and store mode (`none|dev|returning`) in state.
- Dispatch existing hero events from a skip-mode effect to keep event contract unchanged.
- Keep completion timestamp write only for normal flow (non-skip).
- Apply `scroll-padding-top` on root and `scroll-margin-top` on section IDs.

## Verification
- Add a focused unit test for skip-mode decision logic (TDD red-green).
- Run targeted test + landing build.
