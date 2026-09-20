import type {
  HPLCResolutionInput, HPLCResolutionResult,
  HPLCPlateInput, HPLCPlateResult,
  HPLCCapacityInput, HPLCCapacityResult,
  HPLCSelectivityInput, HPLCSelectivityResult,
  HPLCAsymmetryInput, HPLCAsymmetryResult,
  GCResolutionInput, GCResolutionResult,
  GCKovatsInput, GCKovatsResult,
  TLCInput, TLCResult,
  ColumnParamsInput, ColumnParamsResult,
  BeerLambertInput, BeerLambertResult,
  CalibrationPoint, CalibrationResult,
  IRFunctionalGroup,
  MSInput, MSResult,
  NMRInput, NMRResult,
  TitrationInput, TitrationResult,
  DilutionInput,
  SolutionPrepInput,
  GravimetryInput, GravimetryResult,
  StatisticsInput, StatisticsResult,
  CascadeStep,
  ReactionCompound,
  ReactionResult,
  ColorimetryInput, ColorimetryResult,
  Interpretation,
} from '@/types';

// ==========================================
// Utilitaires
// ==========================================

export function roundToSigFigs(value: number, sigFigs: number = 4): number {
  if (value === 0) return 0;
  const d = Math.ceil(Math.log10(Math.abs(value)));
  const power = sigFigs - d;
  const mul = Math.pow(10, power);
  return Math.round(value * mul) / mul;
}

export function formatValue(value: number, decimals: number = 4): string {
  if (Math.abs(value) < 0.0001 || Math.abs(value) > 10000) {
    return value.toExponential(3);
  }
  return value.toFixed(decimals);
}

function createInterpretation(status: 'success' | 'warning' | 'error' | 'info', badge: string, message: string, detail?: string): Interpretation {
  return { status, badge, message, detail };
}

// ==========================================
// CHROMATOGRAPHIE - HPLC
// ==========================================

export function calculateHPLCResolution(input: HPLCResolutionInput): HPLCResolutionResult {
  const { tR1, tR2, w1, w2, w05_1, w05_2 } = input;
  const Rs = (2 * (tR2 - tR1)) / (w1 + w2);

  let interp: Interpretation;
  if (Rs < 1.0) {
    interp = createInterpretation('error', 'Séparation insuffisante', `Rs = ${formatValue(Rs)}`, 'Les pics se chevauchent significativement. Optimisez la méthode (phase mobile, colonne, débit).');
  } else if (Rs < 1.5) {
    interp = createInterpretation('warning', 'Séparation partielle', `Rs = ${formatValue(Rs)}`, 'Séparation acceptable pour analyses quantitatives avec précision réduite.');
  } else if (Rs < 2.0) {
    interp = createInterpretation('success', 'Bonne séparation', `Rs = ${formatValue(Rs)}`, 'Séparation adéquate pour la plupart des applications analytiques.');
  } else {
    interp = createInterpretation('success', 'Excellente séparation', `Rs = ${formatValue(Rs)}`, 'Séparation optimale, pics bien résolus.');
  }

  const result: HPLCResolutionResult = { Rs: roundToSigFigs(Rs), interpretation: interp };

  if (w05_1 !== undefined && w05_2 !== undefined && w05_1 > 0 && w05_2 > 0) {
    result.Rs_mid = roundToSigFigs((1.18 * (tR2 - tR1)) / (w05_1 + w05_2));
  }

  return result;
}

export function calculateHPLCPlates(input: HPLCPlateInput): HPLCPlateResult {
  const { tR, w, w05, L } = input;
  let N: number;
  let formula: string;

  if (w05 && w05 > 0) {
    N = 5.54 * Math.pow(tR / w05, 2);
    formula = 'N = 5.54 × (tR/w0.5)²';
  } else if (w && w > 0) {
    N = 16 * Math.pow(tR / w, 2);
    formula = 'N = 16 × (tR/w)²';
  } else {
    throw new Error('Largeur w ou w0.5 requise');
  }

  N = roundToSigFigs(N);
  const HETP = L ? roundToSigFigs(L / N) : undefined;

  let interp: Interpretation;
  if (N > 10000) {
    interp = createInterpretation('success', 'Excellente efficacité', `N = ${N.toLocaleString()}`, 'Colonne très efficace. ' + formula);
  } else if (N > 5000) {
    interp = createInterpretation('success', 'Bonne efficacité', `N = ${N.toLocaleString()}`, 'Colonne efficace. ' + formula);
  } else if (N > 2000) {
    interp = createInterpretation('warning', 'Efficacité moyenne', `N = ${N.toLocaleString()}`, 'Efficacité acceptable mais peut être améliorée. ' + formula);
  } else {
    interp = createInterpretation('error', 'Efficacité faible', `N = ${N.toLocaleString()}`, 'Colonne peu efficace. Vérifiez l\'état de la colonne et les conditions. ' + formula);
  }

  return { N, HETP, interpretation: interp };
}

