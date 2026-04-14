// ─────────────────────────────────────────────
// GREENSHIP Calculator — Calculation Engine
// Pure functions. No side effects. Fully testable.
// v1.3: Homes B weighted-average multiplier, cap 250M,
//       registration fee hidden from breakdown display,
//       500M total cap on NB/EB/TS/NH
// ─────────────────────────────────────────────

import {
  NBEB_BRACKETS, NBEB_HIGH_AREA_THRESHOLD, NBEB_HIGH_AREA_RATE,
  NBEB_MIN_AREA,
  IS_BRACKETS, IS_MIN_AREA,
  TS_BRACKETS, TS_HIGH_AREA_THRESHOLD, TS_HIGH_AREA_RATE,
  TS_MIN_AREA,
  HOMES_REG, HOMES_CAP, HOMES_B_MULTIPLIERS,
  HOMES_A_SMALL_FEE, HOMES_A_MEDIUM_FEE, HOMES_A_LARGE_FEE,
  HOMES_B_BASE, HOMES_B_DISCOUNT, HOMES_B_DISCOUNT_REST,
  HOMES_B_SURCHARGE_THRESHOLD, HOMES_B_SURCHARGE_RATE,
  NH_PLAN_BANDS, NH_BUILT_BANDS,
  NH_PLAN_HIGH_AREA_RATE, NH_BUILT_HIGH_AREA_RATE,
  NH_HIGH_AREA_THRESHOLD,
  NH_PLAN_BASE_ABOVE_400, NH_BUILT_BASE_ABOVE_400,
  NH_PLAN_MIN_AREA, NH_BUILT_MIN_AREA,
  TOTAL_PRICE_CAP,
  RING_MAX,
} from './constants';

import type {
  CalculationResult, BreakdownItem,
  NBEBInput, ISInput, TSInput, HomesAInput, HomesBInput, NHInput, HomeType,
} from './types';

// ── Helpers ───────────────────────────────────

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function validatePositiveFinite(value: number, label: string): void {
  if (!isFinite(value) || isNaN(value) || value <= 0) {
    throw new Error(`${label} harus berupa angka positif yang valid.`);
  }
}

function applyTotalCap(rawTotal: number): { cappedTotal: number; capApplied: boolean } {
  return rawTotal > TOTAL_PRICE_CAP
    ? { cappedTotal: TOTAL_PRICE_CAP, capApplied: true }
    : { cappedTotal: rawTotal, capApplied: false };
}

// ── NB / EB Calculator ────────────────────────

export function calculateNBEB(input: NBEBInput): CalculationResult {
  const { area, buildingFunction, scheme } = input;
  validatePositiveFinite(area, 'Luas area');

  if (area < NBEB_MIN_AREA) {
    throw new Error(`Luas area minimum untuk ${scheme} adalah ${NBEB_MIN_AREA.toLocaleString('id-ID')} m².`);
  }

  const breakdown: BreakdownItem[] = [];
  const warnings: string[] = [];
  let baseFee = 0;
  let surcharge = 0;

  const bracket = NBEB_BRACKETS.find(b => area >= b.minArea && area < b.maxArea);

  if (bracket) {
    baseFee = buildingFunction === 'office' ? bracket.office : bracket.commercial;
    breakdown.push({ label: `Biaya Sertifikasi (${area.toLocaleString('id-ID')} m²)`, amount: baseFee });
  } else {
    const last = NBEB_BRACKETS[NBEB_BRACKETS.length - 1];
    baseFee = buildingFunction === 'office' ? last.office : last.commercial;
    const excessArea = area - NBEB_HIGH_AREA_THRESHOLD;
    surcharge = excessArea * NBEB_HIGH_AREA_RATE;
    breakdown.push({ label: `Biaya Dasar (≥ 150.000 m²)`, amount: baseFee });
    breakdown.push({ label: `Biaya Tambahan (${excessArea.toLocaleString('id-ID')} m² × Rp 1.500)`, amount: Math.round(surcharge), isWarning: true });
    warnings.push(`Area melebihi 150.000 m²: biaya tambahan Rp 1.500/m² diterapkan.`);
  }

  const rawTotal = baseFee + surcharge;
  const { cappedTotal, capApplied } = applyTotalCap(rawTotal);

  if (capApplied) {
    breakdown.push({ label: 'Batas Maksimum Biaya Diterapkan', amount: cappedTotal, isCapped: true, isWarning: true, note: `Total asli ${formatIDR(Math.round(rawTotal))} dipangkas ke maksimum Rp 500.000.000` });
    warnings.push(`Total biaya dipangkas ke batas maksimum Rp 500.000.000.`);
  }

  breakdown.push({ label: 'Total', amount: cappedTotal, isTotal: true });

  return { scheme, schemeName: scheme === 'NB' ? 'New Building' : 'Existing Building', total: cappedTotal, breakdown, warnings, edgeCases: [], maxFeeForRing: RING_MAX[scheme] };
}

