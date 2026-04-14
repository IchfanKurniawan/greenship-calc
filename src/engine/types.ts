// ─────────────────────────────────────────────
// GREENSHIP Calculator — Engine Types
// Pure TypeScript, no React dependencies
// ─────────────────────────────────────────────

export type Scheme =
  | 'NB'
  | 'EB'
  | 'IS'
  | 'TS'
  | 'HOMES_A'
  | 'HOMES_B'
  | 'NH_PLAN'
  | 'NH_BUILT';

export type BuildingFunction = 'office' | 'commercial';
export type NHUnit = 'sqm' | 'ha';

export interface HomeType {
  id: string;
  name: string;
  units: number;     // integer ≥ 0
  floorArea: number; // m² per unit — used for weighted average multiplier
}

export interface BreakdownItem {
  label: string;
  amount: number | null; // null = informational row
  note?: string;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isWarning?: boolean;
  isCapped?: boolean;
}

export interface CalculationResult {
  scheme: Scheme;
  schemeName: string;
  total: number;
  breakdown: BreakdownItem[];
  warnings: string[];
  edgeCases: string[];
  maxFeeForRing: number; // visual reference max for the progress ring
}

// Input shapes per scheme
export interface NBEBInput {
  area: number; // m²
  buildingFunction: BuildingFunction;
  scheme: 'NB' | 'EB';
}

export interface ISInput {
  area: number; // m²
  buildingFunction: BuildingFunction;
}

export interface TSInput {
  area: number; // m²
}

export interface HomesAInput {
  floorArea: number; // m²
}

export interface HomesBInput {
  types: HomeType[];
}

export interface NHInput {
  area: number; // always in ha internally; UI handles conversion
  phase: 'plan' | 'built';
}