export function calculateHPLCCapacity(input: HPLCCapacityInput): HPLCCapacityResult {
  const { tR, t0 } = input;
  const k = (tR - t0) / t0;

  let interp: Interpretation;
  if (k >= 1 && k <= 3) {
    interp = createInterpretation('success', 'Rétention optimale', `k' = ${formatValue(k)}`, 'Le facteur de capacité est dans la plage optimale (1-3).');
  } else if (k > 3 && k <= 10) {
    interp = createInterpretation('warning', 'Rétention acceptable', `k' = ${formatValue(k)}`, 'Rétention acceptable mais l\'analyte pourrait être trop retenu (3-10).');
  } else if (k < 1) {
    interp = createInterpretation('error', 'Élution trop rapide', `k' = ${formatValue(k)}`, 'L\'analyte est peu retenu. Augmentez la proportion de phase organique ou modifiez le pH.');
  } else {
    interp = createInterpretation('error', 'Élution trop lente', `k' = ${formatValue(k)}`, 'Rétention excessive. Diminuez la proportion de phase organique ou augmentez le débit.');
  }

  return { k: roundToSigFigs(k), interpretation: interp };
}

export function calculateHPLCSelectivity(input: HPLCSelectivityInput): HPLCSelectivityResult {
  const { k1, k2 } = input;
  const alpha = k2 / k1;

  let interp: Interpretation;
  if (alpha >= 1.5) {
    interp = createInterpretation('success', 'Séparation facile', `α = ${formatValue(alpha)}`, 'Le facteur de sélectivité permet une séparation aisée.');
  } else if (alpha >= 1.1) {
    interp = createInterpretation('warning', 'Séparation possible', `α = ${formatValue(alpha)}`, 'Séparation possible mais nécessite une optimisation de la résolution.');
  } else {
    interp = createInterpretation('error', 'Séparation difficile', `α = ${formatValue(alpha)}`, 'Sélectivité insuffisante. Modifiez la phase mobile ou la colonne.');
  }

  return { alpha: roundToSigFigs(alpha), interpretation: interp };
}

export function calculateHPLCAsymmetry(input: HPLCAsymmetryInput): HPLCAsymmetryResult {
  const { f, t } = input;
  const As = f / t;
  const T = (f + t) / (2 * f);

  let interp: Interpretation;
  if (As >= 0.9 && As <= 1.2) {
    interp = createInterpretation('success', 'Pic symétrique', `As = ${formatValue(As)}`, 'Le pic est symétrique et acceptable pour la quantification.');
  } else if (As < 0.9) {
    interp = createInterpretation('warning', 'Pic en traînage frontal', `As = ${formatValue(As)}`, 'Traînage frontal détecté. Vérifiez la surcharge de colonne.');
  } else {
    interp = createInterpretation('warning', 'Pic en traînage arrière', `As = ${formatValue(As)}`, 'Traînage arrière (tailing). Vérifiez les interactions secondaires avec la silice.');
  }

  return { As: roundToSigFigs(As), T: roundToSigFigs(T), interpretation: interp };
}

// ==========================================
// CHROMATOGRAPHIE - GC
// ==========================================

export function calculateGCResolution(input: GCResolutionInput): GCResolutionResult {
  const { tR1, tR2, w1, w2 } = input;
  const Rs = (2 * (tR2 - tR1)) / (w1 + w2);

  let interp: Interpretation;
  let detail = '';
  if (input.temperature) detail += `Température colonne: ${input.temperature}°C. `;
  if (input.columnType) detail += `Colonne ${input.columnType}. `;

  if (Rs < 1.0) {
    interp = createInterpretation('error', 'Séparation insuffisante', `Rs = ${formatValue(Rs)}`, detail + 'Optimisez la température ou le programme de température.');
  } else if (Rs < 1.5) {
    interp = createInterpretation('warning', 'Séparation partielle', `Rs = ${formatValue(Rs)}`, detail + 'Séparation acceptable pour analyses rapides.');
  } else {
    interp = createInterpretation('success', 'Bonne séparation', `Rs = ${formatValue(Rs)}`, detail + 'Résolution satisfaisante.');
  }

  return { Rs: roundToSigFigs(Rs), interpretation: interp };
}