// ── IS Calculator ─────────────────────────────

export function calculateIS(input: ISInput): CalculationResult {
  const { area, buildingFunction } = input;
  validatePositiveFinite(area, 'Luas area');

  if (area < IS_MIN_AREA) throw new Error(`Luas area minimum untuk Interior Space adalah ${IS_MIN_AREA} m².`);

  const bracket = IS_BRACKETS.find(b => area >= b.minArea && area < b.maxArea);
  if (!bracket) throw new Error('Area tidak masuk dalam rentang yang valid untuk Interior Space.');

  const fee = buildingFunction === 'office' ? bracket.office : bracket.commercial;

  return {
    scheme: 'IS', schemeName: 'Interior Space', total: fee,
    breakdown: [
      { label: `Biaya Sertifikasi (${area.toLocaleString('id-ID')} m²)`, amount: fee },
      { label: 'Total', amount: fee, isTotal: true },
    ],
    warnings: [], edgeCases: [], maxFeeForRing: RING_MAX['IS'],
  };
}

// ── TS Calculator ─────────────────────────────

export function calculateTS(input: TSInput): CalculationResult {
  const { area } = input;
  validatePositiveFinite(area, 'Luas area');

  if (area < TS_MIN_AREA) throw new Error(`Luas area minimum untuk Transit Station adalah ${TS_MIN_AREA.toLocaleString('id-ID')} m².`);

  const breakdown: BreakdownItem[] = [];
  const warnings: string[] = [];
  let baseFee = 0;
  let surcharge = 0;

  const bracket = TS_BRACKETS.find(b => area >= b.minArea && area < b.maxArea);

  if (bracket) {
    baseFee = bracket.fee;
    breakdown.push({ label: `Biaya Sertifikasi (${area.toLocaleString('id-ID')} m²)`, amount: baseFee });
  } else {
    const last = TS_BRACKETS[TS_BRACKETS.length - 1];
    baseFee = last.fee;
    const excessArea = area - TS_HIGH_AREA_THRESHOLD;
    surcharge = excessArea * TS_HIGH_AREA_RATE;
    breakdown.push({ label: `Biaya Dasar (≥ 150.000 m²)`, amount: baseFee });
    breakdown.push({ label: `Biaya Tambahan (${excessArea.toLocaleString('id-ID')} m² × Rp 1.500)`, amount: Math.round(surcharge), isWarning: true });
    warnings.push(`Area melebihi 150.000 m²: biaya tambahan Rp 1.500/m² diterapkan.`);
  }

  const rawTotal = baseFee + surcharge;
  const { cappedTotal, capApplied } = applyTotalCap(rawTotal);

  if (capApplied) {
    breakdown.push({ label: 'Batas Maksimum Biaya Diterapkan', amount: cappedTotal, isCapped: true, isWarning: true, note: `Total asli ${formatIDR(Math.round(rawTotal))} dipangkas ke maksimum Rp 500.000.000` });
    warnings.push(`Total biaya dipangkas ke batas maksimum Rp 500.000.000.`);
  }

  breakdown.push({ label: 'Total', amount: cappedTotal, isTotal: true });

  return { scheme: 'TS', schemeName: 'Transit Station', total: cappedTotal, breakdown, warnings, edgeCases: [], maxFeeForRing: RING_MAX['TS'] };
}

