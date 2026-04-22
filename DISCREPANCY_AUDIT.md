# Greenship Calc Discrepancy Audit

Date: 2026-04-22
Baseline: `doc.md` plus the current codebase in `src/`

## Scope and verification

- `npm run build`: passed
- `npm run lint`: failed with 15 problems (8 errors, 7 warnings)
- Runtime spot checks were executed against the compiled engine for the requested edge cases, including Homes A at exactly 100 m2, Homes B cap and partial floor-area input, NH fractional boundaries, and very large NH / NB / TS inputs.

## Critical

- No critical findings.

## High

### H1. `doc.md` is internally inconsistent on core pricing rules, and the Homes A screen still shows the old boundary wording

- Affected area: pricing baseline, Homes A UX, auditability
- Evidence:
  - `doc.md:49` says Homes A `100 m2` is officially in the Small category and the old edge-case note was removed.
  - `doc.md:130-136` still says the pricing table is `< 100`, `101-200`, `> 200` and that exactly `100 m2` is undefined.
  - `doc.md:291` still says to show an amber note for Homes A at exactly `100 m2`.
  - `doc.md:140` says Homes B cap is `Rp 250,000,000`, but `doc.md:166` still uses `200,000,000` in the formula.
  - `src/engine/calculator.ts:171-189` implements Homes A as `<= 100` for Small and uses `HOMES_CAP = 250_000_000`.
  - `src/components/forms/OtherForms.tsx:101-104` still hints `"< 100 m2 / 101-200 m2 / > 200 m2"`.
- Expected behavior: one authoritative rule set, and UI guidance that matches the engine.
- Actual behavior: the engine follows the newer rule, but `doc.md` still contains older conflicting rules, and the Homes A form hint still teaches the older threshold.
- Plain-language explanation: someone checking the calculator against `doc.md` can reach a different answer depending on which section they read. The app total for `100 m2` is `Rp 40,000,000`, but the screen text still suggests `100 m2` falls into a gap.
- Follow-up options:
  1. Recommended: treat the latest changelog as the winning rule, then update every older section and the Homes A hint to match `<= 100` and the `250M` Homes B cap. This is the fastest path to a single source of truth, but it assumes the changelog is trustworthy.
  2. Pause and confirm the disputed rules with the product owner before editing docs. This is safer if the team no longer trusts the changelog, but it leaves the repo internally inconsistent in the meantime.
  3. Keep both interpretations visible and mark the conflict explicitly in the UI and docs until it is resolved. This avoids silent mismatch, but it also tells users the calculator is not fully settled.

### H2. Homes B silently applies the floor-area multiplier from only the filled rows when some active types are missing floor area

- Affected area: Homes B totals, user trust, form behavior
- Evidence:
  - `src/engine/calculator.ts:211-223` says the weighted average is "across all active types" but the implementation filters to `floorArea > 0` and only returns `null` when none of the active rows have floor area.
  - The comment at `src/engine/calculator.ts:213` says it returns `null` if any active type is missing `floorArea`, but the code does not do that.
  - `src/components/forms/OtherForms.tsx:157-165` repeats the same "filled rows only" logic for the live multiplier label.
  - Runtime check: one active row with `20 units @ 300 m2` and one active row with `20 units` but blank floor area still produced a `1.175` multiplier and a final total of `Rp 97,525,000`, with no warning.
- Expected behavior: one explicit policy for partial floor-area input, applied consistently across the engine, UI, comment text, and user warnings.
- Actual behavior: blank floor-area rows are excluded from the average, the total still changes, and the user gets no warning unless all active rows are blank.
- Plain-language explanation: a user can leave one type unfinished and still get a larger multiplier as if the missing type did not exist. That makes the total look precise even though one of the required inputs is effectively being ignored.
- Follow-up options:
  1. Recommended: if any active type is missing floor area, do not apply the multiplier and show a warning. This is the clearest user experience and removes silent assumptions, but it will change current totals for partially filled inputs.
  2. Keep the current calculation but document it clearly everywhere: only rows with floor area are included in the weighted average, and blank rows are excluded with a visible warning. This preserves current totals, but many users will still find it unintuitive.
  3. Make floor area required for every active type before Homes B can calculate. This is the cleanest rule, but it removes the current "partial input" flexibility.

## Medium

### M1. Neighborhood `> 400 ha` logic does not apply the documented surcharge cap in the breakdown

