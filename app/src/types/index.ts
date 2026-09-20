// ==========================================
// Types communs pour ChimLab
// ==========================================

export interface CalculationInput {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface CalculationResult {
  id: string;
  label: string;
  value: number;
  unit: string;
  formatted?: string;
}

export interface Interpretation {
  status: 'success' | 'warning' | 'error' | 'info';
  badge: string;
  message: string;
  detail?: string;
}

export interface HistoryEntry {
  id: string;
  module: string;
  submodule: string;
  timestamp: number;
  inputs: Record<string, number>;
  results: Record<string, number>;
  interpretation?: Interpretation;
}

// ==========================================
// Chromatographie
// ==========================================

export interface HPLCResolutionInput {
  tR1: number;
  tR2: number;
  w1: number;
  w2: number;
  w05_1?: number;
  w05_2?: number;
}

export interface HPLCResolutionResult {
  Rs: number;
  Rs_mid?: number;
  interpretation: Interpretation;
}

export interface HPLCPlateInput {
  tR: number;
  w?: number;
  w05?: number;
  L?: number;
}

export interface HPLCPlateResult {
  N: number;
  HETP?: number;
  interpretation: Interpretation;
}

export interface HPLCCapacityInput {
  tR: number;
  t0: number;
}

export interface HPLCCapacityResult {
  k: number;
  interpretation: Interpretation;
}

export interface HPLCSelectivityInput {
  k1: number;
  k2: number;
}

export interface HPLCSelectivityResult {
  alpha: number;
  interpretation: Interpretation;
}

export interface HPLCAsymmetryInput {
  f: number;
  t: number;
}

export interface HPLCAsymmetryResult {
  As: number;
  T: number;
  interpretation: Interpretation;
}

export interface GCResolutionInput {
  tR1: number;
  tR2: number;
  w1: number;
  w2: number;
  temperature?: number;
  columnType?: string;
}

export interface GCResolutionResult {
  Rs: number;
  interpretation: Interpretation;
}

export interface GCKovatsInput {
  tR_analyte: number;
  tR_n: number;
  tR_n1: number;
  n: number;
}

export interface GCKovatsResult {
  I: number;
  interpretation: Interpretation;
}

export interface TLCInput {
  d_analyte: number;
  d_front: number;
  d_start?: number;
}

export interface TLCResult {
  Rf: number;
  interpretation: Interpretation;
}

export interface ColumnParamsInput {
  diameter: number;
  length: number;
  particleSize?: number;
  flowRate: number;
}

export interface ColumnParamsResult {
  V0: number;
  u: number;
  interpretation: Interpretation;
}

// ==========================================
// Spectrométrie
// ==========================================

export type BeerLambertMode = 'concentration' | 'absorbance' | 'epsilon';

export interface BeerLambertInput {
  mode: BeerLambertMode;
  A?: number;
  epsilon?: number;
  l: number;
  C?: number;
}

export interface BeerLambertResult {
  value: number;
  label: string;
  unit: string;
  interpretation: Interpretation;
  formula: string;
}

export interface CalibrationPoint {
  concentration: number;
  absorbance: number;
}

export interface CalibrationResult {
  slope: number;
  intercept: number;
  r2: number;
  equation: string;
  lod?: number;
  loq?: number;
}

export interface IRFunctionalGroup {
  group: string;
  vibration: string;
  rangeMin: number;
  rangeMax: number;
  intensity: string;
}

export interface MSInput {
  molecularMass: number;
  fragmentMass: number;
  charge?: number;
}

export interface MSResult {
  massLost: number;
  commonLoss?: string;
  interpretation: Interpretation;
}

export interface NMRInput {
  delta: number;
  multiplicity: string;
  integration?: number;
}

export interface NMRResult {
  assignments: string[];
  interpretation: Interpretation;
}

// ==========================================
// Calculs analytiques
// ==========================================

export type TitrationType = 'acidbase' | 'redox' | 'complexo' | 'precipitation';

export interface TitrationInput {
  type: TitrationType;
  C_titrant: number;
  V_titrant: number;
  V_ech: number;
  n: number;
}

export interface TitrationResult {
  C_ech: number;
  interpretation: Interpretation;
  details?: string;
}

export interface ColorimetryInput {
  method: 'direct' | 'additions';
  calibrationPoints: CalibrationPoint[];
  unknownAbsorbance?: number;
  blankStdDev?: number;
}

export interface ColorimetryResult {
  calibration: CalibrationResult;
  concentration?: number;
  lod?: number;
  loq?: number;
  interpretation: Interpretation;
}

export interface DilutionInput {
  C1?: number;
  V1?: number;
  C2?: number;
  V2?: number;
}

export interface SolutionPrepInput {
  concentration: number;
  volume: number;
  molarMass: number;
}

export interface GravimetryInput {
  massPrecipitate: number;
  massSample: number;
  gravimetricFactor: number;
}

export interface GravimetryResult {
  percentage: number;
  interpretation: Interpretation;
}

// ==========================================
// Outils
// ==========================================

export type UnitCategory = 'concentration' | 'mass' | 'volume' | 'pressure' | 'temperature' | 'wavelength';

export interface StatisticsInput {
  values: number[];
}

export interface StatisticsResult {
  n: number;
  mean: number;
  stdDev: number;
  rsd: number;
  min: number;
  max: number;
  median: number;
  ci95: number;
  interpretation: Interpretation;
}

export interface CascadeStep {
  step: number;
  C_input?: number;
  dilutionFactor?: number;
  C_output?: number;
  V_taken?: number;
  V_final?: number;
}

export interface ReactionCompound {
  coefficient: number;
  formula: string;
  molarMass: number;
  initialAmount: number;
}

export interface ReactionResult {
  limitingReagent: string;
  theoreticalProducts: Record<string, number>;
  yield?: number;
  interpretation: Interpretation;
}
