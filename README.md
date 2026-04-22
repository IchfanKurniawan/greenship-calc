# GREENSHIP Fee Calculator

A Vite + React + TypeScript calculator for estimating GREENSHIP certification fees across the supported GBCI schemes.

## What this project does

The app calculates estimated certification fees for:

- New Building (`NB`)
- Existing Building (`EB`)
- Interior Space (`IS`)
- Transit Station (`TS`)
- Homes - Individual (`HOMES_A`)
- Homes - Developer (`HOMES_B`)
- Neighborhood - Plan (`NH_PLAN`)
- Neighborhood - Built (`NH_BUILT`)

The fee engine is framework-agnostic and lives in `src/engine/`. The React UI in `src/components/` handles input, validation, and presentation.

## Quick start

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal to use the calculator.

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Project structure

```text
src/
├── components/
│   ├── forms/
│   │   ├── NBEBForm.tsx
│   │   ├── NumberInput.tsx
│   │   └── OtherForms.tsx
│   ├── layout/
│   │   ├── Footer.tsx
│   │   └── SideNav.tsx
│   └── results/
│       └── ResultPanel.tsx
├── engine/
│   ├── calculator.ts
│   ├── constants.ts
│   └── types.ts
├── App.tsx
├── index.css
└── main.tsx
```

## Key files

- `src/engine/constants.ts`: pricing tables, caps, and thresholds
- `src/engine/calculator.ts`: pure calculation functions for every scheme
- `src/engine/types.ts`: shared engine and UI types
- `src/components/forms/NBEBForm.tsx`: New Building / Existing Building form
- `src/components/forms/OtherForms.tsx`: IS, TS, Homes, and Neighborhood forms
- `src/components/results/ResultPanel.tsx`: result rendering and print CTA
- `doc.md`: project notes, pricing rules, and current architecture
- `DISCREPANCY_AUDIT.md`: severity-first audit report of the previous review pass

## Important behavior notes

- `NB`, `EB`, `TS`, and `NH` apply a total fee cap of Rp 500,000,000.
- When the final total reaches Rp 500,000,000, the surcharge row is hidden from the displayed breakdown.
- Homes A uses `<= 100 m2`, `101-200 m2`, and `> 200 m2`.
- Homes A shows certification-only pricing and excludes the registration fee from the estimate.
- Homes B requires floor area for every active type before any total is calculated.
- Homes B applies a certification subtotal cap of Rp 250,000,000 before the weighted-area multiplier.
- Homes B shows certification-only pricing and excludes the registration fee from the estimate.

## Deployment

The app is configured for static hosting and includes Netlify settings in `netlify.toml`.