// ── Homes A Calculator ────────────────────────

export function calculateHomesA(input: HomesAInput): CalculationResult {
  const { floorArea } = input;
  validatePositiveFinite(floorArea, 'Luas lantai');

  let certFee: number;
  let category: string;

  if (floorArea <= 100) {
    certFee = HOMES_A_SMALL_FEE; category = 'Kecil (≤ 100 m²)';
  } else if (floorArea <= 200) {
    certFee = HOMES_A_MEDIUM_FEE; category = 'Menengah (101–200 m²)';
  } else {
    certFee = HOMES_A_LARGE_FEE; category = 'Besar (> 200 m²)';
  }

  const total = certFee + HOMES_REG;

  return {
    scheme: 'HOMES_A', schemeName: 'Homes — Individual', total,
    breakdown: [
      { label: `Biaya Sertifikasi — ${category}`, amount: certFee },
      // Registration fee intentionally omitted from display (users already know)
      { label: 'Total', amount: total, isTotal: true },
    ],
    warnings: [], edgeCases: [], maxFeeForRing: RING_MAX['HOMES_A'],
  };
}

// ── Homes B Calculator ────────────────────────

function getHomesBaseFee(units: number): number {
  for (const tier of HOMES_B_BASE) {
    if (units <= tier.maxUnits) return tier.fee;
  }
  return HOMES_B_BASE[HOMES_B_BASE.length - 1].fee;
}

function getDiscountRate(activeRank: number): number {
  return activeRank < HOMES_B_DISCOUNT.length ? HOMES_B_DISCOUNT[activeRank] : HOMES_B_DISCOUNT_REST;
}

function getSurcharge(units: number): number {
  if (units <= HOMES_B_SURCHARGE_THRESHOLD) return 0;
  return Math.round(Math.sqrt(units)) * HOMES_B_SURCHARGE_RATE;
}

/**
 * Compute weighted average floor area across all active types.
 * Returns null if any active type is missing floorArea.
 */
function getWeightedAvgFloorArea(activeTypes: HomeType[]): number | null {
  const withArea = activeTypes.filter(t => t.floorArea > 0);
  if (withArea.length === 0) return null;

  // If some active types have floor area and some don't, use only those with area
  const totalUnits = withArea.reduce((s, t) => s + t.units, 0);
  const weightedSum = withArea.reduce((s, t) => s + t.units * t.floorArea, 0);
  return weightedSum / totalUnits;
}

function getMultiplier(weightedAvg: number): { multiplier: number; label: string } {
  for (const tier of HOMES_B_MULTIPLIERS) {
    if (weightedAvg <= tier.maxArea) return { multiplier: tier.multiplier, label: tier.label };
  }
  return { multiplier: HOMES_B_MULTIPLIERS[HOMES_B_MULTIPLIERS.length - 1].multiplier, label: HOMES_B_MULTIPLIERS[HOMES_B_MULTIPLIERS.length - 1].label };
}

