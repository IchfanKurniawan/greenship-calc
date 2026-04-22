// GREENSHIP Calculator - Calculation Engine
// Pure functions with no React or DOM dependencies.

import {
  NBEB_BRACKETS,
  NBEB_HIGH_AREA_THRESHOLD,
  NBEB_HIGH_AREA_RATE,
  NBEB_MIN_AREA,
  IS_BRACKETS,
  IS_MIN_AREA,
  TS_BRACKETS,
  TS_HIGH_AREA_THRESHOLD,
  TS_HIGH_AREA_RATE,
  TS_MIN_AREA,
  HOMES_CAP,
  HOMES_B_MULTIPLIERS,
  HOMES_A_SMALL_FEE,
  HOMES_A_MEDIUM_FEE,
  HOMES_A_LARGE_FEE,
  HOMES_B_BASE,
  HOMES_B_DISCOUNT,
  HOMES_B_DISCOUNT_REST,
  HOMES_B_SURCHARGE_THRESHOLD,
  HOMES_B_SURCHARGE_RATE,
  NH_PLAN_BANDS,
  NH_BUILT_BANDS,
  NH_PLAN_HIGH_AREA_RATE,
  NH_BUILT_HIGH_AREA_RATE,
  NH_HIGH_AREA_THRESHOLD,
  NH_PLAN_BASE_ABOVE_400,
  NH_BUILT_BASE_ABOVE_400,
  NH_PLAN_MIN_AREA,
  NH_BUILT_MIN_AREA,
  TOTAL_PRICE_CAP,
} from './constants';

import type {
  BreakdownItem,
  CalculationResult,
  HomeType,
  HomesAInput,
  HomesBInput,
  ISInput,
  NBEBInput,
  NHInput,
  TSInput,
} from './types';

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function validatePositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || Number.isNaN(value) || value <= 0) {
    throw new Error(`${label} harus berupa angka positif yang valid.`);
  }
}

function applyTotalCap(rawTotal: number): { cappedTotal: number; capApplied: boolean } {
  return rawTotal > TOTAL_PRICE_CAP
    ? { cappedTotal: TOTAL_PRICE_CAP, capApplied: true }
    : { cappedTotal: rawTotal, capApplied: false };
}

function shouldShowSurchargeLine(total: number, surcharge: number): boolean {
  return surcharge > 0 && total < TOTAL_PRICE_CAP;
}

export function calculateNBEB(input: NBEBInput): CalculationResult {
  const { area, buildingFunction, scheme } = input;
  validatePositiveFinite(area, 'Luas area');

  if (area < NBEB_MIN_AREA) {
    throw new Error(`Luas area minimum untuk ${scheme} adalah ${NBEB_MIN_AREA.toLocaleString('id-ID')} m2.`);
  }

  const breakdown: BreakdownItem[] = [];
  const warnings: string[] = [];
  let baseFee = 0;
  let surcharge = 0;

  const bracket = NBEB_BRACKETS.find(entry => area >= entry.minArea && area < entry.maxArea);

  if (bracket) {
    baseFee = buildingFunction === 'office' ? bracket.office : bracket.commercial;
  } else {
    const lastBracket = NBEB_BRACKETS[NBEB_BRACKETS.length - 1];
    baseFee = buildingFunction === 'office' ? lastBracket.office : lastBracket.commercial;
    surcharge = (area - NBEB_HIGH_AREA_THRESHOLD) * NBEB_HIGH_AREA_RATE;
    warnings.push('Area melebihi 150.000 m2: biaya tambahan Rp 1.500/m2 diterapkan.');
  }

  const rawTotal = baseFee + surcharge;
  const { cappedTotal, capApplied } = applyTotalCap(rawTotal);

  if (bracket) {
    breakdown.push({ label: `Biaya Sertifikasi (${area.toLocaleString('id-ID')} m2)`, amount: baseFee });
  } else {
    const excessArea = area - NBEB_HIGH_AREA_THRESHOLD;
    breakdown.push({ label: 'Biaya Dasar (>= 150.000 m2)', amount: baseFee });
    if (shouldShowSurchargeLine(cappedTotal, surcharge)) {
      breakdown.push({
        label: `Biaya Tambahan (${excessArea.toLocaleString('id-ID')} m2 x Rp 1.500)`,
        amount: Math.round(surcharge),
        isWarning: true,
      });
    }
  }

  if (capApplied) {
    breakdown.push({
      label: 'Batas Maksimum Biaya Diterapkan',
      amount: cappedTotal,
      isCapped: true,
      isWarning: true,
      note: `Total asli ${formatIDR(Math.round(rawTotal))} dipangkas ke maksimum Rp 500.000.000`,
    });
    warnings.push('Total biaya dipangkas ke batas maksimum Rp 500.000.000.');
  }

  breakdown.push({ label: 'Total', amount: cappedTotal, isTotal: true });

  return {
    scheme,
    schemeName: scheme === 'NB' ? 'New Building' : 'Existing Building',
    total: cappedTotal,
    breakdown,
    warnings,
    edgeCases: [],
  };
}