export function calculateGCKovats(input: GCKovatsInput): GCKovatsResult {
  const { tR_analyte, tR_n, tR_n1, n } = input;
  const I = 100 * (n + (Math.log10(tR_analyte) - Math.log10(tR_n)) / (Math.log10(tR_n1) - Math.log10(tR_n)));

  const interp = createInterpretation('info', 'Indice calculé', `I = ${Math.round(I)}`, `Comparez avec la littérature pour l'identification. Alcanes de référence: C${n} et C${n + 1}.`);

  return { I: Math.round(I), interpretation: interp };
}

// ==========================================
// CHROMATOGRAPHIE - TLC
// ==========================================

export function calculateTLC(input: TLCInput): TLCResult {
  const { d_analyte, d_front, d_start = 0 } = input;
  const Rf = (d_analyte - d_start) / (d_front - d_start);

  let interp: Interpretation;
  if (Rf >= 0.2 && Rf <= 0.8) {
    interp = createInterpretation('success', 'Rf optimal', `Rf = ${formatValue(Rf)}`, 'La tache est bien positionnée sur la plaque.');
  } else if (Rf < 0.1) {
    interp = createInterpretation('error', 'Tache trop retenue', `Rf = ${formatValue(Rf)}`, 'Augmentez la polarité de l\'éluant.');
  } else if (Rf < 0.2) {
    interp = createInterpretation('warning', 'Rétention forte', `Rf = ${formatValue(Rf)}`, 'Légèrement trop retenu. Augmentez légèrement la polarité.');
  } else if (Rf > 0.9) {
    interp = createInterpretation('error', 'Tache non retenue', `Rf = ${formatValue(Rf)}`, 'Diminuez la polarité de l\'éluant.');
  } else {
    interp = createInterpretation('warning', 'Migration élevée', `Rf = ${formatValue(Rf)}`, 'Légèrement trop élué. Diminuez légèrement la polarité.');
  }

  return { Rf: roundToSigFigs(Rf), interpretation: interp };
}

// ==========================================
// PARAMÈTRES COLONNE
// ==========================================

export function calculateColumnParams(input: ColumnParamsInput): ColumnParamsResult {
  const { diameter, length, flowRate } = input;
  const r = diameter / 2;
  const r_mm = r;
  const V0 = Math.PI * r_mm * r_mm * length;
  const u = flowRate / (Math.PI * r_mm * r_mm);

  const interp = createInterpretation('info', 'Paramètres calculés', `V₀ = ${formatValue(V0)} mm³, u = ${formatValue(u)} mm/min`, `Colonne ${diameter}mm × ${length}mm, débit ${flowRate} mL/min`);

  return { V0: roundToSigFigs(V0), u: roundToSigFigs(u), interpretation: interp };
}

// ==========================================
// SPECTROMÉTRIE UV-Vis
// ==========================================

export function calculateBeerLambert(input: BeerLambertInput): BeerLambertResult {
  const { mode, A, epsilon, l, C } = input;
  let value: number;
  let label: string;
  let unit: string;
  let formula: string;
  let interp: Interpretation;

  switch (mode) {
    case 'concentration':
      if (A === undefined || epsilon === undefined) throw new Error('A et ε requis');
      value = A / (epsilon * l);
      label = 'Concentration (C)';
      unit = 'mol/L';
      formula = 'C = A / (ε × l)';
      break;
    case 'absorbance':
      if (epsilon === undefined || C === undefined) throw new Error('ε et C requis');
      value = epsilon * l * C;
      label = 'Absorbance (A)';
      unit = 'sans unité';
      formula = 'A = ε × l × C';
      break;
    case 'epsilon':
      if (A === undefined || C === undefined) throw new Error('A et C requis');
      value = A / (l * C);
      label = 'Coefficient d\'extinction (ε)';
      unit = 'L.mol⁻¹.cm⁻¹';
      formula = 'ε = A / (l × C)';
      break;
    default:
      throw new Error('Mode inconnu');
  }

  value = roundToSigFigs(value);

  if (mode === 'absorbance' || (mode === 'concentration' && A !== undefined)) {
    const absVal = mode === 'absorbance' ? value : A!;
    if (absVal > 1.0) {
      interp = createInterpretation('warning', 'Absorbance élevée', `A = ${formatValue(absVal)}`, 'A > 1.0: diluez l\'échantillon pour rester dans la plage linéaire.');
    } else if (absVal < 0.1) {
      interp = createInterpretation('warning', 'Absorbance faible', `A = ${formatValue(absVal)}`, 'A < 0.1: concentrez l\'échantillon pour améliorer la précision.');
    } else {
      interp = createInterpretation('success', 'Dans la plage linéaire', `A = ${formatValue(absVal)}`, 'L\'absorbance est dans la plage optimale (0.1-1.0).');
    }
  } else {
    interp = createInterpretation('info', 'Valeur calculée', `${label} = ${formatValue(value)} ${unit}`, '');
  }

  return { value, label, unit, interpretation: interp, formula };
}