export function calculateHomesB(input: HomesBInput): CalculationResult {
  const activeTypes: HomeType[] = input.types.filter(t => t.units > 0);

  if (activeTypes.length === 0) {
    throw new Error('Minimal satu tipe rumah harus memiliki jumlah unit > 0.');
  }

  const breakdown: BreakdownItem[] = [];
  const warnings: string[] = [];
  let subtotalCert = 0;
  let totalSurcharge = 0;

  activeTypes.forEach((type, idx) => {
    const baseFee = getHomesBaseFee(type.units);
    const discountRate = getDiscountRate(idx);
    const certFee = Math.round(baseFee * discountRate);
    const surcharge = getSurcharge(type.units);
    const typeName = type.name.trim() || `Tipe ${idx + 1}`;
    const discPct = Math.round(discountRate * 100);

    breakdown.push({
      label: `${typeName} — ${type.units} unit (Rank ${idx + 1}, Diskon ${100 - discPct}%)`,
      amount: certFee,
      note: surcharge > 0 ? `+ Surcharge Rp ${surcharge.toLocaleString('id-ID')} (ROUND(√${type.units},0)×1Jt)` : undefined,
    });

    subtotalCert += certFee;
    totalSurcharge += surcharge;
  });

  const certAfterCap = Math.min(subtotalCert, HOMES_CAP);
  const capApplied = certAfterCap < subtotalCert;

  breakdown.push({ label: 'Subtotal Biaya Sertifikasi', amount: subtotalCert, isSubtotal: true });

  if (capApplied) {
    breakdown.push({
      label: `Cap Diterapkan (maks. Rp 250.000.000)`,
      amount: certAfterCap,
      isCapped: true,
      isWarning: true,
      note: `Subtotal Rp ${subtotalCert.toLocaleString('id-ID')} dipangkas menjadi Rp 250.000.000`,
    });
    warnings.push(`Biaya sertifikasi dipangkas ke maksimum Rp 250.000.000 (subtotal asli: Rp ${subtotalCert.toLocaleString('id-ID')}).`);
  }

  breakdown.push({ label: 'Total Surcharge Audit', amount: totalSurcharge });
  // Registration fee: included in total but not displayed separately

  const baseTotal = certAfterCap + totalSurcharge + HOMES_REG;

  // ── Weighted average floor area multiplier ──
  const weightedAvg = getWeightedAvgFloorArea(activeTypes);
  let multiplier = 1.0;
  let multiplierLabel = 'Kecil (≤ 100 m²)';
  let multiplierNote = '';

  if (weightedAvg === null) {
    // No floor area entered — use multiplier 1.0 silently
    warnings.push('Luas lantai belum diisi untuk semua tipe aktif. Multiplier rata-rata tertimbang tidak diterapkan (default 1.0).');
  } else {
    const result = getMultiplier(weightedAvg);
    multiplier = result.multiplier;
    multiplierLabel = result.label;
    multiplierNote = `Rata-rata tertimbang: ${weightedAvg.toFixed(1)} m²`;

    breakdown.push({
      label: `Multiplier Luas Lantai — ${multiplierLabel}`,
      amount: null, // informational
      note: `${multiplierNote} → faktor ×${multiplier.toFixed(3)}`,
    });
  }

  const total = Math.round(baseTotal * multiplier);
  breakdown.push({ label: 'Total', amount: total, isTotal: true });

  return {
    scheme: 'HOMES_B', schemeName: 'Homes — Developer', total,
    breakdown, warnings, edgeCases: [],
    maxFeeForRing: RING_MAX['HOMES_B'],
  };
}

// ── Neighborhood Calculator ───────────────────

function nhInterpolate(area: number, band: { minArea: number; maxArea: number; minPrice: number; maxPrice: number }): number {
  const effectiveArea = Math.max(area, band.minArea);
  const ratio = (effectiveArea - band.minArea) / (band.maxArea - band.minArea);
  return band.minPrice + ratio * (band.maxPrice - band.minPrice);
}