- Affected area: NH breakdown accuracy, audit trail, user explanation
- Evidence:
  - `doc.md:186-205` documents `extra = min((area - 400) * rate, 500,000,000)` for both Plan and Built.
  - `src/engine/constants.ts:98` defines `NH_HIGH_AREA_MAX_EXTRA = 500_000_000`.
  - `src/engine/calculator.ts:342-347` calculates `surcharge = excessHa * highAreaRate` directly and never uses `NH_HIGH_AREA_MAX_EXTRA`.
  - Runtime check: `calculateNH({ area: 5000, phase: 'plan' })` returned a final total of `Rp 500,000,000`, but the breakdown still showed `Biaya Tambahan = Rp 920,000,000`.
- Expected behavior: the surcharge row should follow the documented capped formula, not just the final total cap.
- Actual behavior: the final total is later capped to `Rp 500,000,000`, but the surcharge line can still exceed the documented maximum additional fee.
- Plain-language explanation: the total looks capped, but the explanation underneath it is not. A user reading the breakdown could believe the surcharge itself can exceed the rule that the docs say is the maximum.
- Follow-up options:
  1. Recommended: cap the NH surcharge itself before building the breakdown row, so the explanation matches the documented formula. This keeps both the total and the audit trail consistent.
  2. If the team wants only the final total cap to matter, remove the surcharge-cap rule from `doc.md` and delete `NH_HIGH_AREA_MAX_EXTRA`. This reduces code/doc drift, but it changes the written business rule.
  3. Keep the current math but add a second note that the displayed surcharge is pre-cap while the final total is post-cap. This is better than silence, but still harder for users to follow.

### M2. The repo's lint gate is broken by repeated effect-driven state updates in the forms

- Affected area: engineering health, maintainability, CI readiness
- Evidence:
  - `npm run lint` fails with 15 findings.
  - `src/components/forms/NBEBForm.tsx:16-34` resets local state and updates error state inside effects.
  - `src/components/forms/OtherForms.tsx:16-26`, `60-70`, `88-98`, `121-132`, and `284-301` repeat the same pattern across IS, TS, Homes A, Homes B, and NH.
  - The lint rule being hit is `react-hooks/set-state-in-effect`, plus missing dependency warnings for `onResult`.
- Expected behavior: repo checks should pass, and calculation flows should not depend on effect bodies that synchronously trigger more state updates.
- Actual behavior: the project builds, but the form layer does not satisfy its own lint configuration.
- Plain-language explanation: the calculator still runs, but the code is using a pattern React is actively warning against. That makes the repo harder to maintain and means anyone trying to enforce CI quality will hit a failing lint step immediately.
- Follow-up options:
  1. Recommended: refactor form calculation flow so validation and derived results are computed from input state without setting more local state inside effects. This fixes the root issue and aligns with current React guidance.
  2. Keep the current implementation and weaken the lint rules. This is faster short term, but it normalizes a pattern the current toolchain already considers risky.
  3. Split the difference: keep the effect-based flow for now, but isolate repeated logic into shared helpers and add a repo note that lint is knowingly non-green. This reduces duplication, but does not actually fix the failing gate.

### M3. `NumberInput` uses a dynamic Tailwind padding class that is not emitted in the built CSS

- Affected area: shared input UI, readability of entered values
- Evidence:
  - `src/components/forms/NumberInput.tsx:45-46` builds the class string as ``pr-${unit ? '16' : '4'}``.
  - The built CSS in `dist/assets/*.css` contains no generated `.pr-16` or `.pr-4` utilities from that dynamic expression.
  - The unit label is rendered at `src/components/forms/NumberInput.tsx:57-60`, so the control relies on right padding to avoid overlap.
- Expected behavior: inputs with a unit suffix should reserve right-side space reliably.
- Actual behavior: the padding utility is not statically discoverable by Tailwind, so the input can render without the intended extra right padding.
- Plain-language explanation: the unit badge on the right side of the input can sit on top of the typed number because the CSS class that was supposed to create breathing room was never generated.
- Follow-up options:
  1. Recommended: replace the dynamic class with an explicit static branch such as `unit ? 'pr-16' : 'pr-4'`. This is simple, reliable, and keeps the shared component intact.
  2. Move the padding to an inline style or a custom component class. This also works, but it is less consistent with the rest of the Tailwind-based styling.
  3. Leave the current code alone and safelist the classes in Tailwind config. That fixes the symptom, but the component still uses a brittle pattern.

### M4. `doc.md` points to missing reference files and an outdated architecture that no longer matches the repo