export function calculateLinearRegression(points: CalibrationPoint[]): CalibrationResult {
  const n = points.length;
  if (n < 2) throw new Error('Minimum 2 points requis');

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of points) {
    sumX += p.concentration;
    sumY += p.absorbance;
    sumXY += p.concentration * p.absorbance;
    sumX2 += p.concentration * p.concentration;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const ssRes = points.reduce((acc, p) => acc + Math.pow(p.absorbance - (slope * p.concentration + intercept), 2), 0);
  const ssTot = points.reduce((acc, p) => acc + Math.pow(p.absorbance - sumY / n, 2), 0);
  const r2 = 1 - ssRes / ssTot;

  return {
    slope: roundToSigFigs(slope),
    intercept: roundToSigFigs(intercept),
    r2: roundToSigFigs(r2, 4),
    equation: `A = ${formatValue(slope)}×C + ${formatValue(intercept)}`,
  };
}

export function calculateConcentrationFromCalibration(absorbance: number, calibration: CalibrationResult): number {
  return (absorbance - calibration.intercept) / calibration.slope;
}

export function calculateColorimetry(input: ColorimetryInput): ColorimetryResult {
  const { calibrationPoints, unknownAbsorbance, blankStdDev } = input;
  const calibration = calculateLinearRegression(calibrationPoints);

  let concentration: number | undefined;
  let lod: number | undefined;
  let loq: number | undefined;

  if (unknownAbsorbance !== undefined) {
    concentration = roundToSigFigs(calculateConcentrationFromCalibration(unknownAbsorbance, calibration));
  }

  if (blankStdDev !== undefined && blankStdDev > 0) {
    lod = roundToSigFigs((3 * blankStdDev) / calibration.slope);
    loq = roundToSigFigs((10 * blankStdDev) / calibration.slope);
  }

  let interp: Interpretation;
  if (calibration.r2 >= 0.999) {
    interp = createInterpretation('success', 'Étalonnage excellent', `R² = ${calibration.r2}`, 'La courbe d\'étalonnage est très linéaire.');
  } else if (calibration.r2 >= 0.99) {
    interp = createInterpretation('success', 'Étalonnage acceptable', `R² = ${calibration.r2}`, 'Linéarité acceptable pour la plupart des applications.');
  } else if (calibration.r2 >= 0.95) {
    interp = createInterpretation('warning', 'Linéarité médiocre', `R² = ${calibration.r2}`, 'Vérifiez les points et la plage de concentration.');
  } else {
    interp = createInterpretation('error', 'Linéarité insuffisante', `R² = ${calibration.r2}`, 'L\'étalonnage n\'est pas linéaire. Revoyez la méthode.');
  }

  return { calibration, concentration, lod, loq, interpretation: interp };
}

// ==========================================
// SPECTROMÉTRIE IR
// ==========================================

