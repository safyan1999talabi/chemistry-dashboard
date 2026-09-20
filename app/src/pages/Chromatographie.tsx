import { useState, useCallback, useMemo } from 'react';
import {
  CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter,
  Tooltip as ChartTooltip, XAxis, YAxis,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultCard, InputField } from '@/components/CalculationCard';
import {
  calculateHPLCResolution, calculateHPLCPlates, calculateHPLCCapacity,
  calculateHPLCSelectivity, calculateHPLCAsymmetry, calculateGCResolution,
  calculateGCKovats, calculateTLC, calculateColumnParams,
  calculateLinearRegression,
} from '@/lib/calculations';
import type {
  HPLCResolutionResult, HPLCPlateResult, HPLCCapacityResult,
  HPLCSelectivityResult, HPLCAsymmetryResult, GCResolutionResult,
  GCKovatsResult, TLCResult, ColumnParamsResult,
} from '@/types';
import type { CalibrationPoint, CalibrationResult } from '@/types';
import { FlaskConical, Plus, Trash2 } from 'lucide-react';

export default function Chromatographie() {
  const [mainTab, setMainTab] = useState('hplc');
  const [hplcTab, setHplcTab] = useState('resolution');

  // HPLC Resolution state
  const [hplcRes, setHplcRes] = useState({ tR1: '', tR2: '', w1: '', w2: '', w05_1: '', w05_2: '' });
  const [hplcResResult, setHplcResResult] = useState<HPLCResolutionResult | null>(null);

  // HPLC Plates state
  const [hplcPlate, setHplcPlate] = useState({ tR: '', w: '', w05: '', L: '' });
  const [hplcPlateResult, setHplcPlateResult] = useState<HPLCPlateResult | null>(null);

  // HPLC Capacity state
  const [hplcCap, setHplcCap] = useState({ tR: '', t0: '' });
  const [hplcCapResult, setHplcCapResult] = useState<HPLCCapacityResult | null>(null);

  // HPLC Selectivity state
  const [hplcSel, setHplcSel] = useState({ k1: '', k2: '' });
  const [hplcSelResult, setHplcSelResult] = useState<HPLCSelectivityResult | null>(null);

  // HPLC Asymmetry state
  const [hplcAsym, setHplcAsym] = useState({ f: '', t: '' });
  const [hplcAsymResult, setHplcAsymResult] = useState<HPLCAsymmetryResult | null>(null);

  // GC Resolution state
  const [gcRes, setGcRes] = useState({ tR1: '', tR2: '', w1: '', w2: '', temperature: '', columnType: '' });
  const [gcResResult, setGcResResult] = useState<GCResolutionResult | null>(null);

  // GC Kovats state
  const [gcKov, setGcKov] = useState({ tR_analyte: '', tR_n: '', tR_n1: '', n: '' });
  const [gcKovResult, setGcKovResult] = useState<GCKovatsResult | null>(null);

  // TLC state
  const [tlc, setTlc] = useState({ d_analyte: '', d_front: '', d_start: '' });
  const [tlcResult, setTlcResult] = useState<TLCResult | null>(null);

  // Column params state
  const [colParams, setColParams] = useState({ diameter: '', length: '', particleSize: '', flowRate: '' });
  const [colParamsResult, setColParamsResult] = useState<ColumnParamsResult | null>(null);

  // Calibration of chromatographic peak area against concentration
  const [peakPoints, setPeakPoints] = useState<CalibrationPoint[]>([
    { concentration: 1, absorbance: 120 },
    { concentration: 2, absorbance: 235 },
    { concentration: 4, absorbance: 468 },
    { concentration: 6, absorbance: 705 },
  ]);
  const [peakRegression, setPeakRegression] = useState<CalibrationResult | null>(null);

  const handleHPLCRes = useCallback(() => {
    const r = calculateHPLCResolution({
      tR1: parseFloat(hplcRes.tR1), tR2: parseFloat(hplcRes.tR2),
      w1: parseFloat(hplcRes.w1), w2: parseFloat(hplcRes.w2),
      w05_1: hplcRes.w05_1 ? parseFloat(hplcRes.w05_1) : undefined,
      w05_2: hplcRes.w05_2 ? parseFloat(hplcRes.w05_2) : undefined,
    });
    setHplcResResult(r);
  }, [hplcRes]);

  const handleHPLCPlate = useCallback(() => {
    const r = calculateHPLCPlates({
      tR: parseFloat(hplcPlate.tR),
      w: hplcPlate.w ? parseFloat(hplcPlate.w) : undefined,
      w05: hplcPlate.w05 ? parseFloat(hplcPlate.w05) : undefined,
      L: hplcPlate.L ? parseFloat(hplcPlate.L) : undefined,
    });
    setHplcPlateResult(r);
  }, [hplcPlate]);

  const handleHPLCCap = useCallback(() => {
    const r = calculateHPLCCapacity({ tR: parseFloat(hplcCap.tR), t0: parseFloat(hplcCap.t0) });
    setHplcCapResult(r);
  }, [hplcCap]);

  const handleHPLCSel = useCallback(() => {
    const r = calculateHPLCSelectivity({ k1: parseFloat(hplcSel.k1), k2: parseFloat(hplcSel.k2) });
    setHplcSelResult(r);
  }, [hplcSel]);

  const handleHPLCAsym = useCallback(() => {
    const r = calculateHPLCAsymmetry({ f: parseFloat(hplcAsym.f), t: parseFloat(hplcAsym.t) });
    setHplcAsymResult(r);
  }, [hplcAsym]);

  const handleGCRes = useCallback(() => {
    const r = calculateGCResolution({
      tR1: parseFloat(gcRes.tR1), tR2: parseFloat(gcRes.tR2),
      w1: parseFloat(gcRes.w1), w2: parseFloat(gcRes.w2),
      temperature: gcRes.temperature ? parseFloat(gcRes.temperature) : undefined,
      columnType: gcRes.columnType || undefined,
    });
    setGcResResult(r);
  }, [gcRes]);

  const handleGCKovats = useCallback(() => {
    const r = calculateGCKovats({
      tR_analyte: parseFloat(gcKov.tR_analyte),
      tR_n: parseFloat(gcKov.tR_n),
      tR_n1: parseFloat(gcKov.tR_n1),
      n: parseInt(gcKov.n),
    });
    setGcKovResult(r);
  }, [gcKov]);

  const handleTLC = useCallback(() => {
    const r = calculateTLC({
      d_analyte: parseFloat(tlc.d_analyte),
      d_front: parseFloat(tlc.d_front),
      d_start: tlc.d_start ? parseFloat(tlc.d_start) : undefined,
    });
    setTlcResult(r);
  }, [tlc]);

  const handleColParams = useCallback(() => {
    const r = calculateColumnParams({
      diameter: parseFloat(colParams.diameter),
      length: parseFloat(colParams.length),
      flowRate: parseFloat(colParams.flowRate),
      particleSize: colParams.particleSize ? parseFloat(colParams.particleSize) : undefined,
    });
    setColParamsResult(r);
  }, [colParams]);

  const handlePeakRegression = useCallback(() => {
    const points = peakPoints.filter(point => point.concentration >= 0 && point.absorbance >= 0);
    if (points.length < 2) return;
    setPeakRegression(calculateLinearRegression(points));
  }, [peakPoints]);

  const peakChartData = useMemo(() => {
    if (!peakRegression) return peakPoints;
    const values = peakPoints.map(point => ({
      concentration: point.concentration,
      area: point.absorbance,
      regression: peakRegression.slope * point.concentration + peakRegression.intercept,
    }));
    return values;
  }, [peakPoints, peakRegression]);

  const updatePeakPoint = (index: number, field: keyof CalibrationPoint, value: string) => {
    setPeakPoints(points => points.map((point, pointIndex) => pointIndex === index
      ? { ...point, [field]: Number(value) || 0 }
      : point));
  };

  const isFilled = (vals: string[], count: number) => vals.filter(v => v !== '').length >= count;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="bg-white border border-[#e2e8f0] p-1 rounded-lg h-auto">
          <TabsTrigger value="hplc" className="text-[13px] px-4 py-2 data-[state=active]:text-[#059669] data-[state=active]:border-b-2 data-[state=active]:border-[#059669] rounded-none">HPLC</TabsTrigger>
          <TabsTrigger value="gc" className="text-[13px] px-4 py-2 data-[state=active]:text-[#059669] data-[state=active]:border-b-2 data-[state=active]:border-[#059669] rounded-none">GC</TabsTrigger>
          <TabsTrigger value="tlc" className="text-[13px] px-4 py-2 data-[state=active]:text-[#059669] data-[state=active]:border-b-2 data-[state=active]:border-[#059669] rounded-none">TLC</TabsTrigger>
          <TabsTrigger value="colonne" className="text-[13px] px-4 py-2 data-[state=active]:text-[#059669] data-[state=active]:border-b-2 data-[state=active]:border-[#059669] rounded-none">Paramètres colonne</TabsTrigger>
          <TabsTrigger value="aire" className="text-[13px] px-4 py-2 data-[state=active]:text-[#059669] data-[state=active]:border-b-2 data-[state=active]:border-[#059669] rounded-none">Aire du pic</TabsTrigger>
        </TabsList>

        {/* HPLC */}
        <div className={mainTab === 'hplc' ? 'mt-6' : 'hidden'}>
          <Tabs value={hplcTab} onValueChange={setHplcTab}>
            <TabsList className="bg-transparent border-0 p-0 mb-4 gap-1 flex-wrap h-auto">
              {['resolution', 'plateaux', 'capacite', 'selectivite', 'asymetrie'].map(tab => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="text-[12px] px-3 py-1.5 data-[state=active]:bg-[#059669] data-[state=active]:text-white rounded-md border border-[#e2e8f0] data-[state=active]:border-[#059669]"
                >
                  {tab === 'resolution' && 'Résolution'}
                  {tab === 'plateaux' && 'Plateaux théoriques'}
                  {tab === 'capacite' && 'Facteur capacité'}
                  {tab === 'selectivite' && 'Sélectivité'}
                  {tab === 'asymetrie' && 'Asymétrie'}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Résolution */}
            <div className={hplcTab === 'resolution' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-[#0f172a]">Facteur de résolution (Rs)</h2>
                    <span className="text-[11px] bg-[#059669] text-white px-2 py-0.5 rounded-full font-medium">HPLC</span>
                  </div>
                  <p className="text-[13px] text-[#475569] mb-5">Évalue la séparation entre deux pics. Rs ≥ 1.5 indique une bonne séparation.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="tR₁" value={hplcRes.tR1} onChange={v => setHplcRes(p => ({ ...p, tR1: v }))} unit="min" required />
                    <InputField label="tR₂" value={hplcRes.tR2} onChange={v => setHplcRes(p => ({ ...p, tR2: v }))} unit="min" required />
                    <InputField label="w₁" value={hplcRes.w1} onChange={v => setHplcRes(p => ({ ...p, w1: v }))} unit="min" required />
                    <InputField label="w₂" value={hplcRes.w2} onChange={v => setHplcRes(p => ({ ...p, w2: v }))} unit="min" required />
                    <InputField label="w₀.₅₁ (optionnel)" value={hplcRes.w05_1} onChange={v => setHplcRes(p => ({ ...p, w05_1: v }))} unit="min" />
                    <InputField label="w₀.₅₂ (optionnel)" value={hplcRes.w05_2} onChange={v => setHplcRes(p => ({ ...p, w05_2: v }))} unit="min" />
                  </div>
                  <button
                    onClick={handleHPLCRes}
                    disabled={!isFilled([hplcRes.tR1, hplcRes.tR2, hplcRes.w1, hplcRes.w2], 4)}
                    className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
                  >
                    <FlaskConical className="w-4 h-4" /> Calculer la résolution
                  </button>
                </div>
                {hplcResResult && (
                  <ResultCard
                    results={[
                      { label: 'Facteur de résolution Rs', value: hplcResResult.Rs },
                      ...(hplcResResult.Rs_mid ? [{ label: 'Rs (mi-hauteur)', value: hplcResResult.Rs_mid }] : []),
                    ]}
                    interpretation={hplcResResult.interpretation}
                    formula="Rs = 2(tR₂ - tR₁) / (w₁ + w₂)"
                  />
                )}
              </div>
            </div>

            {/* Plateaux théoriques */}
            <div className={hplcTab === 'plateaux' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-[#0f172a]">Plateaux théoriques (N)</h2>
                    <span className="text-[11px] bg-[#059669] text-white px-2 py-0.5 rounded-full font-medium">HPLC</span>
                  </div>
                  <p className="text-[13px] text-[#475569] mb-5">Mesure l&apos;efficacité de la colonne.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="tR" value={hplcPlate.tR} onChange={v => setHplcPlate(p => ({ ...p, tR: v }))} unit="min" required />
                    <InputField label="w (largeur base)" value={hplcPlate.w} onChange={v => setHplcPlate(p => ({ ...p, w: v }))} unit="min" />
                    <InputField label="w₀.₅ (mi-hauteur)" value={hplcPlate.w05} onChange={v => setHplcPlate(p => ({ ...p, w05: v }))} unit="min" />
                    <InputField label="L (longueur, optionnel)" value={hplcPlate.L} onChange={v => setHplcPlate(p => ({ ...p, L: v }))} unit="mm" />
                  </div>
                  <button
                    onClick={handleHPLCPlate}
                    disabled={!hplcPlate.tR || (!hplcPlate.w && !hplcPlate.w05)}
                    className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
                  >
                    <FlaskConical className="w-4 h-4" /> Calculer N
                  </button>
                </div>
                {hplcPlateResult && (
                  <ResultCard
                    results={[
                      { label: 'Plateaux théoriques N', value: hplcPlateResult.N },
                      ...(hplcPlateResult.HETP ? [{ label: 'HETP', value: hplcPlateResult.HETP, unit: 'mm' }] : []),
                    ]}
                    interpretation={hplcPlateResult.interpretation}
                  />
                )}
              </div>
            </div>

            {/* Facteur capacité */}
            <div className={hplcTab === 'capacite' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Facteur de capacité (k')</h2>
                  <p className="text-[13px] text-[#475569] mb-5">k&apos; entre 1 et 10 est optimal.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="tR" value={hplcCap.tR} onChange={v => setHplcCap(p => ({ ...p, tR: v }))} unit="min" required />
                    <InputField label="t₀ (temps mort)" value={hplcCap.t0} onChange={v => setHplcCap(p => ({ ...p, t0: v }))} unit="min" required />
                  </div>
                  <button
                    onClick={handleHPLCCap}
                    disabled={!isFilled([hplcCap.tR, hplcCap.t0], 2)}
                    className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
                  >
                    <FlaskConical className="w-4 h-4" /> Calculer k&apos;
                  </button>
                </div>
                {hplcCapResult && (
                  <ResultCard
                    results={[{ label: "Facteur de capacité k'", value: hplcCapResult.k }]}
                    interpretation={hplcCapResult.interpretation}
                    formula="k' = (tR - t₀) / t₀"
                  />
                )}
              </div>
            </div>

            {/* Sélectivité */}
            <div className={hplcTab === 'selectivite' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Facteur de sélectivité (α)</h2>
                  <p className="text-[13px] text-[#475569] mb-5">α &gt; 1.1 pour une séparation possible.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="k'₁" value={hplcSel.k1} onChange={v => setHplcSel(p => ({ ...p, k1: v }))} required />
                    <InputField label="k'₂" value={hplcSel.k2} onChange={v => setHplcSel(p => ({ ...p, k2: v }))} required />
                  </div>
                  <button
                    onClick={handleHPLCSel}
                    disabled={!isFilled([hplcSel.k1, hplcSel.k2], 2)}
                    className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
                  >
                    <FlaskConical className="w-4 h-4" /> Calculer α
                  </button>
                </div>
                {hplcSelResult && (
                  <ResultCard
                    results={[{ label: 'Sélectivité α', value: hplcSelResult.alpha }]}
                    interpretation={hplcSelResult.interpretation}
                    formula="α = k'₂ / k'₁"
                  />
                )}
              </div>
            </div>

            {/* Asymétrie */}
            <div className={hplcTab === 'asymetrie' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Asymétrie (As) et traînage (T)</h2>
                  <p className="text-[13px] text-[#475569] mb-5">Mesuré à 10% de la hauteur du pic.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="f (distance avant)" value={hplcAsym.f} onChange={v => setHplcAsym(p => ({ ...p, f: v }))} unit="mm" required />
                    <InputField label="t (distance arrière)" value={hplcAsym.t} onChange={v => setHplcAsym(p => ({ ...p, t: v }))} unit="mm" required />
                  </div>
                  <button
                    onClick={handleHPLCAsym}
                    disabled={!isFilled([hplcAsym.f, hplcAsym.t], 2)}
                    className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
                  >
                    <FlaskConical className="w-4 h-4" /> Calculer As et T
                  </button>
                </div>
                {hplcAsymResult && (
                  <ResultCard
                    results={[
                      { label: 'Asymétrie As', value: hplcAsymResult.As },
                      { label: 'Facteur de traînage T', value: hplcAsymResult.T },
                    ]}
                    interpretation={hplcAsymResult.interpretation}
                    formula="As = f/t,  T = (f+t)/2f"
                  />
                )}
              </div>
            </div>
          </Tabs>
        </div>

        {/* GC */}
        <div className={mainTab === 'gc' ? 'mt-6 space-y-8' : 'hidden'}>
          {/* GC Résolution */}
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0f172a]">Facteur de résolution GC</h2>
                <span className="text-[11px] bg-[#f59e0b] text-white px-2 py-0.5 rounded-full font-medium">GC</span>
              </div>
              <p className="text-[13px] text-[#475569] mb-5">Séparation entre deux pics en chromatographie gazeuse.</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="tR₁" value={gcRes.tR1} onChange={v => setGcRes(p => ({ ...p, tR1: v }))} unit="min" required />
                <InputField label="tR₂" value={gcRes.tR2} onChange={v => setGcRes(p => ({ ...p, tR2: v }))} unit="min" required />
                <InputField label="w₁" value={gcRes.w1} onChange={v => setGcRes(p => ({ ...p, w1: v }))} unit="min" required />
                <InputField label="w₂" value={gcRes.w2} onChange={v => setGcRes(p => ({ ...p, w2: v }))} unit="min" required />
                <InputField label="Température (optionnel)" value={gcRes.temperature} onChange={v => setGcRes(p => ({ ...p, temperature: v }))} unit="°C" />
                <InputField label="Type colonne" value={gcRes.columnType} onChange={v => setGcRes(p => ({ ...p, columnType: v }))} />
              </div>
              <button
                onClick={handleGCRes}
                disabled={!isFilled([gcRes.tR1, gcRes.tR2, gcRes.w1, gcRes.w2], 4)}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <FlaskConical className="w-4 h-4" /> Calculer Rs
              </button>
            </div>
            {gcResResult && (
              <ResultCard
                results={[{ label: 'Rs', value: gcResResult.Rs }]}
                interpretation={gcResResult.interpretation}
                formula="Rs = 2(tR₂ - tR₁) / (w₁ + w₂)"
              />
            )}
          </div>

          {/* Kovats */}
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Indice de rétention de Kovats (I)</h2>
              <p className="text-[13px] text-[#475569] mb-5">Identification des composés volatils.</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="tR analyte" value={gcKov.tR_analyte} onChange={v => setGcKov(p => ({ ...p, tR_analyte: v }))} unit="min" required />
                <InputField label="tR alcane Cn" value={gcKov.tR_n} onChange={v => setGcKov(p => ({ ...p, tR_n: v }))} unit="min" required />
                <InputField label="tR alcane Cn+1" value={gcKov.tR_n1} onChange={v => setGcKov(p => ({ ...p, tR_n1: v }))} unit="min" required />
                <InputField label="n (C)" value={gcKov.n} onChange={v => setGcKov(p => ({ ...p, n: v }))} required />
              </div>
              <button
                onClick={handleGCKovats}
                disabled={!isFilled([gcKov.tR_analyte, gcKov.tR_n, gcKov.tR_n1, gcKov.n], 4)}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <FlaskConical className="w-4 h-4" /> Calculer I
              </button>
            </div>
            {gcKovResult && (
              <ResultCard
                results={[{ label: 'Indice de Kovats I', value: gcKovResult.I }]}
                interpretation={gcKovResult.interpretation}
              />
            )}
          </div>
        </div>

        {/* TLC */}
        <div className={mainTab === 'tlc' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0f172a]">Chromatographie sur couche mince</h2>
                <span className="text-[11px] bg-[#7c3aed] text-white px-2 py-0.5 rounded-full font-medium">TLC</span>
              </div>
              <p className="text-[13px] text-[#475569] mb-5">Calcul du Rf et interprétation.</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Distance analyte" value={tlc.d_analyte} onChange={v => setTlc(p => ({ ...p, d_analyte: v }))} unit="cm" required />
                <InputField label="Distance front" value={tlc.d_front} onChange={v => setTlc(p => ({ ...p, d_front: v }))} unit="cm" required />
                <InputField label="Distance départ (optionnel)" value={tlc.d_start} onChange={v => setTlc(p => ({ ...p, d_start: v }))} unit="cm" />
              </div>
              <button
                onClick={handleTLC}
                disabled={!isFilled([tlc.d_analyte, tlc.d_front], 2)}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <FlaskConical className="w-4 h-4" /> Calculer Rf
              </button>
            </div>
            {tlcResult && (
              <ResultCard
                results={[{ label: 'Rf', value: tlcResult.Rf }]}
                interpretation={tlcResult.interpretation}
                formula="Rf = (d_analyte - d_départ) / (d_front - d_départ)"
              />
            )}
          </div>
        </div>

        {/* Paramètres colonne */}
        <div className={mainTab === 'colonne' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Paramètres de colonne</h2>
              <p className="text-[13px] text-[#475569] mb-5">Volume mort, vitesse linéaire, etc.</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Diamètre" value={colParams.diameter} onChange={v => setColParams(p => ({ ...p, diameter: v }))} unit="mm" required />
                <InputField label="Longueur" value={colParams.length} onChange={v => setColParams(p => ({ ...p, length: v }))} unit="mm" required />
                <InputField label="Débit" value={colParams.flowRate} onChange={v => setColParams(p => ({ ...p, flowRate: v }))} unit="mL/min" required />
                <InputField label="Taille particules (opt)" value={colParams.particleSize} onChange={v => setColParams(p => ({ ...p, particleSize: v }))} unit="μm" />
              </div>
              <button
                onClick={handleColParams}
                disabled={!isFilled([colParams.diameter, colParams.length, colParams.flowRate], 3)}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <FlaskConical className="w-4 h-4" /> Calculer
              </button>
            </div>
            {colParamsResult && (
              <ResultCard
                results={[
                  { label: 'Volume mort V₀', value: colParamsResult.V0, unit: 'mm³' },
                  { label: 'Vitesse linéaire u', value: colParamsResult.u, unit: 'mm/min' },
                ]}
                interpretation={colParamsResult.interpretation}
              />
            )}
          </div>
        </div>

        {/* Aire du pic et régression */}
        <div className={mainTab === 'aire' ? 'mt-6 space-y-6' : 'hidden'}>
          <div className="grid grid-cols-1 xl:grid-cols-[38%_62%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0f172a]">Étalonnage par aire du pic</h2>
                <span className="text-[11px] bg-[#0d9488] text-white px-2 py-0.5 rounded-full font-medium">HPLC / GC</span>
              </div>
              <p className="text-[13px] text-[#475569] mb-5">Saisissez les concentrations et les aires mesurées pour vérifier la linéarité de la méthode.</p>
              <div className="space-y-2">
                {peakPoints.map((point, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                    <InputField label={index === 0 ? 'Concentration' : ''} value={point.concentration} onChange={value => updatePeakPoint(index, 'concentration', value)} unit="mg/L" required />
                    <InputField label={index === 0 ? 'Aire du pic' : ''} value={point.absorbance} onChange={value => updatePeakPoint(index, 'absorbance', value)} unit="u.a." required />
                    <button
                      type="button"
                      aria-label={`Supprimer le point ${index + 1}`}
                      onClick={() => setPeakPoints(points => points.filter((_, pointIndex) => pointIndex !== index))}
                      disabled={peakPoints.length <= 2}
                      className="h-10 w-10 mb-0.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setPeakPoints(points => [...points, { concentration: 0, absorbance: 0 }])} className="flex-1 h-10 border border-[#cbd5e1] rounded-md text-[13px] text-[#475569] hover:bg-slate-50 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Ajouter un point
                </button>
                <button type="button" onClick={handlePeakRegression} disabled={peakPoints.length < 2} className="flex-1 h-10 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-md text-[13px] font-medium disabled:opacity-50">
                  Calculer la régression
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm min-h-[420px]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#0f172a]">Aire du pic en fonction de la concentration</h2>
                  <p className="text-[13px] text-[#475569]">La droite montre la tendance linéaire calculée.</p>
                </div>
                {peakRegression && <div className="text-right text-[12px] text-[#475569]"><div className="font-mono">{peakRegression.equation.replace('A =', 'Aire =')}</div><div className="font-semibold text-[#0d9488]">R² = {peakRegression.r2}</div></div>}
              </div>
              <div className="h-[320px] w-full">
                {mainTab === 'aire' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={peakChartData} margin={{ top: 12, right: 20, left: 4, bottom: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="concentration" type="number" name="Concentration" unit=" mg/L" tick={{ fontSize: 11 }} label={{ value: 'Concentration (mg/L)', position: 'insideBottom', offset: -6, fontSize: 12 }} />
                      <YAxis dataKey="area" type="number" name="Aire" unit=" u.a." tick={{ fontSize: 11 }} label={{ value: 'Aire du pic (u.a.)', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                      <ChartTooltip formatter={(value: number, name: string) => [value.toFixed(2), name === 'area' ? 'Aire mesurée' : 'Régression']} />
                      <Scatter name="Aire mesurée" dataKey="area" fill="#0d9488" />
                      {peakRegression && <Line name="Régression" type="linear" dataKey="regression" stroke="#1e3a5f" strokeWidth={2} dot={false} />}
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
              {!peakRegression && <p className="text-center text-[12px] text-[#64748b]">Cliquez sur « Calculer la régression » pour afficher la droite et R².</p>}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
