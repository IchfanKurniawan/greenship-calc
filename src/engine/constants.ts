// GREENSHIP Calculator - Pricing Constants
// All amounts are in IDR.

// NB / EB
export const NBEB_BRACKETS = [
  { minArea: 250, maxArea: 2_750, office: 130_000_000, commercial: 150_000_000 },
  { minArea: 2_750, maxArea: 10_000, office: 152_500_000, commercial: 175_000_000 },
  { minArea: 10_000, maxArea: 30_000, office: 175_000_000, commercial: 205_000_000 },
  { minArea: 30_000, maxArea: 80_000, office: 210_000_000, commercial: 245_000_000 },
  { minArea: 80_000, maxArea: 150_000, office: 245_000_000, commercial: 285_000_000 },
] as const;

export const NBEB_HIGH_AREA_THRESHOLD = 150_000;
export const NBEB_HIGH_AREA_RATE = 1_500;
export const NBEB_MIN_AREA = 250;

// IS
export const IS_BRACKETS = [
  { minArea: 25, maxArea: 250, office: 40_000_000, commercial: 45_500_000 },
  { minArea: 250, maxArea: 750, office: 47_500_000, commercial: 55_000_000 },
  { minArea: 750, maxArea: 1_500, office: 52_500_000, commercial: 62_500_000 },
  { minArea: 1_500, maxArea: 2_500, office: 67_500_000, commercial: 72_500_000 },
  { minArea: 2_500, maxArea: 10_000, office: 85_000_000, commercial: 95_000_000 },
  { minArea: 10_000, maxArea: Infinity, office: 110_000_000, commercial: 122_500_000 },
] as const;

export const IS_MIN_AREA = 25;

// TS
export const TS_BRACKETS = [
  { minArea: 250, maxArea: 2_750, fee: 150_000_000 },
  { minArea: 2_750, maxArea: 10_000, fee: 175_000_000 },
  { minArea: 10_000, maxArea: 30_000, fee: 205_000_000 },
  { minArea: 30_000, maxArea: 80_000, fee: 245_000_000 },
  { minArea: 80_000, maxArea: 150_000, fee: 285_000_000 },
] as const;

export const TS_HIGH_AREA_THRESHOLD = 150_000;
export const TS_HIGH_AREA_RATE = 1_500;
export const TS_MIN_AREA = 250;

// Homes
export const HOMES_CAP = 250_000_000;

export const HOMES_B_MULTIPLIERS = [
  { maxArea: 100, multiplier: 1.0, label: 'Kecil (<= 100 m2)' },
  { maxArea: 200, multiplier: 1.1, label: 'Menengah (101-200 m2)' },
  { maxArea: Infinity, multiplier: 1.175, label: 'Besar (> 200 m2)' },
] as const;

export const HOMES_A_SMALL_FEE = 35_000_000;
export const HOMES_A_MEDIUM_FEE = 42_000_000;
export const HOMES_A_LARGE_FEE = 50_000_000;

export const HOMES_B_BASE = [
  { maxUnits: 25, fee: 40_000_000 },
  { maxUnits: 100, fee: 45_000_000 },
  { maxUnits: Infinity, fee: 52_000_000 },
] as const;

export const HOMES_B_DISCOUNT = [1.0, 0.75, 0.75] as const;
export const HOMES_B_DISCOUNT_REST = 0.6;
export const HOMES_B_SURCHARGE_THRESHOLD = 9;
export const HOMES_B_SURCHARGE_RATE = 1_000_000;
export const HOMES_B_MAX_TYPES = 20;

// Neighborhood
export const NH_PLAN_BANDS = [
  { minArea: 10, maxArea: 200, minPrice: 73_000_000, maxPrice: 85_000_000 },
  { minArea: 201, maxArea: 400, minPrice: 85_500_000, maxPrice: 93_500_000 },
] as const;

export const NH_BUILT_BANDS = [
  { minArea: 1, maxArea: 20, minPrice: 110_000_000, maxPrice: 129_000_000 },
  { minArea: 21, maxArea: 50, minPrice: 130_000_000, maxPrice: 153_000_000 },
  { minArea: 51, maxArea: 200, minPrice: 154_000_000, maxPrice: 189_000_000 },
  { minArea: 201, maxArea: 400, minPrice: 190_000_000, maxPrice: 212_000_000 },
] as const;

export const NH_PLAN_HIGH_AREA_RATE = 200_000;
export const NH_BUILT_HIGH_AREA_RATE = 400_000;
export const NH_HIGH_AREA_THRESHOLD = 400;
export const NH_PLAN_BASE_ABOVE_400 = 93_500_000;
export const NH_BUILT_BASE_ABOVE_400 = 212_000_000;
export const NH_PLAN_MIN_AREA = 10;
export const NH_BUILT_MIN_AREA = 1;
export const SQM_TO_HA = 10_000;

// Shared total-fee cap
export const TOTAL_PRICE_CAP = 500_000_000;