const IR_DATABASE: IRFunctionalGroup[] = [
  { group: 'O-H (alcool)', vibration: 'ν(O-H)', rangeMin: 3200, rangeMax: 3650, intensity: 'Forte, large' },
  { group: 'O-H (acide)', vibration: 'ν(O-H)', rangeMin: 2500, rangeMax: 3300, intensity: 'Forte, très large' },
  { group: 'N-H (amine 1°)', vibration: 'ν(N-H)', rangeMin: 3300, rangeMax: 3500, intensity: 'Moyenne, doublet' },
  { group: 'N-H (amine 2°)', vibration: 'ν(N-H)', rangeMin: 3300, rangeMax: 3500, intensity: 'Moyenne, singlet' },
  { group: 'C-H (alcyne)', vibration: 'ν(≡C-H)', rangeMin: 3300, rangeMax: 3310, intensity: 'Forte' },
  { group: 'C-H (alcane)', vibration: 'ν(C-H)', rangeMin: 2850, rangeMax: 3000, intensity: 'Forte' },
  { group: 'C-H (aldéhyde)', vibration: 'ν(C-H)', rangeMin: 2700, rangeMax: 2850, intensity: 'Moyenne' },
  { group: 'C≡N (nitrile)', vibration: 'ν(C≡N)', rangeMin: 2210, rangeMax: 2260, intensity: 'Moyenne' },
  { group: 'C≡C', vibration: 'ν(C≡C)', rangeMin: 2100, rangeMax: 2260, intensity: 'Faible' },
  { group: 'C=O (ester)', vibration: 'ν(C=O)', rangeMin: 1735, rangeMax: 1750, intensity: 'Forte' },
  { group: 'C=O (aldéhyde)', vibration: 'ν(C=O)', rangeMin: 1720, rangeMax: 1740, intensity: 'Forte' },
  { group: 'C=O (cétone)', vibration: 'ν(C=O)', rangeMin: 1705, rangeMax: 1725, intensity: 'Forte' },
  { group: 'C=O (acide)', vibration: 'ν(C=O)', rangeMin: 1700, rangeMax: 1725, intensity: 'Forte' },
  { group: 'C=O (amide)', vibration: 'ν(C=O)', rangeMin: 1630, rangeMax: 1690, intensity: 'Forte' },
  { group: 'C=C (alcène)', vibration: 'ν(C=C)', rangeMin: 1620, rangeMax: 1680, intensity: 'Variable' },
  { group: 'N=O (nitro)', vibration: 'ν(N=O)', rangeMin: 1515, rangeMax: 1560, intensity: 'Forte' },
  { group: 'N=O (nitro sym)', vibration: 'ν(N=O)', rangeMin: 1380, rangeMax: 1390, intensity: 'Forte' },
  { group: 'C-H (méthyl)', vibration: 'δ(C-H)', rangeMin: 1375, rangeMax: 1475, intensity: 'Moyenne' },
  { group: 'C-O (alcool)', vibration: 'ν(C-O)', rangeMin: 1000, rangeMax: 1260, intensity: 'Forte' },
  { group: 'C-O (ester)', vibration: 'ν(C-O)', rangeMin: 1000, rangeMax: 1300, intensity: 'Forte' },
  { group: 'C-F', vibration: 'ν(C-F)', rangeMin: 1000, rangeMax: 1400, intensity: 'Forte' },
  { group: 'S=O (sulfone)', vibration: 'ν(S=O)', rangeMin: 1300, rangeMax: 1350, intensity: 'Forte' },
  { group: 'C-Cl', vibration: 'ν(C-Cl)', rangeMin: 600, rangeMax: 800, intensity: 'Forte' },
  { group: 'C-Br', vibration: 'ν(C-Br)', rangeMin: 500, rangeMax: 600, intensity: 'Forte' },
];

export function searchIRGroups(wavenumber: number, tolerance: number = 50): IRFunctionalGroup[] {
  return IR_DATABASE.filter(
    (g) => wavenumber >= g.rangeMin - tolerance && wavenumber <= g.rangeMax + tolerance
  );
}

export { IR_DATABASE };

// ==========================================
// SPECTROMÉTRIE MS
// ==========================================

const COMMON_LOSSES: Record<number, string> = {
  1: 'H•', 15: 'CH3•', 17: 'OH•', 18: 'H2O',
  26: 'C2H2', 27: 'C2H3• / HCN', 28: 'CO / C2H4',
  29: 'CHO• / C2H5•', 30: 'CH2O / NO', 31: 'OCH3•',
  36: 'HCl', 39: 'C3H3•', 40: 'C3H4', 43: 'C3H7• / CH3CO•',
  44: 'CO2 / C3H8', 45: 'CO2H• / OC2H5•', 55: 'C4H7•',
  57: 'C4H9•', 58: 'C4H10 / (CH3)2CO',
};