export function calculateNH(input: NHInput): CalculationResult {
  const { area, phase } = input;
  validatePositiveFinite(area, 'Luas area');

  const isplan = phase === 'plan';
  const schemeName = isplan ? 'Neighborhood — Plan' : 'Neighborhood — Built';
  const schemeKey = isplan ? 'NH_PLAN' : 'NH_BUILT';
  const minArea = isplan ? NH_PLAN_MIN_AREA : NH_BUILT_MIN_AREA;
  const bands = isplan ? NH_PLAN_BANDS : NH_BUILT_BANDS;
  const highAreaRate = isplan ? NH_PLAN_HIGH_AREA_RATE : NH_BUILT_HIGH_AREA_RATE;
  const baseAbove400 = isplan ? NH_PLAN_BASE_ABOVE_400 : NH_BUILT_BASE_ABOVE_400;

  if (area < minArea) throw new Error(`Luas area minimum untuk ${schemeName} adalah ${minArea} ha.`);

  const breakdown: BreakdownItem[] = [];
  const warnings: string[] = [];
  let baseFee = 0;
  let surcharge = 0;

  if (area > NH_HIGH_AREA_THRESHOLD) {
    baseFee = baseAbove400;
    const excessHa = area - NH_HIGH_AREA_THRESHOLD;
    surcharge = excessHa * highAreaRate;
    breakdown.push({ label: `Biaya Dasar (batas atas 201–400 ha)`, amount: baseFee });
    breakdown.push({ label: `Biaya Tambahan (${excessHa.toFixed(3)} ha × Rp ${highAreaRate.toLocaleString('id-ID')}/ha)`, amount: Math.round(surcharge), isWarning: true });
    warnings.push(`Area melebihi 400 ha: biaya tambahan Rp ${highAreaRate.toLocaleString('id-ID')}/ha pada kelebihan diterapkan.`);
  } else {
    const band = [...bands].find(b => area >= b.minArea && area <= b.maxArea)
      ?? [...bands].find(b => area > b.minArea - 1 && area <= b.maxArea);
    if (!band) throw new Error(`Area ${area} ha tidak masuk dalam rentang yang valid untuk ${schemeName}.`);

    const interpolated = Math.round(nhInterpolate(area, band));
    breakdown.push({
      label: `Biaya Sertifikasi — interpolasi (${area.toFixed(3)} ha)`,
      amount: interpolated,
      note: `Rentang band: ${band.minArea}–${band.maxArea} ha → Rp ${(band.minPrice / 1_000_000).toFixed(1)}M – Rp ${(band.maxPrice / 1_000_000).toFixed(1)}M`,
    });
    baseFee = interpolated;
  }

  const rawTotal = baseFee + surcharge;
  const { cappedTotal, capApplied } = applyTotalCap(rawTotal);

  if (capApplied) {
    breakdown.push({ label: 'Batas Maksimum Biaya Diterapkan', amount: cappedTotal, isCapped: true, isWarning: true, note: `Total asli ${formatIDR(Math.round(rawTotal))} dipangkas ke maksimum Rp 500.000.000` });
    warnings.push(`Total biaya dipangkas ke batas maksimum Rp 500.000.000.`);
  }

  breakdown.push({ label: 'Total', amount: cappedTotal, isTotal: true });

  return { scheme: schemeKey as 'NH_PLAN' | 'NH_BUILT', schemeName, total: cappedTotal, breakdown, warnings, edgeCases: [], maxFeeForRing: RING_MAX[schemeKey] };
}

// ── Router ────────────────────────────────────

export type AnyInput =
  | { type: 'NBEB'; data: NBEBInput }
  | { type: 'IS';   data: ISInput }
  | { type: 'TS';   data: TSInput }
  | { type: 'HOMES_A'; data: HomesAInput }
  | { type: 'HOMES_B'; data: HomesBInput }
  | { type: 'NH';   data: NHInput };

export function calculate(input: AnyInput): CalculationResult {
  switch (input.type) {
    case 'NBEB':    return calculateNBEB(input.data);
    case 'IS':      return calculateIS(input.data);
    case 'TS':      return calculateTS(input.data);
    case 'HOMES_A': return calculateHomesA(input.data);
    case 'HOMES_B': return calculateHomesB(input.data);
    case 'NH':      return calculateNH(input.data);
  }
}

export { formatIDR };
