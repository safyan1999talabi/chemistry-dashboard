import { useState, useCallback, useMemo } from 'react';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultCard, InputField } from '@/components/CalculationCard';
import {
  calculateBeerLambert, calculateColorimetry,
  searchIRGroups, IR_DATABASE, calculateMS, analyzeNMR,
} from '@/lib/calculations';
import { exportCalibrationToExcel } from '@/lib/export';
import type {
  BeerLambertResult, CalibrationPoint, IRFunctionalGroup,
  MSResult, NMRResult, ColorimetryResult,
} from '@/types';
import { Waves, Sun, Atom, Search, Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Spectrometrie() {
  const [mainTab, setMainTab] = useState('uv');
  const [uvTab, setUvTab] = useState('beer');

  // UV-Vis Beer-Lambert
  const [beerMode, setBeerMode] = useState<'concentration' | 'absorbance' | 'epsilon'>('concentration');
  const [beerInput, setBeerInput] = useState({ A: '', epsilon: '', l: '1', C: '' });
  const [beerResult, setBeerResult] = useState<BeerLambertResult | null>(null);

  // UV-Vis Calibration
  const [calibPoints, setCalibPoints] = useState<CalibrationPoint[]>([
    { concentration: 0, absorbance: 0 },
    { concentration: 2, absorbance: 0.15 },
    { concentration: 5, absorbance: 0.38 },
    { concentration: 10, absorbance: 0.72 },
  ]);
  const [unknownAbs, setUnknownAbs] = useState('');
  const [blankStd, setBlankStd] = useState('');
  const [calibResult, setCalibResult] = useState<ColorimetryResult | null>(null);

  // IR
  const [irWavenumber, setIrWavenumber] = useState('');
  const [irResults, setIrResults] = useState<IRFunctionalGroup[]>([]);

  // MS
  const [msInput, setMsInput] = useState({ molecularMass: '', fragmentMass: '', charge: '1' });
  const [msResult, setMsResult] = useState<MSResult | null>(null);

  // NMR
  const [nmrInput, setNmrInput] = useState({ delta: '', multiplicity: 's', integration: '' });
  const [nmrResult, setNmrResult] = useState<NMRResult | null>(null);

  const handleBeerLambert = useCallback(() => {
    const input = {
      mode: beerMode,
      l: parseFloat(beerInput.l) || 1,
      A: beerInput.A ? parseFloat(beerInput.A) : undefined,
      epsilon: beerInput.epsilon ? parseFloat(beerInput.epsilon) : undefined,
      C: beerInput.C ? parseFloat(beerInput.C) : undefined,
    };
    const r = calculateBeerLambert(input);
    setBeerResult(r);
  }, [beerMode, beerInput]);

  const canCalcBeer = useMemo(() => {
    if (beerMode === 'concentration') return beerInput.A && beerInput.epsilon && beerInput.l;
    if (beerMode === 'absorbance') return beerInput.epsilon && beerInput.C && beerInput.l;
    return beerInput.A && beerInput.C && beerInput.l;
  }, [beerMode, beerInput]);

  const handleCalibration = useCallback(() => {
    const input = {
      method: 'direct' as const,
      calibrationPoints: calibPoints.filter(p => p.concentration > 0 || p.absorbance > 0),
      unknownAbsorbance: unknownAbs ? parseFloat(unknownAbs) : undefined,
      blankStdDev: blankStd ? parseFloat(blankStd) : undefined,
    };
    const r = calculateColorimetry(input);
    setCalibResult(r);
  }, [calibPoints, unknownAbs, blankStd]);

  const addCalibPoint = () => setCalibPoints(p => [...p, { concentration: 0, absorbance: 0 }]);
  const removeCalibPoint = (i: number) => setCalibPoints(p => p.filter((_, j) => j !== i));
  const updateCalibPoint = (i: number, field: keyof CalibrationPoint, value: number) => {
    setCalibPoints(p => p.map((pt, j) => j === i ? { ...pt, [field]: value } : pt));
  };

  const calibrationLine = useMemo(() => {
    if (!calibResult) return [];
    const { slope, intercept } = calibResult.calibration;
    const points = calibPoints.filter(p => p.concentration > 0).map(p => ({
      x: p.concentration,
      y: slope * p.concentration + intercept,
    }));
    return points;
  }, [calibResult, calibPoints]);

  const handleIRSearch = useCallback(() => {
    if (!irWavenumber) return;
    const results = searchIRGroups(parseFloat(irWavenumber), 50);
    setIrResults(results);
  }, [irWavenumber]);

  const handleMS = useCallback(() => {
    const r = calculateMS({
      molecularMass: parseFloat(msInput.molecularMass),
      fragmentMass: parseFloat(msInput.fragmentMass),
      charge: parseInt(msInput.charge) || 1,
    });
    setMsResult(r);
  }, [msInput]);

  const handleNMR = useCallback(() => {
    const r = analyzeNMR({
      delta: parseFloat(nmrInput.delta),
      multiplicity: nmrInput.multiplicity,
      integration: nmrInput.integration ? parseFloat(nmrInput.integration) : undefined,
    });
    setNmrResult(r);
  }, [nmrInput]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="bg-white border border-[#e2e8f0] p-1 rounded-lg h-auto">
          <TabsTrigger value="uv" className="text-[13px] px-4 py-2 data-[state=active]:text-[#7c3aed] data-[state=active]:border-b-2 data-[state=active]:border-[#7c3aed] rounded-none">UV-Vis</TabsTrigger>
          <TabsTrigger value="ir" className="text-[13px] px-4 py-2 data-[state=active]:text-[#7c3aed] data-[state=active]:border-b-2 data-[state=active]:border-[#7c3aed] rounded-none">IR</TabsTrigger>
          <TabsTrigger value="ms" className="text-[13px] px-4 py-2 data-[state=active]:text-[#7c3aed] data-[state=active]:border-b-2 data-[state=active]:border-[#7c3aed] rounded-none">MS</TabsTrigger>
          <TabsTrigger value="nmr" className="text-[13px] px-4 py-2 data-[state=active]:text-[#7c3aed] data-[state=active]:border-b-2 data-[state=active]:border-[#7c3aed] rounded-none">NMR</TabsTrigger>
        </TabsList>

        {/* UV-Vis */}
        <div className={mainTab === 'uv' ? 'mt-6' : 'hidden'}>
          <Tabs value={uvTab} onValueChange={setUvTab}>
            <TabsList className="bg-transparent border-0 p-0 mb-4 gap-1 flex-wrap h-auto">
              {['beer', 'calibration'].map(tab => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="text-[12px] px-3 py-1.5 data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white rounded-md border border-[#e2e8f0] data-[state=active]:border-[#7c3aed]"
                >
                  {tab === 'beer' && 'Beer-Lambert'}
                  {tab === 'calibration' && "Courbe d'étalonnage"}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Beer-Lambert */}
            <div className={uvTab === 'beer' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-[#0f172a]">Loi de Beer-Lambert</h2>
                    <span className="text-[11px] bg-[#7c3aed] text-white px-2 py-0.5 rounded-full font-medium">UV-Vis</span>
                  </div>
                  <p className="text-[13px] text-[#475569] mb-4">A = ε × l × C. Relie l&apos;absorbance à la concentration.</p>

                  <div className="flex gap-2 mb-5">
                    {(['concentration', 'absorbance', 'epsilon'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setBeerMode(m)}
                        className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-colors ${
                          beerMode === m
                            ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                            : 'bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f8fafc]'
                        }`}
                      >
                        {m === 'concentration' && 'Concentration'}
                        {m === 'absorbance' && 'Absorbance'}
                        {m === 'epsilon' && 'Coefficient ε'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {beerMode !== 'absorbance' && (
                      <InputField label="Absorbance (A)" value={beerInput.A} onChange={v => setBeerInput(p => ({ ...p, A: v }))} placeholder="0-3" />
                    )}
                    {beerMode !== 'epsilon' && (
                      <InputField label="Coefficient ε" value={beerInput.epsilon} onChange={v => setBeerInput(p => ({ ...p, epsilon: v }))} unit="L.mol⁻¹.cm⁻¹" />
                    )}
                    <InputField label="Longueur trajet (l)" value={beerInput.l} onChange={v => setBeerInput(p => ({ ...p, l: v }))} unit="cm" required />
                    {beerMode !== 'concentration' && (
                      <InputField label="Concentration (C)" value={beerInput.C} onChange={v => setBeerInput(p => ({ ...p, C: v }))} unit="mol/L" />
                    )}
                  </div>

                  <button
                    onClick={handleBeerLambert}
                    disabled={!canCalcBeer}
                    className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
                  >
                    <Sun className="w-4 h-4" /> Calculer
                  </button>
                </div>

                {beerResult && (
                  <ResultCard
                    results={[{ label: beerResult.label, value: beerResult.value, unit: beerResult.unit }]}
                    interpretation={beerResult.interpretation}
                    formula={beerResult.formula}
                  />
                )}
              </div>
            </div>

            {/* Calibration */}
            <div className={uvTab === 'calibration' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-[#0f172a]">Courbe d&apos;étalonnage</h2>
                      <span className="text-[11px] bg-[#7c3aed] text-white px-2 py-0.5 rounded-full font-medium">UV-Vis</span>
                    </div>
                    <p className="text-[13px] text-[#475569]">Régression linéaire à partir de points étalons.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-medium text-[#475569]">Points d&apos;étalonnage</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={addCalibPoint} className="h-7 text-[12px] gap-1">
                          <Plus className="w-3.5 h-3.5" /> Ajouter
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-[13px]">
                        <thead className="bg-[#f8fafc]">
                          <tr className="border-b border-[#e2e8f0]">
                            <th className="px-3 py-2 text-left text-[11px] font-medium text-[#475569] uppercase">C (mg/L)</th>
                            <th className="px-3 py-2 text-left text-[11px] font-medium text-[#475569] uppercase">A</th>
                            <th className="px-2 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f1f5f9]">
                          {calibPoints.map((pt, i) => (
                            <tr key={i} className="hover:bg-[#f8fafc]">
                              <td className="px-2 py-1.5">
                                <input
                                  type="number"
                                  step="any"
                                  value={pt.concentration || ''}
                                  onChange={e => updateCalibPoint(i, 'concentration', parseFloat(e.target.value) || 0)}
                                  className="w-full h-8 px-2 text-[13px] border border-[#e2e8f0] rounded focus:outline-none focus:border-[#7c3aed]"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="number"
                                  step="any"
                                  value={pt.absorbance || ''}
                                  onChange={e => updateCalibPoint(i, 'absorbance', parseFloat(e.target.value) || 0)}
                                  className="w-full h-8 px-2 text-[13px] border border-[#e2e8f0] rounded focus:outline-none focus:border-[#7c3aed]"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                {calibPoints.length > 2 && (
                                  <button onClick={() => removeCalibPoint(i)} className="text-[#94a3b8] hover:text-[#e11d48]">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Absorbance inconnue (optionnel)" value={unknownAbs} onChange={setUnknownAbs} />
                    <InputField label="Écart-type blanc (optionnel)" value={blankStd} onChange={setBlankStd} />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCalibration}
                      disabled={calibPoints.length < 2}
                      className="flex-1 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
                    >
                      <Sun className="w-4 h-4" /> Calculer la régression
                    </button>
                    {calibResult && (
                      <Button
                        variant="outline"
                        onClick={() => exportCalibrationToExcel(
                          calibPoints, calibResult.calibration,
                          calibResult.concentration, calibResult.lod, calibResult.loq
                        )}
                        className="h-11 gap-1"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {calibResult && (
                  <div className="space-y-4">
                    <ResultCard
                      results={[
                        { label: 'Pente (a)', value: calibResult.calibration.slope },
                        { label: 'Ordonnée (b)', value: calibResult.calibration.intercept },
                        { label: 'R²', value: calibResult.calibration.r2 },
                        ...(calibResult.concentration !== undefined ? [{ label: 'Concentration inconnue', value: calibResult.concentration, unit: 'mg/L' }] : []),
                        ...(calibResult.lod !== undefined ? [{ label: 'LOD', value: calibResult.lod, unit: 'mg/L' }] : []),
                        ...(calibResult.loq !== undefined ? [{ label: 'LOQ', value: calibResult.loq, unit: 'mg/L' }] : []),
                      ]}
                      interpretation={calibResult.interpretation}
                      formula={calibResult.calibration.equation}
                    />
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h4 className="text-[13px] font-medium text-[#0f172a] mb-3">Graphique d&apos;étalonnage</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            type="number"
                            dataKey="concentration"
                            name="Concentration"
                            unit=" mg/L"
                            tick={{ fontSize: 11, fill: '#475569' }}
                          />
                          <YAxis
                            type="number"
                            dataKey="absorbance"
                            name="Absorbance"
                            tick={{ fontSize: 11, fill: '#475569' }}
                          />
                          <RTooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                            formatter={(value: number) => [value.toFixed(4), '']}
                          />
                          <Scatter
                            data={calibPoints.filter(p => p.concentration > 0 || p.absorbance > 0)}
                            fill="#7c3aed"
                          />
                          {calibrationLine.length > 0 && (
                            <Line
                              data={calibrationLine}
                              dataKey="y"
                              type="linear"
                              stroke="#0d9488"
                              strokeWidth={2}
                              dot={false}
                              name="Régression"
                            />
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </div>

        {/* IR */}
        <div className={mainTab === 'ir' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0f172a]">Analyse spectrométrique IR</h2>
                <span className="text-[11px] bg-[#e11d48] text-white px-2 py-0.5 rounded-full font-medium">IR</span>
              </div>
              <p className="text-[13px] text-[#475569] mb-5">Recherche de groupements fonctionnels par numéro d&apos;onde.</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <InputField
                    label="Nombre d'onde (cm⁻¹)"
                    value={irWavenumber}
                    onChange={setIrWavenumber}
                    placeholder="Entrez 400-4000"
                    required
                  />
                </div>
                <button
                  onClick={handleIRSearch}
                  disabled={!irWavenumber}
                  className="self-end h-10 px-4 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center gap-2 text-[13px] font-medium disabled:opacity-50 transition-colors"
                >
                  <Search className="w-4 h-4" /> Rechercher
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-[15px] font-semibold text-[#0f172a] mb-3">
                {irResults.length > 0
                  ? `${irResults.length} groupement(s) trouvé(s)`
                  : 'Base de données IR complète'}
              </h3>
              <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-[#f8fafc] sticky top-0">
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-[#475569] uppercase">Groupement</th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-[#475569] uppercase">Vibration</th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-[#475569] uppercase">Fourchette</th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-[#475569] uppercase">Intensité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {(irResults.length > 0 ? irResults : IR_DATABASE).map((group, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-[#f8fafc] transition-colors ${
                          irResults.length > 0 ? 'bg-[#faf5ff]' : ''
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-[#0f172a]">{group.group}</td>
                        <td className="px-3 py-2 text-[#475569]">{group.vibration}</td>
                        <td className="px-3 py-2 font-mono text-[12px] text-[#475569]">
                          {group.rangeMin}-{group.rangeMax} cm⁻¹
                        </td>
                        <td className="px-3 py-2 text-[#475569]">{group.intensity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* MS */}
        <div className={mainTab === 'ms' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0f172a]">Spectrométrie de masse</h2>
                <span className="text-[11px] bg-[#f59e0b] text-white px-2 py-0.5 rounded-full font-medium">MS</span>
              </div>
              <p className="text-[13px] text-[#475569] mb-5">Analyse de fragmentation et pertes communes.</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Masse moléculaire (m/z)" value={msInput.molecularMass} onChange={v => setMsInput(p => ({ ...p, molecularMass: v }))} required />
                <InputField label="Fragment observé (m/z)" value={msInput.fragmentMass} onChange={v => setMsInput(p => ({ ...p, fragmentMass: v }))} required />
                <InputField label="Charge z" value={msInput.charge} onChange={v => setMsInput(p => ({ ...p, charge: v }))} />
              </div>
              <button
                onClick={handleMS}
                disabled={!msInput.molecularMass || !msInput.fragmentMass}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Atom className="w-4 h-4" /> Analyser
              </button>
            </div>
            {msResult && (
              <ResultCard
                results={[
                  { label: 'Masse perdue', value: msResult.massLost, unit: 'Da' },
                ]}
                interpretation={msResult.interpretation}
              />
            )}
          </div>
        </div>

        {/* NMR */}
        <div className={mainTab === 'nmr' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0f172a]">Résonance magnétique nucléaire</h2>
                <span className="text-[11px] bg-[#059669] text-white px-2 py-0.5 rounded-full font-medium">NMR</span>
              </div>
              <p className="text-[13px] text-[#475569] mb-5">Attribution des signaux ¹H-RMN.</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Déplacement chimique δ" value={nmrInput.delta} onChange={v => setNmrInput(p => ({ ...p, delta: v }))} unit="ppm" required />
                <div>
                  <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">Multiplicité</label>
                  <select
                    value={nmrInput.multiplicity}
                    onChange={e => setNmrInput(p => ({ ...p, multiplicity: e.target.value }))}
                    className="w-full h-10 px-3 text-[14px] bg-white border border-[#cbd5e1] rounded-md focus:outline-none focus:border-[#0d9488]"
                  >
                    <option value="s">Singulet (s)</option>
                    <option value="d">Doublet (d)</option>
                    <option value="t">Triplet (t)</option>
                    <option value="q">Quadruplet (q)</option>
                    <option value="m">Multiplet (m)</option>
                  </select>
                </div>
                <InputField label="Intégration (optionnel)" value={nmrInput.integration} onChange={v => setNmrInput(p => ({ ...p, integration: v }))} unit="H" />
              </div>
              <button
                onClick={handleNMR}
                disabled={!nmrInput.delta}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Waves className="w-4 h-4" /> Analyser
              </button>
            </div>
            {nmrResult && (
              <div className="space-y-4">
                <ResultCard
                  results={nmrResult.assignments.map((a, i) => ({ label: `Attribution ${i + 1}`, value: 0, unit: a }))}
                  interpretation={nmrResult.interpretation}
                />
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="text-[13px] font-medium text-[#0f172a] mb-2">Règle n+1</h4>
                  <p className="text-[12px] text-[#475569]">
                    {nmrInput.multiplicity === 's' && 'Singulet: 0 voisin équivalent'}
                    {nmrInput.multiplicity === 'd' && 'Doublet: 1 voisin équivalent'}
                    {nmrInput.multiplicity === 't' && 'Triplet: 2 voisins équivalents'}
                    {nmrInput.multiplicity === 'q' && 'Quadruplet: 3 voisins équivalents'}
                    {nmrInput.multiplicity === 'm' && 'Multiplet: >3 voisins équivalents'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