export function calculateMS(input: MSInput): MSResult {
  const { molecularMass, fragmentMass, charge = 1 } = input;
  const adjustedMolecular = molecularMass * charge;
  const adjustedFragment = fragmentMass * charge;
  const massLost = adjustedMolecular - adjustedFragment;

  const commonLoss = COMMON_LOSSES[Math.round(massLost)];

  let interp: Interpretation;
  if (commonLoss) {
    interp = createInterpretation('info', 'Perte identifiée', `Δm = ${Math.round(massLost)}`, `Perte probable: ${commonLoss}`);
  } else {
    interp = createInterpretation('info', 'Perte non standard', `Δm = ${formatValue(massLost)}`, 'Perte non répertoriée dans les pertes communes.');
  }

  return { massLost: roundToSigFigs(massLost), commonLoss, interpretation: interp };
}

// ==========================================
// SPECTROMÉTRIE NMR
// ==========================================

interface NMRRange {
  label: string;
  min: number;
  max: number;
}

const NMR_RANGES: NMRRange[] = [
  { label: 'R-CH₃ (méthyle aliphatique)', min: 0.5, max: 2.0 },
  { label: 'R-CH₂- (méthylène)', min: 1.0, max: 3.0 },
  { label: 'R₃C-H (méthine)', min: 1.5, max: 2.5 },
  { label: 'CH₃-C=O (acétyle)', min: 2.0, max: 2.5 },
  { label: '≡C-H (proton alcyne)', min: 2.5, max: 3.5 },
  { label: 'N-CH₃ (méthyle sur N)', min: 2.2, max: 3.0 },
  { label: 'O-CH₃ / O-CH₂ (méthoxy)', min: 3.3, max: 4.5 },
  { label: '=C-H (vinyle)', min: 4.5, max: 6.5 },
  { label: 'Ar-H (aromatique)', min: 6.5, max: 8.5 },
  { label: 'R-CHO (aldéhyde)', min: 9.0, max: 10.5 },
  { label: 'R-COOH (acide carboxylique)', min: 10.0, max: 13.0 },
  { label: 'O-H (alcool)', min: 1.0, max: 5.5 },
  { label: 'N-H (amine/amide)', min: 1.0, max: 5.0 },
];

const MULTIPLICITY_RULES: Record<string, string> = {
  's': 'Singulet (0 voisins)',
  'd': 'Doublet (1 voisin)',
  't': 'Triplet (2 voisins)',
  'q': 'Quadruplet (3 voisins)',
  'm': 'Multiplet (>3 voisins)',
};

export function analyzeNMR(input: NMRInput): NMRResult {
  const { delta, multiplicity, integration } = input;
  const assignments = NMR_RANGES.filter(r => delta >= r.min && delta <= r.max).map(r => r.label);

  const multiDesc = MULTIPLICITY_RULES[multiplicity] || 'Multiplicité inconnue';

  let interp: Interpretation;
  if (assignments.length > 0) {
    interp = createInterpretation('info', 'Attribution trouvée', `δ = ${delta} ppm`, `${multiDesc}. ${integration ? `Intégration: ${integration}H` : ''}`);
  } else {
    interp = createInterpretation('warning', 'Aucune attribution', `δ = ${delta} ppm`, 'Déplacement chimique hors plages connues.');
  }

  return { assignments: assignments.length > 0 ? assignments : ['Aucun proton correspondant'], interpretation: interp };
}

// ==========================================
// TITRAGE
// ==========================================

export function calculateTitration(input: TitrationInput): TitrationResult {
  const { C_titrant, V_titrant, V_ech, n, type } = input;
  const C_ech = (C_titrant * V_titrant * n) / V_ech;

  let details = '';

  switch (type) {
    case 'acidbase':
      details = `Titrage acide-base. Facteur stœchiométrique: ${n}.`;
      break;
    case 'redox':
      details = `Titrage redox. Nombre d'électrons échangés: ${n}.`;
      break;
    case 'complexo':
      details = `Titrage complexométrique. Ratio de complexation: ${n}.`;
      break;
    case 'precipitation':
      details = `Titrage par précipitation. Ratio stœchiométrique: ${n}.`;
      break;
  }

  const interp = createInterpretation('success', 'Concentration calculée', `C = ${formatValue(C_ech)} mol/L`, details);

  return { C_ech: roundToSigFigs(C_ech), interpretation: interp, details };
}

// ==========================================
// DILUTION
// ==========================================

