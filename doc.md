# Greenship Certification Pricing Calculator — Project Plan

**Version:** 1.1 (Updated with GBCI clarifications)
**Date:** 2026-04-09
**Design Reference:** `design.md` (Carbon Intelligence Design System)
**Logic Reference:** `documentation.md` (GREENSHIP Certification Pricing)

---

## Changelog v1.3

| # | Change | Detail |
|---|---|---|
| 1 | Homes B — weighted average multiplier | New input: `floorArea` per type. After computing base total, multiply by floor-area category factor |
| 2 | Homes B — cap raised | Certification subtotal cap: 200M → **250M** |
| 3 | Registration fee display | "Biaya Pendaftaran" row hidden from breakdown in Homes A and Homes B (total unchanged) |

### Homes B — Floor Area Multiplier (v1.3)

Weighted average floor area is computed across all active types:

```
totalUnits   = Σ units_i  (active types with floorArea > 0)
weightedAvg  = Σ (units_i × floorArea_i) / totalUnits
```

Then the **entire final total** (cert after cap + surcharge + REG) is multiplied:

| Category | Condition | Multiplier |
|---|---|---|
| Small | weightedAvg ≤ 100 m² | 1.000 |
| Medium | 101 ≤ weightedAvg ≤ 200 m² | 1.100 |
| Large | weightedAvg > 200 m² | 1.175 |

```
finalTotal = round((certAfterCap + totalSurcharge + REG) × multiplier)
```

If no active type has floor area filled, multiplier defaults to 1.0 with a warning.

## Changelog v1.2

| # | Change | Detail |
|---|---|---|
| 1 | Logo removed | Pure "GREENSHIP" typography used across all UI surfaces |
| 2 | Favicon | White calculator SVG icon on teal background |
| 3 | Total price cap | NB, EB, TS, NH: total fee capped at **Rp 500.000.000** (applies to final sum, not just surcharge) |
| 4 | Homes B UI | Removed "Biaya Daftar" summary chip from the type input panel |
| 5 | Homes A — 100 m² | Officially assigned to Small category (≤ 100 m²); edge case note removed |

Two ambiguities from the peer review were resolved with GBCI input:

| # | Ambiguity | Resolution |
|---|---|---|
| 1 | NH >400 ha surcharge — total area or excess? | **Excess only.** Rate applies per ha **above 400**. Max additional fee is **Rp 500,000,000** |
| 2 | NH band boundary — area = 200.x falls into which band? | **Round up to 201.** If `area > 200`, force effective interpolation area to `max(area, 201)`, placing it in band 2 |

---

## 1. Project Overview

A single-page web application (Vite + React + TypeScript + Tailwind CSS) that calculates GREENSHIP certification fees across **six certification schemes**. All pricing logic lives in a pure TypeScript engine (no framework coupling). Deployed on Netlify as a static site.

**Design language:** Carbon Intelligence "Veridian Metric" — Deep Teal sidebar, Mint Glow accents, Inter typeface, 8px radius cards.

---

## 2. Certification Schemes & Routing

| Scheme | Code | Pricing Model | Key Inputs |
|---|---|---|---|
| New Building | NB | Bracket table + area surcharge | Area (m²), Building Function |
| Existing Building | EB | Bracket table + area surcharge | Area (m²), Building Function |
| Interior Space | IS | Bracket table (no surcharge) | Area (m²), Building Function |
| Transit Station | TS | Single-column bracket + area surcharge | Area (m²) |
| Homes — Individual | HOMES_A | Lookup + flat registration fee | Floor Area (m²) |
| Homes — Developer | HOMES_B | Per-type discount + surcharge + cap + registration | Unit types (up to 20) |
| Neighborhood — Plan | NH_PLAN | Linear interpolation by ha band | Area (ha or m²) |
| Neighborhood — Built | NH_BUILT | Linear interpolation by ha band | Area (ha or m²) |

---

## 3. Pricing Logic (Authoritative Reference)

### 3.1 NB / EB (shared bracket table)

| Area (m²) | Office (M IDR) | Commercial / Healthcare / Hospitality (M IDR) |
|---|---|---|
| 250 – 2,749 | 130 | 150 |
| 2,750 – 9,999 | 152.5 | 175 |
| 10,000 – 29,999 | 175 | 205 |
| 30,000 – 79,999 | 210 | 245 |
| 80,000 – 149,999 | 245 | 285 |
| ≥ 150,000 | base + Rp 1,500 × (area − 150,000) |

**Total price cap (v1.2): `total = min(baseFee + surcharge, 500,000,000)`**

### 3.2 IS (Interior Space)

| Area (m²) | Office (M IDR) | Commercial / Healthcare / Hospitality (M IDR) |
|---|---|---|
| 25 – 249 | 40 | 45.5 |
| 250 – 749 | 47.5 | 55 |
| 750 – 1,499 | 52.5 | 62.5 |
| 1,500 – 2,499 | 67.5 | 72.5 |
| 2,500 – 9,999 | 85 | 95 |
| ≥ 10,000 | 110 | 122.5 |

No high-area surcharge for IS.

### 3.3 Transit Station

| Area (m²) | Fee (M IDR) |
|---|---|
| 250 – 2,749 | 150 |
| 2,750 – 9,999 | 175 |
| 10,000 – 29,999 | 205 |
| 30,000 – 79,999 | 245 |
| 80,000 – 149,999 | 285 |
| ≥ 150,000 | 285 base + Rp 1,500 × (area − 150,000) |

**Total price cap (v1.2): `total = min(baseFee + surcharge, 500,000,000)`**

### 3.4 Homes Track A (Individual)

REG = Rp 5,000,000 (flat, always added)

| Floor Area | Cert Fee |
|---|---|
| < 100 m² | 35,000,000 |
| 101 – 200 m² | 42,000,000 |
| > 200 m² | 50,000,000 |