export function calculateIS(input: ISInput): CalculationResult {
  const { area, buildingFunction } = input;
  validatePositiveFinite(area, 'Luas area');

  if (area < IS_MIN_AREA) {
    throw new Error(`Luas area minimum untuk Interior Space adalah ${IS_MIN_AREA} m2.`);
  }

  const bracket = IS_BRACKETS.find(entry => area >= entry.minArea && area < entry.maxArea);

  if (!bracket) {
    throw new Error('Area tidak masuk dalam rentang yang valid untuk Interior Space.');
  }

  const fee = buildingFunction === 'office' ? bracket.office : bracket.commercial;

  return {
    scheme: 'IS',
    schemeName: 'Interior Space',
    total: fee,
    breakdown: [
      { label: `Biaya Sertifikasi (${area.toLocaleString('id-ID')} m2)`, amount: fee },
      { label: 'Total', amount: fee, isTotal: true },
    ],
    warnings: [],
    edgeCases: [],
  };
}

export function calculateTS(input: TSInput): CalculationResult {
  const { area } = input;
  validatePositiveFinite(area, 'Luas area');

  if (area < TS_MIN_AREA) {
    throw new Error(`Luas area minimum untuk Transit Station adalah ${TS_MIN_AREA.toLocaleString('id-ID')} m2.`);
  }

  const breakdown: BreakdownItem[] = [];
  const warnings: string[] = [];
  let baseFee = 0;
  let surcharge = 0;

  const bracket = TS_BRACKETS.find(entry => area >= entry.minArea && area < entry.maxArea);

  if (bracket) {
    baseFee = bracket.fee;
  } else {
    const lastBracket = TS_BRACKETS[TS_BRACKETS.length - 1];
    baseFee = lastBracket.fee;
    surcharge = (area - TS_HIGH_AREA_THRESHOLD) * TS_HIGH_AREA_RATE;
    warnings.push('Area melebihi 150.000 m2: biaya tambahan Rp 1.500/m2 diterapkan.');
  }

  const rawTotal = baseFee + surcharge;
  const { cappedTotal, capApplied } = applyTotalCap(rawTotal);

  if (bracket) {
    breakdown.push({ label: `Biaya Sertifikasi (${area.toLocaleString('id-ID')} m2)`, amount: baseFee });
  } else {
    const excessArea = area - TS_HIGH_AREA_THRESHOLD;
    breakdown.push({ label: 'Biaya Dasar (>= 150.000 m2)', amount: baseFee });
    if (shouldShowSurchargeLine(cappedTotal, surcharge)) {
      breakdown.push({
        label: `Biaya Tambahan (${excessArea.toLocaleString('id-ID')} m2 x Rp 1.500)`,
        amount: Math.round(surcharge),
        isWarning: true,
      });
    }
  }

  if (capApplied) {
    breakdown.push({
      label: 'Batas Maksimum Biaya Diterapkan',
      amount: cappedTotal,
      isCapped: true,
      isWarning: true,
      note: `Total asli ${formatIDR(Math.round(rawTotal))} dipangkas ke maksimum Rp 500.000.000`,
    });
    warnings.push('Total biaya dipangkas ke batas maksimum Rp 500.000.000.');
  }

  breakdown.push({ label: 'Total', amount: cappedTotal, isTotal: true });

  return {
    scheme: 'TS',
    schemeName: 'Transit Station',
    total: cappedTotal,
    breakdown,
    warnings,
    edgeCases: [],
  };
}

export function calculateHomesA(input: HomesAInput): CalculationResult {
  const { floorArea } = input;
  validatePositiveFinite(floorArea, 'Luas lantai');

  let certFee = HOMES_A_SMALL_FEE;
  let category = 'Kecil (<= 100 m2)';

  if (floorArea > 200) {
    certFee = HOMES_A_LARGE_FEE;
    category = 'Besar (> 200 m2)';
  } else if (floorArea > 100) {
    certFee = HOMES_A_MEDIUM_FEE;
    category = 'Menengah (101-200 m2)';
  }

  const total = certFee;

  return {
    scheme: 'HOMES_A',
    schemeName: 'Homes - Individual',
    total,
    breakdown: [
      { label: `Biaya Sertifikasi - ${category}`, amount: certFee },
      { label: 'Total', amount: total, isTotal: true },
    ],
    warnings: [],
    edgeCases: [],
  };
}