export function calculateDilution(input: DilutionInput): number {
  const { C1, V1, C2, V2 } = input;
  if (C1 === undefined && V1 !== undefined && C2 !== undefined && V2 !== undefined) {
    return (C2 * V2) / V1;
  } else if (V1 === undefined && C1 !== undefined && C2 !== undefined && V2 !== undefined) {
    return (C2 * V2) / C1;
  } else if (C2 === undefined && C1 !== undefined && V1 !== undefined && V2 !== undefined) {
    return (C1 * V1) / V2;
  } else if (V2 === undefined && C1 !== undefined && V1 !== undefined && C2 !== undefined) {
    return (C1 * V1) / C2;
  }
  throw new Error('3 valeurs sur 4 requises');
}

// ==========================================
// PRÉPARATION SOLUTION
// ==========================================

export function calculateSolutionMass(input: SolutionPrepInput): number {
  const { concentration, volume, molarMass } = input;
  return concentration * volume * molarMass;
}

// ==========================================
// GRAVIMÉTRIE
// ==========================================

export function calculateGravimetry(input: GravimetryInput): GravimetryResult {
  const { massPrecipitate, massSample, gravimetricFactor } = input;
  const percentage = (massPrecipitate * gravimetricFactor) / massSample * 100;

  let interp: Interpretation;
  if (percentage > 0 && percentage <= 100) {
    interp = createInterpretation('success', 'Résultat valide', `${formatValue(percentage)}%`, 'Le pourcentage est dans la plage attendue.');
  } else if (percentage > 100) {
    interp = createInterpretation('error', 'Erreur', `${formatValue(percentage)}%`, 'Pourcentage > 100%. Vérifiez les valeurs saisies.');
  } else {
    interp = createInterpretation('error', 'Erreur', `${formatValue(percentage)}%`, 'Résultat négatif. Vérifiez les valeurs saisies.');
  }

  return { percentage: roundToSigFigs(percentage), interpretation: interp };
}

// ==========================================
// STATISTIQUES
// ==========================================

export function calculateStatistics(input: StatisticsInput): StatisticsResult {
  const values = input.values.filter(v => !isNaN(v));
  const n = values.length;
  if (n === 0) throw new Error('Aucune valeur valide');

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const stdDev = Math.sqrt(values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1 || 1));
  const rsd = (stdDev / mean) * 100;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const ci95 = 1.96 * stdDev / Math.sqrt(n);

  let interp: Interpretation;
  if (rsd < 1) {
    interp = createInterpretation('success', 'Excellente précision', `RSD = ${formatValue(rsd)}%`, 'La répétabilité est excellente.');
  } else if (rsd < 5) {
    interp = createInterpretation('success', 'Bonne précision', `RSD = ${formatValue(rsd)}%`, 'Précision acceptable pour la plupart des analyses.');
  } else if (rsd < 10) {
    interp = createInterpretation('warning', 'Précision médiocre', `RSD = ${formatValue(rsd)}%`, 'RSD élevé. Vérifiez la méthode et la technique.');
  } else {
    interp = createInterpretation('error', 'Précision insuffisante', `RSD = ${formatValue(rsd)}%`, 'RSD très élevé. La méthode doit être optimisée.');
  }

  return {
    n,
    mean: roundToSigFigs(mean),
    stdDev: roundToSigFigs(stdDev),
    rsd: roundToSigFigs(rsd),
    min: roundToSigFigs(min),
    max: roundToSigFigs(max),
    median: roundToSigFigs(median),
    ci95: roundToSigFigs(ci95),
    interpretation: interp,
  };
}

// ==========================================
// DILUTIONS EN CASCADE
// ==========================================

export function calculateCascadeDilution(steps: CascadeStep[]): CascadeStep[] {
  const result: CascadeStep[] = [];
  let currentC = steps[0]?.C_input ?? 0;

  for (const step of steps) {
    if (step.C_input !== undefined) currentC = step.C_input;
    const df = step.dilutionFactor ?? 1;
    const C_output = currentC / df;
    result.push({
      ...step,
      C_input: currentC,
      C_output: roundToSigFigs(C_output),
    });
    currentC = C_output;
  }

  return result;
}

// ==========================================
// RÉACTIONS STOCHIOMÉTRIE
// ==========================================

