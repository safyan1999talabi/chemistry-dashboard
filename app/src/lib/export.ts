import * as XLSX from 'xlsx';

interface ExportSheet {
  name: string;
  data: (string | number)[][];
}

export function exportToExcel(
  filename: string,
  sheets: ExportSheet[]
): void {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);
    // Set column widths
    ws['!cols'] = sheet.data[0]?.map(() => ({ wch: 20 })) || [];
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCsv(filename: string, rows: (string | number)[][], headers: string[]): void {
  const escapeCell = (value: string | number) => {
    const cell = String(value);
    return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
  };
  const csv = [headers, ...rows].map(row => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function createCalculationSheets(
  moduleName: string,
  inputs: Record<string, { value: number | string; unit: string }>,
  results: Record<string, { value: number; unit: string }>,
  interpretation?: { status: string; badge: string; message: string; detail?: string },
  formula?: string
): ExportSheet[] {
  const sheets: ExportSheet[] = [];

  // Sheet 1: Données
  const dataSheet: (string | number)[][] = [
    ['ChimLab - Export de calculs'],
    ['Module', moduleName],
    ['Date', new Date().toLocaleString('fr-FR')],
    [],
    ['DONNÉES D\'ENTRÉE'],
    ['Paramètre', 'Valeur', 'Unité'],
  ];
  for (const [key, val] of Object.entries(inputs)) {
    dataSheet.push([key, val.value, val.unit]);
  }
  sheets.push({ name: 'Données', data: dataSheet });

  // Sheet 2: Résultats
  const resultSheet: (string | number)[][] = [
    ['RÉSULTATS'],
    ['Paramètre', 'Valeur', 'Unité'],
  ];
  for (const [key, val] of Object.entries(results)) {
    resultSheet.push([key, val.value, val.unit]);
  }
  if (formula) {
    resultSheet.push([]);
    resultSheet.push(['Formule utilisée', formula]);
  }
  sheets.push({ name: 'Résultats', data: resultSheet });

  // Sheet 3: Interprétation
  if (interpretation) {
    const interpSheet: (string | number)[][] = [
      ['INTERPRÉTATION'],
      ['Statut', interpretation.status],
      ['Badge', interpretation.badge],
      ['Message', interpretation.message],
    ];
    if (interpretation.detail) {
      interpSheet.push(['Détail', interpretation.detail]);
    }
    sheets.push({ name: 'Interprétation', data: interpSheet });
  }

  return sheets;
}

export function exportCalibrationToExcel(
  points: { concentration: number; absorbance: number }[],
  calibration: { slope: number; intercept: number; r2: number; equation: string },
  concentration?: number,
  lod?: number,
  loq?: number
): void {
  const sheets: ExportSheet[] = [];

  // Points d'étalonnage
  const pointsSheet: (string | number)[][] = [
    ['POINTS D\'ÉTALONNAGE'],
    ['Concentration', 'Absorbance'],
  ];
  for (const p of points) {
    pointsSheet.push([p.concentration, p.absorbance]);
  }
  sheets.push({ name: 'Étalonnage', data: pointsSheet });

  // Régression
  const regSheet: (string | number)[][] = [
    ['RÉSULTATS DE RÉGRESSION'],
    ['Paramètre', 'Valeur'],
    ['Pente (a)', calibration.slope],
    ['Ordonnée origine (b)', calibration.intercept],
    ['R²', calibration.r2],
    ['Équation', calibration.equation],
  ];
  if (concentration !== undefined) {
    regSheet.push(['Concentration inconnue', concentration]);
  }
  if (lod !== undefined) {
    regSheet.push(['LOD', lod]);
  }
  if (loq !== undefined) {
    regSheet.push(['LOQ', loq]);
  }
  sheets.push({ name: 'Résultats', data: regSheet });

  exportToExcel('etalonnage_chimlab', sheets);
}