function getHomesBaseFee(units: number): number {
  for (const tier of HOMES_B_BASE) {
    if (units <= tier.maxUnits) {
      return tier.fee;
    }
  }

  return HOMES_B_BASE[HOMES_B_BASE.length - 1].fee;
}

function getDiscountRate(activeRank: number): number {
  return activeRank < HOMES_B_DISCOUNT.length
    ? HOMES_B_DISCOUNT[activeRank]
    : HOMES_B_DISCOUNT_REST;
}

function getSurcharge(units: number): number {
  if (units <= HOMES_B_SURCHARGE_THRESHOLD) {
    return 0;
  }

  return Math.round(Math.sqrt(units)) * HOMES_B_SURCHARGE_RATE;
}

function getWeightedAvgFloorArea(activeTypes: HomeType[]): number {
  const totalUnits = activeTypes.reduce((sum, type) => sum + type.units, 0);
  const weightedSum = activeTypes.reduce((sum, type) => sum + type.units * type.floorArea, 0);
  return weightedSum / totalUnits;
}

function getMultiplier(weightedAvg: number): { multiplier: number; label: string } {
  for (const tier of HOMES_B_MULTIPLIERS) {
    if (weightedAvg <= tier.maxArea) {
      return { multiplier: tier.multiplier, label: tier.label };
    }
  }

  return HOMES_B_MULTIPLIERS[HOMES_B_MULTIPLIERS.length - 1];
}

export function calculateHomesB(input: HomesBInput): CalculationResult {
  const activeTypes = input.types.filter(type => type.units > 0);

  if (activeTypes.length === 0) {
    throw new Error('Minimal satu tipe rumah harus memiliki jumlah unit > 0.');
  }

  if (activeTypes.some(type => !Number.isFinite(type.floorArea) || type.floorArea <= 0)) {
    throw new Error('Luas lantai wajib diisi untuk setiap tipe aktif sebelum kalkulasi dapat dilakukan.');
  }

  const breakdown: BreakdownItem[] = [];
  const warnings: string[] = [];
  let subtotalCert = 0;
  let totalSurcharge = 0;

  activeTypes.forEach((type, index) => {
    const baseFee = getHomesBaseFee(type.units);
    const discountRate = getDiscountRate(index);
    const certFee = Math.round(baseFee * discountRate);
    const surcharge = getSurcharge(type.units);
    const typeName = type.name.trim() || `Tipe ${index + 1}`;
    const discountPercent = Math.round((1 - discountRate) * 100);

    breakdown.push({
      label: `${typeName} - ${type.units} unit (Rank ${index + 1}, Diskon ${discountPercent}%)`,
      amount: certFee,
      note: surcharge > 0
        ? `+ Surcharge Rp ${surcharge.toLocaleString('id-ID')} (ROUND(sqrt(${type.units}), 0) x 1Jt)`
        : undefined,
    });

    subtotalCert += certFee;
    totalSurcharge += surcharge;
  });

  const certAfterCap = Math.min(subtotalCert, HOMES_CAP);
  const capApplied = certAfterCap < subtotalCert;

  breakdown.push({ label: 'Subtotal Biaya Sertifikasi', amount: subtotalCert, isSubtotal: true });

  if (capApplied) {
    breakdown.push({
      label: 'Cap Diterapkan (maks. Rp 250.000.000)',
      amount: certAfterCap,
      isCapped: true,
      isWarning: true,
      note: `Subtotal Rp ${subtotalCert.toLocaleString('id-ID')} dipangkas menjadi Rp 250.000.000`,
    });
    warnings.push(`Biaya sertifikasi dipangkas ke maksimum Rp 250.000.000 (subtotal asli: Rp ${subtotalCert.toLocaleString('id-ID')}).`);
  }

  breakdown.push({ label: 'Total Surcharge', amount: totalSurcharge });

  const weightedAvg = getWeightedAvgFloorArea(activeTypes);
  const { multiplier, label } = getMultiplier(weightedAvg);

  breakdown.push({
    label: `Multiplier Luas Lantai - ${label}`,
    amount: null,
    note: `Rata-rata tertimbang: ${weightedAvg.toFixed(1)} m2 -> faktor x${multiplier.toFixed(3)}`,
  });

  const total = Math.round((certAfterCap + totalSurcharge) * multiplier);
  breakdown.push({ label: 'Total', amount: total, isTotal: true });

  return {
    scheme: 'HOMES_B',
    schemeName: 'Homes - Developer',
    total,
    breakdown,
    warnings,
    edgeCases: [],
  };
}