export function calculateReaction(compounds: ReactionCompound[]): ReactionResult {
  // Simplifié: aA + bB -> cC + dD
  const reactants = compounds.filter((_, i) => i < 2);
  const products = compounds.filter((_, i) => i >= 2);

  let limitingReagent = '';
  let minRatio = Infinity;

  for (const r of reactants) {
    const ratio = r.initialAmount / r.coefficient;
    if (ratio < minRatio) {
      minRatio = ratio;
      limitingReagent = r.formula;
    }
  }

  const theoreticalProducts: Record<string, number> = {};
  for (const p of products) {
    const amount = minRatio * p.coefficient;
    theoreticalProducts[p.formula] = roundToSigFigs(amount);
  }

  const interp = createInterpretation('info', 'Réactif limitant identifié', limitingReagent, `Quantités théoriques calculées à partir de ${formatValue(minRatio)} mol de réaction.`);

  return { limitingReagent, theoreticalProducts, interpretation: interp };
}

// ==========================================
// CONVERTISSEUR D'UNITÉS
// ==========================================

interface UnitDefinition {
  name: string;
  toBase: number; // multiplier to get to base unit
}

const UNIT_SYSTEMS: Record<string, UnitDefinition[]> = {
  mass: [
    { name: 'kg', toBase: 1000 },
    { name: 'g', toBase: 1 },
    { name: 'mg', toBase: 0.001 },
    { name: 'μg', toBase: 0.000001 },
    { name: 'ng', toBase: 0.000000001 },
  ],
  volume: [
    { name: 'L', toBase: 1 },
    { name: 'mL', toBase: 0.001 },
    { name: 'μL', toBase: 0.000001 },
    { name: 'nL', toBase: 0.000000001 },
  ],
  pressure: [
    { name: 'Pa', toBase: 1 },
    { name: 'kPa', toBase: 1000 },
    { name: 'MPa', toBase: 1000000 },
    { name: 'bar', toBase: 100000 },
    { name: 'mbar', toBase: 100 },
    { name: 'atm', toBase: 101325 },
    { name: 'psi', toBase: 6894.76 },
    { name: 'mmHg', toBase: 133.322 },
  ],
  temperature: [
    { name: '°C', toBase: 1 }, // special handling
    { name: '°F', toBase: 1 },
    { name: 'K', toBase: 1 },
  ],
  wavelength: [
    { name: 'nm', toBase: 1 },
    { name: 'μm', toBase: 1000 },
    { name: 'cm⁻¹', toBase: -1 }, // special: reciprocal
    { name: 'eV', toBase: -2 },   // special: energy
  ],
};

export function convertUnit(value: number, from: string, to: string, category: string): number {
  if (category === 'temperature') {
    let celsius = value;
    if (from === '°F') celsius = (value - 32) * 5 / 9;
    else if (from === 'K') celsius = value - 273.15;

    if (to === '°C') return celsius;
    if (to === '°F') return celsius * 9 / 5 + 32;
    if (to === 'K') return celsius + 273.15;
    return celsius;
  }

  if (category === 'wavelength') {
    // nm as base
    let nm = value;
    if (from === 'μm') nm = value * 1000;
    else if (from === 'cm⁻¹') nm = 10000000 / value;
    else if (from === 'eV') nm = 1239.8 / value;

    if (to === 'nm') return nm;
    if (to === 'μm') return nm / 1000;
    if (to === 'cm⁻¹') return 10000000 / nm;
    if (to === 'eV') return 1239.8 / nm;
    return nm;
  }

  const units = UNIT_SYSTEMS[category];
  if (!units) throw new Error(`Catégorie ${category} non supportée`);

  const fromUnit = units.find(u => u.name === from);
  const toUnit = units.find(u => u.name === to);
  if (!fromUnit || !toUnit) throw new Error('Unité non trouvée');

  const baseValue = value * fromUnit.toBase;
  return baseValue / toUnit.toBase;
}

export { UNIT_SYSTEMS };

// ==========================================
// GRAVIMÉTRIE - FACTEURS
// ==========================================

export const GRAVIMETRIC_FACTORS: Record<string, number> = {
  'SO₄ → BaSO₄': 0.4116,
  'Cl → AgCl': 0.2474,
  'Ca → CaCO₃': 0.4004,
  'Fe → Fe₂O₃': 0.6994,
  'Mg → Mg₂P₂O₇': 0.2185,
  'P → Mg₂P₂O₇': 0.2787,
  'Ba → BaSO₄': 0.5885,
  'Pb → PbSO₄': 0.6832,
  'Ag → AgCl': 0.7526,
  'Ni → Ni(DMG)₂': 0.2032,
};
