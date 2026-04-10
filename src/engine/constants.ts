// ─────────────────────────────────────────────
// GREENSHIP Calculator — Pricing Constants
// All amounts in IDR (Indonesian Rupiah)
// Source: GBCI official fee schedules
// ─────────────────────────────────────────────

// ── NB / EB ───────────────────────────────────
export const NBEB_BRACKETS = [
  { minArea: 250,    maxArea: 2_750,   office: 130_000_000, commercial: 150_000_000 },
  { minArea: 2_750,  maxArea: 10_000,  office: 152_500_000, commercial: 175_000_000 },
  { minArea: 10_000, maxArea: 30_000,  office: 175_000_000, commercial: 205_000_000 },
  { minArea: 30_000, maxArea: 80_000,  office: 210_000_000, commercial: 245_000_000 },
  { minArea: 80_000, maxArea: 150_000, office: 245_000_000, commercial: 285_000_000 },
] as const;

export const NBEB_HIGH_AREA_THRESHOLD = 150_000;   // m²
export const NBEB_HIGH_AREA_RATE      = 1_500;     // IDR per m² of excess
export const NBEB_HIGH_AREA_MAX_EXTRA = 500_000_000; // IDR cap on extra charge
export const NBEB_MIN_AREA            = 250;        // m²

// ── IS ────────────────────────────────────────
export const IS_BRACKETS = [
  { minArea: 25,     maxArea: 250,    office: 40_000_000,  commercial: 45_500_000  },
  { minArea: 250,    maxArea: 750,    office: 47_500_000,  commercial: 55_000_000  },
  { minArea: 750,    maxArea: 1_500,  office: 52_500_000,  commercial: 62_500_000  },
  { minArea: 1_500,  maxArea: 2_500,  office: 67_500_000,  commercial: 72_500_000  },
  { minArea: 2_500,  maxArea: 10_000, office: 85_000_000,  commercial: 95_000_000  },
  { minArea: 10_000, maxArea: Infinity, office: 110_000_000, commercial: 122_500_000 },
] as const;

export const IS_MIN_AREA = 25; // m²

// ── TS ────────────────────────────────────────
export const TS_BRACKETS = [
  { minArea: 250,    maxArea: 2_750,   fee: 150_000_000 },
  { minArea: 2_750,  maxArea: 10_000,  fee: 175_000_000 },
  { minArea: 10_000, maxArea: 30_000,  fee: 205_000_000 },
  { minArea: 30_000, maxArea: 80_000,  fee: 245_000_000 },
  { minArea: 80_000, maxArea: 150_000, fee: 285_000_000 },
] as const;

export const TS_HIGH_AREA_THRESHOLD = 150_000;
export const TS_HIGH_AREA_RATE      = 1_500;
export const TS_HIGH_AREA_MAX_EXTRA = 500_000_000;
export const TS_MIN_AREA            = 250;

// ── Homes ─────────────────────────────────────
export const HOMES_REG = 5_000_000;   // IDR — flat for both tracks
export const HOMES_CAP = 200_000_000; // IDR — cert subtotal cap (Track B only)

// Track A lookup
export const HOMES_A_SMALL_FEE  = 35_000_000; // floor_area < 100
export const HOMES_A_MEDIUM_FEE = 42_000_000; // 101 ≤ floor_area ≤ 200
export const HOMES_A_LARGE_FEE  = 50_000_000; // floor_area > 200
// Note: exactly 100 m² is undefined in source — flag as edge case

// Track B base fees
export const HOMES_B_BASE = [
  { maxUnits: 25,       fee: 40_000_000 },
  { maxUnits: 100,      fee: 45_000_000 },
  { maxUnits: Infinity, fee: 52_000_000 },
] as const;

// Track B discount rates by active rank (0-indexed)
// Index 0 = 1st active type (100%), 1 = 2nd (75%), 2 = 3rd (75%), 3+ = 4th+ (60%)
export const HOMES_B_DISCOUNT = [1.00, 0.75, 0.75] as const;
export const HOMES_B_DISCOUNT_REST = 0.60;

export const HOMES_B_SURCHARGE_THRESHOLD = 9;         // units — surcharge applies when > 9
export const HOMES_B_SURCHARGE_RATE      = 1_000_000; // IDR per ROUND(√n, 0)
export const HOMES_B_MAX_TYPES           = 20;

// ── Neighborhood ──────────────────────────────
// Plan phase bands (area in ha)
export const NH_PLAN_BANDS = [
  { minArea: 10,  maxArea: 200, minPrice: 73_000_000,  maxPrice: 85_000_000  },
  { minArea: 201, maxArea: 400, minPrice: 85_500_000,  maxPrice: 93_500_000  },
] as const;

// Built phase bands (area in ha)
export const NH_BUILT_BANDS = [
  { minArea: 1,   maxArea: 20,  minPrice: 110_000_000, maxPrice: 129_000_000 },
  { minArea: 21,  maxArea: 50,  minPrice: 130_000_000, maxPrice: 153_000_000 },
  { minArea: 51,  maxArea: 200, minPrice: 154_000_000, maxPrice: 189_000_000 },
  { minArea: 201, maxArea: 400, minPrice: 190_000_000, maxPrice: 212_000_000 },
] as const;

// >400 ha surcharge — applies to EXCESS area above 400 ha (CLARIFIED v1.1)
export const NH_PLAN_HIGH_AREA_RATE    = 200_000;     // IDR per ha above 400
export const NH_BUILT_HIGH_AREA_RATE   = 400_000;     // IDR per ha above 400
export const NH_HIGH_AREA_MAX_EXTRA    = 500_000_000; // IDR cap
export const NH_HIGH_AREA_THRESHOLD    = 400;         // ha

// Base fees at the top of the 201-400 band (used when area > 400)
export const NH_PLAN_BASE_ABOVE_400  = 93_500_000;  // maxPrice of last Plan band
export const NH_BUILT_BASE_ABOVE_400 = 212_000_000; // maxPrice of last Built band

export const NH_PLAN_MIN_AREA  = 10; // ha
export const NH_BUILT_MIN_AREA = 1;  // ha
export const SQM_TO_HA         = 10_000; // 1 ha = 10,000 m²

// ── Global total-fee cap for NB, EB, TS, NH (v1.2) ───
export const TOTAL_PRICE_CAP = 500_000_000; // IDR

// ── Display max values for progress ring ──────
export const RING_MAX: Record<string, number> = {
  NB:      500_000_000,
  EB:      500_000_000,
  IS:      122_500_000,
  TS:      500_000_000,
  HOMES_A:  55_000_000,
  HOMES_B: 705_000_000,
  NH_PLAN: 500_000_000,
  NH_BUILT:500_000_000,
};

// ── Scheme metadata ───────────────────────────
export const SCHEME_META = {
  NB:      { label: 'New Building',        code: 'NB', color: '#1B4E4D' },
  EB:      { label: 'Existing Building',   code: 'EB', color: '#1B4E4D' },
  IS:      { label: 'Interior Space',      code: 'IS', color: '#1B4E4D' },
  TS:      { label: 'Transit Station',     code: 'TS', color: '#1B4E4D' },
  HOMES_A: { label: 'Homes — Individual',  code: 'HA', color: '#1B4E4D' },
  HOMES_B: { label: 'Homes — Developer',   code: 'HB', color: '#1B4E4D' },
  NH_PLAN: { label: 'Neighborhood — Plan', code: 'NP', color: '#1B4E4D' },
  NH_BUILT:{ label: 'Neighborhood — Built',code: 'NB', color: '#1B4E4D' },
} as const;