- Affected area: onboarding, auditability, repo documentation
- Evidence:
  - `doc.md:5-6` references `design.md` and `documentation.md`, but neither file exists in the repo.
  - `doc.md:236-247` describes separate files like `ISForm.tsx`, `TSForm.tsx`, `HomesAForm.tsx`, `HomesBForm.tsx`, and `NHForm.tsx`.
  - The actual forms directory contains `NBEBForm.tsx`, `NumberInput.tsx`, and `OtherForms.tsx`; the listed per-form files do not exist.
- Expected behavior: the "authoritative" project document should point to real references and describe the current code layout.
- Actual behavior: the repo's main planning document references files that are missing and a component structure that has already been consolidated.
- Plain-language explanation: a new maintainer would follow the documentation and look for files that are not there. That slows down audits, fixes, and onboarding because the map no longer matches the territory.
- Follow-up options:
  1. Recommended: update `doc.md` so every referenced file exists and the architecture section matches the current directory layout. This is the fastest way to restore trust in the repo docs.
  2. Recreate the missing reference docs and split the form files back out to match the document. This gives the original plan back its shape, but it is much more work and may not be worth it.
  3. Add a short "documentation drift" note at the top of `doc.md` and defer the full rewrite. This sets expectations, but it does not solve the navigation problem.

## Low

### L1. The root `README.md` is still the default Vite starter template

- Affected area: repo documentation, handoff quality
- Evidence:
  - `README.md:1-40` describes the generic React + TypeScript + Vite template and does not describe GREENSHIP pricing logic, schemes, commands, or repo-specific workflow.
- Expected behavior: the root README should explain what this project is, how to run it, and where the pricing logic lives.
- Actual behavior: the first document a maintainer sees is unrelated starter content.
- Plain-language explanation: the repo looks less finished than it actually is because the top-level documentation still reads like a scaffold that was never customized.
- Follow-up options:
  1. Recommended: replace the README with a project-specific overview, setup instructions, scheme summary, and links to the real calculation files. This gives the repo a usable front door.
  2. Add a short redirect note in the README that points readers to `doc.md`. This is quick, but still leaves the root doc weak.
  3. Leave it as-is because `doc.md` exists. This saves time, but keeps the first impression misleading.

### L2. The repo contains stale or unused implementation artifacts

- Affected area: maintainability, future change safety
- Evidence:
  - `src/components/results/ResultRing.tsx` exists, but no imports or JSX usage were found for `ResultRing` anywhere in `src/`.
  - `src/engine/types.ts:43` still exposes `maxFeeForRing`, and `src/engine/calculator.ts:96`, `118`, `160`, `189`, `311`, and `373` still populate it even though the ring is not rendered anymore.
  - `src/engine/constants.ts:125-133` exports `SCHEME_META`, but it is unused and includes a duplicate `code: 'NB'` for `NH_BUILT`.
  - No in-repo references were found for `src/assets/hero.png`, `src/assets/logo-green.png`, `src/assets/logo-white.png`, or `src/assets/vite.svg`.
- Expected behavior: dead code and stale metadata should be removed or clearly parked for future use.
- Actual behavior: the repo still carries leftover pieces from earlier UI versions and metadata that is not driving the current app.
- Plain-language explanation: none of these items break the calculator today, but they make the codebase noisier and increase the chance that someone later reuses outdated metadata by mistake.
- Follow-up options:
  1. Recommended: remove the unused component, obsolete fields, stale metadata, and unreferenced assets after a quick final verification. This keeps the codebase lean and lowers future confusion.
  2. Keep them, but mark them clearly as unused or reserved for a future UI revision. This preserves optional reuse, but the repo stays cluttered.
  3. Ignore them because they are harmless at runtime. This is acceptable short term, but it slowly raises maintenance cost.

## Best next actions

- Immediate fixes:
  - Fix the Homes A wording mismatch in the form and clean up the conflicting sections in `doc.md`.
  - Decide the Homes B partial floor-area rule, then enforce it consistently in the engine, UI, and documentation.
  - Correct the NH `> 400 ha` surcharge breakdown so the explanation matches the documented cap behavior.
  - Replace the dynamic Tailwind padding class in `NumberInput`.

- Spec decisions needed:
  - Confirm whether the changelog is the official source of truth when it conflicts with older detail sections.
  - Confirm whether Homes B should calculate with partial floor-area input or require every active type to be complete.
  - Confirm whether NH should keep both a surcharge cap and a total cap, or only the final total cap.

- Cleanup and documentation work:
  - Refactor the forms so `npm run lint` passes.
  - Rewrite the root `README.md` for the actual project.
  - Update `doc.md` references and architecture notes so they match the real repo.
  - Remove or clearly mark unused UI artifacts and stale metadata.
