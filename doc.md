# Greenship Certification Pricing Calculator

Version: 1.4
Date: 2026-04-22

Primary implementation references:
- `src/engine/constants.ts`
- `src/engine/calculator.ts`
- `src/components/forms/NBEBForm.tsx`
- `src/components/forms/OtherForms.tsx`
- `src/components/results/ResultPanel.tsx`

## 1. Overview

This project is a single-page calculator for estimating GREENSHIP certification fees across the supported schemes. The app is built with Vite, React, TypeScript, and Tailwind CSS, and it is deployed as a static site.

All fee logic lives in the TypeScript engine under `src/engine/`. The React layer is responsible for collecting user input, validating it, and rendering the fee breakdown.

## 2. Supported schemes

| Scheme | Code | Pricing model | Key inputs |
| --- | --- | --- | --- |
| New Building | NB | Bracket table + high-area surcharge | Area (m2), building function |
| Existing Building | EB | Bracket table + high-area surcharge | Area (m2), building function |
| Interior Space | IS | Bracket table | Area (m2), building function |
| Transit Station | TS | Bracket table + high-area surcharge | Area (m2) |
| Homes - Individual | HOMES_A | Category lookup + flat registration fee | Floor area (m2) |
| Homes - Developer | HOMES_B | Per-type discount + surcharge + cap + weighted-area multiplier | Unit types, floor area per type |
| Neighborhood - Plan | NH_PLAN | Linear interpolation by hectare band | Area (ha or m2) |
| Neighborhood - Built | NH_BUILT | Linear interpolation by hectare band | Area (ha or m2) |

## 3. Pricing rules

### 3.1 NB / EB

| Area (m2) | Office | Commercial / Healthcare / Hospitality |
| --- | --- | --- |
| 250 - 2,749 | 130,000,000 | 150,000,000 |
| 2,750 - 9,999 | 152,500,000 | 175,000,000 |
| 10,000 - 29,999 | 175,000,000 | 205,000,000 |
| 30,000 - 79,999 | 210,000,000 | 245,000,000 |
| 80,000 - 149,999 | 245,000,000 | 285,000,000 |
| >= 150,000 | Base fee of the last bracket + Rp 1,500 x (area - 150,000) |

Total fee cap:

```text
total = min(baseFee + surcharge, 500,000,000)
```

UI rule:
- If the final total reaches Rp 500,000,000, the surcharge row is hidden from the breakdown.

### 3.2 Interior Space

| Area (m2) | Office | Commercial / Healthcare / Hospitality |
| --- | --- | --- |
| 25 - 249 | 40,000,000 | 45,500,000 |
| 250 - 749 | 47,500,000 | 55,000,000 |
| 750 - 1,499 | 52,500,000 | 62,500,000 |
| 1,500 - 2,499 | 67,500,000 | 72,500,000 |
| 2,500 - 9,999 | 85,000,000 | 95,000,000 |
| >= 10,000 | 110,000,000 | 122,500,000 |

Interior Space has no surcharge and no 500M total cap rule.

### 3.3 Transit Station

| Area (m2) | Fee |
| --- | --- |
| 250 - 2,749 | 150,000,000 |
| 2,750 - 9,999 | 175,000,000 |
| 10,000 - 29,999 | 205,000,000 |
| 30,000 - 79,999 | 245,000,000 |
| 80,000 - 149,999 | 285,000,000 |
| >= 150,000 | 285,000,000 + Rp 1,500 x (area - 150,000) |

Total fee cap:

```text
total = min(baseFee + surcharge, 500,000,000)
```

UI rule:
- If the final total reaches Rp 500,000,000, the surcharge row is hidden from the breakdown.

### 3.4 Homes - Individual

Registration fee:

```text
REG = 5,000,000
```

Certification fee:

| Floor area | Cert fee |
| --- | --- |
| <= 100 m2 | 35,000,000 |
| 101 - 200 m2 | 42,000,000 |
| > 200 m2 | 50,000,000 |

Total:

```text
total = certFee + REG
```

UI rule:
- The registration fee is included in the final total but not shown as a separate breakdown row.

### 3.5 Homes - Developer

Registration fee and certification cap:

```text
REG = 5,000,000
CAP = 250,000,000
```

Step 1 - base fee by units:

| Units | Base fee |
| --- | --- |
| <= 25 | 40,000,000 |
| 26 - 100 | 45,000,000 |
| > 100 | 52,000,000 |

Step 2 - discount by active type rank:

| Rank | Discount multiplier |
| --- | --- |
| 1st | 1.00 |
| 2nd | 0.75 |
| 3rd | 0.75 |
| 4th+ | 0.60 |

Step 3 - surcharge for types with more than 9 units:

```text
surcharge = ROUND(sqrt(units), 0) x 1,000,000
```

Step 4 - certification subtotal cap:

```text
certAfterCap = min(sumDiscountedFees, 250,000,000)
```

Step 5 - weighted average floor-area multiplier:

```text
weightedAvg = sum(units_i x floorArea_i) / sum(units_i)
```

| Weighted average | Multiplier |
| --- | --- |
| <= 100 m2 | 1.000 |
| 101 - 200 m2 | 1.100 |
| > 200 m2 | 1.175 |

Step 6 - final total:

```text
total = round((certAfterCap + totalSurcharge + REG) x multiplier)
```

Validation rule:
- Every active type must have `floorArea > 0` before calculation can run.

UI rules:
- The registration fee is included in the final total but not shown as a separate breakdown row.
- If any active type is missing floor area, the calculator does not return a result.

### 3.6 Neighborhood

Area is stored internally in hectares. The UI accepts either `ha` or `m2`.

#### Plan

| Area (ha) | Price range |
| --- | --- |
| 10 - 200 | 73,000,000 - 85,000,000 |
| 201 - 400 | 85,500,000 - 93,500,000 |
| > 400 | 93,500,000 + surcharge |

Surcharge above 400 ha:

```text
surcharge = (area - 400) x 200,000
```

#### Built

| Area (ha) | Price range |
| --- | --- |
| 1 - 20 | 110,000,000 - 129,000,000 |
| 21 - 50 | 130,000,000 - 153,000,000 |
| 51 - 200 | 154,000,000 - 189,000,000 |
| 201 - 400 | 190,000,000 - 212,000,000 |
| > 400 | 212,000,000 + surcharge |

Surcharge above 400 ha:

```text
surcharge = (area - 400) x 400,000
```

Interpolation formula:

```text
price = p1 + ((effectiveArea - a1) / (a2 - a1)) x (p2 - p1)
```

Boundary rule:
- If the area crosses an integer upper boundary with a fractional value, interpolation moves into the next band and clamps the effective interpolation area to the lower bound of that next band.
- Example: `200.5 ha` in Plan is treated as band 2 with an effective area of `201`.
- Example: `20.3 ha` in Built is treated as band 2 with an effective area of `21`.

Total fee cap:

```text
total = min(baseFee + surcharge, 500,000,000)
```

UI rule:
- If the final total reaches Rp 500,000,000, the surcharge row is hidden from the breakdown.

## 4. Current application structure

```text
greenship-calc/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── forms/
│   │   │   ├── NBEBForm.tsx
│   │   │   ├── NumberInput.tsx
│   │   │   └── OtherForms.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   └── SideNav.tsx
│   │   └── results/
│   │       └── ResultPanel.tsx
│   ├── engine/
│   │   ├── calculator.ts
│   │   ├── constants.ts
│   │   └── types.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── DISCREPANCY_AUDIT.md
├── README.md
├── index.html
├── netlify.toml
├── package.json
└── vite.config.ts
```

## 5. Validation and UI behavior

- The forms compute validation and derived results directly from current input state.
- Result panels update in real time as valid inputs become available.
- `NB`, `EB`, `TS`, and `NH` hide surcharge rows when the final total reaches Rp 500,000,000.
- Homes B requires floor area for every active type before any total is shown.
- Neighborhood phase changes and unit changes clear the current area input to avoid cross-context errors.
- The result panel includes:
  - Total fee in IDR
  - Fee breakdown
  - Warning cards
  - CTA to the GBCI form
  - Print / PDF export via `window.print()`

## 6. Security and deployment notes

- Frontend-only static application
- No server, database, or SQL layer
- Netlify headers are configured in `netlify.toml`
- The app does not use `dangerouslySetInnerHTML`
- Pricing logic is isolated in pure TypeScript for easier review and testing