function nhInterpolate(
  area: number,
  band: { minArea: number; maxArea: number; minPrice: number; maxPrice: number },
): number {
  const effectiveArea = Math.max(area, band.minArea);
  const ratio = (effectiveArea - band.minArea) / (band.maxArea - band.minArea);
  return band.minPrice + ratio * (band.maxPrice - band.minPrice);
}

export function calculateNH(input: NHInput): CalculationResult {
  const { area, phase } = input;
  validatePositiveFinite(area, 'Luas area');

  const isPlan = phase === 'plan';
  const schemeName = isPlan ? 'Neighborhood - Plan' : 'Neighborhood - Built';
  const schemeKey = isPlan ? 'NH_PLAN' : 'NH_BUILT';
  const minArea = isPlan ? NH_PLAN_MIN_AREA : NH_BUILT_MIN_AREA;
  const bands = isPlan ? NH_PLAN_BANDS : NH_BUILT_BANDS;
  const highAreaRate = isPlan ? NH_PLAN_HIGH_AREA_RATE : NH_BUILT_HIGH_AREA_RATE;
  const baseAbove400 = isPlan ? NH_PLAN_BASE_ABOVE_400 : NH_BUILT_BASE_ABOVE_400;

  if (area < minArea) {
    throw new Error(`Luas area minimum untuk ${schemeName} adalah ${minArea} ha.`);
  }

  const breakdown: BreakdownItem[] = [];
  const warnings: string[] = [];
  let baseFee = 0;
  let surcharge = 0;

  if (area > NH_HIGH_AREA_THRESHOLD) {
    baseFee = baseAbove400;
    surcharge = (area - NH_HIGH_AREA_THRESHOLD) * highAreaRate;
    warnings.push(`Area melebihi 400 ha: biaya tambahan Rp ${highAreaRate.toLocaleString('id-ID')}/ha pada kelebihan diterapkan.`);
  } else {
    const band = bands.find(entry => area >= entry.minArea && area <= entry.maxArea)
      ?? bands.find(entry => area > entry.minArea - 1 && area <= entry.maxArea);

    if (!band) {
      throw new Error(`Area ${area} ha tidak masuk dalam rentang yang valid untuk ${schemeName}.`);
    }

    baseFee = Math.round(nhInterpolate(area, band));
    breakdown.push({
      label: `Biaya Sertifikasi - interpolasi (${area.toFixed(3)} ha)`,
      amount: baseFee,
      note: `Rentang band: ${band.minArea}-${band.maxArea} ha -> Rp ${(band.minPrice / 1_000_000).toFixed(1)}M - Rp ${(band.maxPrice / 1_000_000).toFixed(1)}M`,
    });
  }

  const rawTotal = baseFee + surcharge;
  const { cappedTotal, capApplied } = applyTotalCap(rawTotal);

  if (area > NH_HIGH_AREA_THRESHOLD) {
    const excessHa = area - NH_HIGH_AREA_THRESHOLD;
    breakdown.push({ label: 'Biaya Dasar (batas atas 201-400 ha)', amount: baseFee });
    if (shouldShowSurchargeLine(cappedTotal, surcharge)) {
      breakdown.push({
        label: `Biaya Tambahan (${excessHa.toFixed(3)} ha x Rp ${highAreaRate.toLocaleString('id-ID')}/ha)`,
        amount: Math.round(surcharge),
        isWarning: true,
      });
    }
  }

  if (capApplied) {
    breakdown.push({
      label: 'Batas Maksimum Biaya Diterapkan',
      amount: cappedTotal,
      isCapped: true,
      isWarning: true,
      note: `Total asli ${formatIDR(Math.round(rawTotal))} dipangkas ke maksimum Rp 500.000.000`,
    });
    warnings.push('Total biaya dipangkas ke batas maksimum Rp 500.000.000.');
  }

  breakdown.push({ label: 'Total', amount: cappedTotal, isTotal: true });

  return {
    scheme: schemeKey,
    schemeName,
    total: cappedTotal,
    breakdown,
    warnings,
    edgeCases: [],
  };
}

export type AnyInput =
  | { type: 'NBEB'; data: NBEBInput }
  | { type: 'IS'; data: ISInput }
  | { type: 'TS'; data: TSInput }
  | { type: 'HOMES_A'; data: HomesAInput }
  | { type: 'HOMES_B'; data: HomesBInput }
  | { type: 'NH'; data: NHInput };

export function calculate(input: AnyInput): CalculationResult {
  switch (input.type) {
    case 'NBEB':
      return calculateNBEB(input.data);
    case 'IS':
      return calculateIS(input.data);
    case 'TS':
      return calculateTS(input.data);
    case 'HOMES_A':
      return calculateHomesA(input.data);
    case 'HOMES_B':
      return calculateHomesB(input.data);
    case 'NH':
      return calculateNH(input.data);
  }
}

export { formatIDR };