**Total = cert_fee + 5,000,000**

Edge case: exactly 100 m² is undefined in the source — show a GBCI confirmation note.

### 3.5 Homes Track B (Developer/Cluster)

REG = Rp 5,000,000 | CAP = Rp 250,000,000 (certification subtotal only) — updated v1.3

**Step 1 — Base fee by units:**

| Units | Base Fee |
|---|---|
| ≤ 25 | 40,000,000 |
| 26 – 100 | 45,000,000 |
| > 100 | 52,000,000 |

**Step 2 — Discount by active type rank:**

| Rank | Discount |
|---|---|
| 1st | 100% |
| 2nd | 75% |
| 3rd | 75% |
| 4th+ | 60% |

**Step 3 — Surcharge (units > 9 only):**
```
surcharge = ROUND(√units, 0) × 1,000,000
```

**Step 4 — Cap:**
```
cert_after_cap = min(sum_discounted_fees, 200,000,000)
```

**Step 5 — Total:**
```
total = cert_after_cap + total_surcharge + 5,000,000
```

### 3.6 Neighborhood — UPDATED (v1.1)

Area measured in **hectares (ha)**. UI accepts m² or ha (converted to ha internally).

#### Plan Phase

| Area (ha) | Price Range (M IDR) |
|---|---|
| 10 – 200 | 73 – 85 |
| 201 – 400 | 85.5 – 93.5 |
| > 400 | Base = 93.5M (upper bound of band 2) + surcharge |

**Surcharge >400 ha (CLARIFIED):**
```
extra = min((area - 400) × 200,000, 500,000,000)
total = 93,500,000 + extra
```

#### Built Phase

| Area (ha) | Price Range (M IDR) |
|---|---|
| 1 – 20 | 110 – 129 |
| 21 – 50 | 130 – 153 |
| 51 – 200 | 154 – 189 |
| 201 – 400 | 190 – 212 |
| > 400 | Base = 212M (upper bound of band 4) + surcharge |

**Surcharge >400 ha (CLARIFIED):**
```
extra = min((area - 400) × 400,000, 500,000,000)
total = 212,000,000 + extra
```

#### Interpolation Formula

```
price = p1 + ((effectiveArea − a1) / (a2 − a1)) × (p2 − p1)
```

#### Band Boundary Rule (CLARIFIED v1.1)

At integer band boundaries, if `area > bandUpperLimit`, the effective interpolation area for the **next band** is clamped to `max(area, nextBandLower)`. This prevents negative interpolation results from fractional inputs near band edges.

Examples:
- NH Plan area = 200.5 ha → falls in band 2 (a1=201, a2=400) → effectiveArea = max(200.5, 201) = 201 → price = 85.5M
- NH Built area = 20.3 ha → falls in band 2 (a1=21, a2=50) → effectiveArea = max(20.3, 21) = 21 → price = 130M

---

## 4. Application Architecture

```
greenship-calc/
├── src/
│   ├── engine/              # Pure TypeScript, no React deps
│   │   ├── types.ts         # All TypeScript interfaces
│   │   ├── constants.ts     # Pricing tables as readonly constants
│   │   └── calculator.ts    # Pure calculation functions
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SideNav.tsx
│   │   │   └── Footer.tsx
│   │   ├── forms/
│   │   │   ├── NumberInput.tsx   # Reusable validated input
│   │   │   ├── NBEBForm.tsx
│   │   │   ├── ISForm.tsx
│   │   │   ├── TSForm.tsx
│   │   │   ├── HomesAForm.tsx
│   │   │   ├── HomesBForm.tsx
│   │   │   └── NHForm.tsx
│   │   └── results/
│   │       ├── ResultPanel.tsx
│   │       └── ResultRing.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── netlify.toml
```

---

## 5. Security & Maintainability

| Concern | Implementation |
|---|---|
| Input validation | All inputs sanitized: finite numbers, positive, within scheme-valid ranges |
| XSS prevention | No `dangerouslySetInnerHTML`, no `eval()` |
| TypeScript strict | `"strict": true` in tsconfig.json |
| No SQL / backend | Pure frontend static site — no server, no DB |
| Security headers | `netlify.toml` sets CSP, X-Frame-Options, X-Content-Type-Options |
| Engine isolation | Engine functions are pure TS with no DOM/React coupling |

---

## 6. UI Features

- **Inputs:** Number inputs only (no sliders), step=0.001, 3 decimal precision for areas
- **NH unit:** User selects m² or ha; converted to ha internally
- **Prices:** Displayed in IDR (Indonesian Rupiah) with thousand separators
- **Real-time calc:** Result updates as inputs change
- **Post-result CTAs (bottom of screen):**
  - "Daftar Sekarang!" → `https://gbcindonesia.org/certification/greenship/form`
  - "Print" → `window.print()` with print-safe CSS preserving layout and colors
- **Footer:** Copyright © 2026 GREEN BUILDING COUNCIL INDONESIA. All Rights Reserved.
- **Responsive:** Mobile / Tablet / Desktop breakpoints

---

## 7. Edge Cases & Flags

| Case | Handling |
|---|---|
| Homes-A exactly 100 m² | Show amber note: "Batas 100 m² perlu konfirmasi GBCI" |
| NB/EB/TS ≥ 150,000 m² | Add surcharge, show amber warning card |
| NH > 400 ha | Calculate base + excess surcharge, show surcharge breakdown |
| Homes-B 0-unit rows | Ignored silently in calculation |
| Homes-B cert cap applied | Show "Cap Diterapkan" info pill in breakdown |
| NH area in band boundary fraction | Clamp to next band lower limit for interpolation |
| Input below scheme minimum | Show validation error, block calculation |
