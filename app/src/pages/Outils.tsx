import { useState, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultCard, InputField } from '@/components/CalculationCard';
import { convertUnit, calculateStatistics, calculateCascadeDilution } from '@/lib/calculations';
import type { CascadeStep, StatisticsResult } from '@/types';
import { Wrench, ArrowRight, Plus, Trash2, Calculator, Sigma } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONV_CATEGORIES = [
  { key: 'mass', label: 'Masse', units: ['kg', 'g', 'mg', 'μg', 'ng'] },
  { key: 'volume', label: 'Volume', units: ['L', 'mL', 'μL', 'nL'] },
  { key: 'pressure', label: 'Pression', units: ['Pa', 'kPa', 'bar', 'mbar', 'atm', 'psi', 'mmHg'] },
  { key: 'temperature', label: 'Température', units: ['°C', '°F', 'K'] },
  { key: 'wavelength', label: 'Longueur d\'onde', units: ['nm', 'μm', 'cm⁻¹', 'eV'] },
];

export default function Outils() {
  const [mainTab, setMainTab] = useState('convertisseur');

  // Convertisseur
  const [convCategory, setConvCategory] = useState('mass');
  const [convValue, setConvValue] = useState('');
  const [convFrom, setConvFrom] = useState('');
  const [convTo, setConvTo] = useState('');
  const [convResult, setConvResult] = useState<number | null>(null);

  // Statistiques
  const [statsInput, setStatsInput] = useState('');
  const [statsResult, setStatsResult] = useState<StatisticsResult | null>(null);

  // Cascade
  const [cascadeSteps, setCascadeSteps] = useState<CascadeStep[]>([
    { step: 1, C_input: undefined, dilutionFactor: 10, V_taken: 1, V_final: 10 },
  ]);
  const [cascadeCInput, setCascadeCInput] = useState('');
  const [cascadeResult, setCascadeResult] = useState<CascadeStep[] | null>(null);

  const currentCategory = CONV_CATEGORIES.find(c => c.key === convCategory);

  const handleConvert = useCallback(() => {
    if (!convValue || !convFrom || !convTo) return;
    const r = convertUnit(parseFloat(convValue), convFrom, convTo, convCategory);
    setConvResult(r);
  }, [convValue, convFrom, convTo, convCategory]);

  const handleStats = useCallback(() => {
    const values = statsInput
      .split(/[;,\s\n]+/)
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v));
    if (values.length === 0) return;
    const r = calculateStatistics({ values });
    setStatsResult(r);
  }, [statsInput]);

  const handleCascade = useCallback(() => {
    const steps = cascadeSteps.map(s => ({
      ...s,
      C_input: s.step === 1 ? parseFloat(cascadeCInput) : undefined,
    }));
    const r = calculateCascadeDilution(steps);
    setCascadeResult(r);
  }, [cascadeSteps, cascadeCInput]);

  const addCascadeStep = () => {
    setCascadeSteps(p => [...p, {
      step: p.length + 1,
      dilutionFactor: 10,
      V_taken: 1,
      V_final: 10,
    }]);
  };
  const removeCascadeStep = (i: number) => {
    if (cascadeSteps.length > 1) {
      setCascadeSteps(p => p.filter((_, j) => j !== i).map((s, j) => ({ ...s, step: j + 1 })));
    }
  };
  const updateCascadeStep = (i: number, field: keyof CascadeStep, value: number) => {
    setCascadeSteps(p => p.map((s, j) => j === i ? { ...s, [field]: value } : s));
  };

  const totalDilutionFactor = useMemo(() => {
    if (!cascadeResult) return 1;
    return cascadeResult.reduce((acc, s) => acc * (s.dilutionFactor || 1), 1);
  }, [cascadeResult]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="bg-white border border-[#e2e8f0] p-1 rounded-lg h-auto">
          <TabsTrigger value="convertisseur" className="text-[13px] px-4 py-2 data-[state=active]:text-[#f59e0b] data-[state=active]:border-b-2 data-[state=active]:border-[#f59e0b] rounded-none">Convertisseur</TabsTrigger>
          <TabsTrigger value="cascade" className="text-[13px] px-4 py-2 data-[state=active]:text-[#f59e0b] data-[state=active]:border-b-2 data-[state=active]:border-[#f59e0b] rounded-none">Dilutions cascade</TabsTrigger>
          <TabsTrigger value="statistiques" className="text-[13px] px-4 py-2 data-[state=active]:text-[#f59e0b] data-[state=active]:border-b-2 data-[state=active]:border-[#f59e0b] rounded-none">Statistiques</TabsTrigger>
        </TabsList>

        {/* Convertisseur */}
        <div className={mainTab === 'convertisseur' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Convertisseur d&apos;unités</h2>
              <p className="text-[13px] text-[#475569] mb-5">Conversion rapide entre unités scientifiques.</p>

              <div className="mb-4">
                <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">Catégorie</label>
                <div className="flex gap-2 flex-wrap">
                  {CONV_CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => { setConvCategory(cat.key); setConvFrom(''); setConvTo(''); setConvResult(null); }}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-colors ${
                        convCategory === cat.key
                          ? 'bg-[#f59e0b] text-white border-[#f59e0b]'
                          : 'bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f8fafc]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div>
                  <InputField label="Valeur" value={convValue} onChange={setConvValue} required />
                </div>
                <div className="pb-2">
                  <ArrowRight className="w-5 h-5 text-[#94a3b8]" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">Résultat</label>
                  <div className="h-10 px-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md flex items-center font-mono text-[14px] text-[#0f172a]">
                    {convResult !== null ? convResult.toExponential(4) : '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">De</label>
                  <select
                    value={convFrom}
                    onChange={e => setConvFrom(e.target.value)}
                    className="w-full h-10 px-3 text-[14px] bg-white border border-[#cbd5e1] rounded-md focus:outline-none focus:border-[#f59e0b]"
                  >
                    <option value="">Choisir...</option>
                    {currentCategory?.units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">Vers</label>
                  <select
                    value={convTo}
                    onChange={e => setConvTo(e.target.value)}
                    className="w-full h-10 px-3 text-[14px] bg-white border border-[#cbd5e1] rounded-md focus:outline-none focus:border-[#f59e0b]"
                  >
                    <option value="">Choisir...</option>
                    {currentCategory?.units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={!convValue || !convFrom || !convTo}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Wrench className="w-4 h-4" /> Convertir
              </button>
            </div>

            {convResult !== null && (
              <div className="bg-[#ecfdf5] rounded-xl p-5 border border-[#99f6e4]">
                <h3 className="text-[15px] font-semibold text-[#0f172a] mb-4">Résultat</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-[#99f6e4]/50">
                    <span className="text-[13px] text-[#475569]">Valeur d&apos;entrée</span>
                    <span className="font-mono text-[14px] font-semibold text-[#0f172a]">
                      {convValue} {convFrom}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#99f6e4]/50">
                    <span className="text-[13px] text-[#475569]">Valeur convertie</span>
                    <span className="font-mono text-[18px] font-semibold text-[#0f172a]">
                      {convResult.toExponential(4)} {convTo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[13px] text-[#475569]">Catégorie</span>
                    <span className="text-[13px] font-medium text-[#0f172a]">{currentCategory?.label}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cascade */}
        <div className={mainTab === 'cascade' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Dilutions en cascade</h2>
              <p className="text-[13px] text-[#475569] mb-5">Série de dilutions successives.</p>

              <div className="mb-4">
                <InputField label="Concentration initiale" value={cascadeCInput} onChange={setCascadeCInput} required />
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#475569]">Étapes de dilution</span>
                <Button size="sm" variant="ghost" onClick={addCascadeStep} className="h-7 text-[12px] gap-1">
                  <Plus className="w-3.5 h-3.5" /> Ajouter étape
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead className="bg-[#f8fafc]">
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="px-2 py-2 text-left text-[11px] font-medium text-[#475569]">Étape</th>
                      <th className="px-2 py-2 text-left text-[11px] font-medium text-[#475569]">FD</th>
                      <th className="px-2 py-2 text-left text-[11px] font-medium text-[#475569]">V prélevé</th>
                      <th className="px-2 py-2 text-left text-[11px] font-medium text-[#475569]">V final</th>
                      <th className="px-1 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {cascadeSteps.map((step, i) => (
                      <tr key={i} className="hover:bg-[#f8fafc]">
                        <td className="px-2 py-1.5 text-[#475569] font-mono text-[12px]">{step.step}</td>
                        <td className="px-1 py-1.5">
                          <input
                            type="number"
                            step="any"
                            value={step.dilutionFactor || ''}
                            onChange={e => updateCascadeStep(i, 'dilutionFactor', parseFloat(e.target.value) || 0)}
                            className="w-16 h-8 px-1.5 text-[12px] border border-[#e2e8f0] rounded focus:outline-none focus:border-[#f59e0b]"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <input
                            type="number"
                            step="any"
                            value={step.V_taken || ''}
                            onChange={e => updateCascadeStep(i, 'V_taken', parseFloat(e.target.value) || 0)}
                            className="w-16 h-8 px-1.5 text-[12px] border border-[#e2e8f0] rounded focus:outline-none focus:border-[#f59e0b]"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <input
                            type="number"
                            step="any"
                            value={step.V_final || ''}
                            onChange={e => updateCascadeStep(i, 'V_final', parseFloat(e.target.value) || 0)}
                            className="w-16 h-8 px-1.5 text-[12px] border border-[#e2e8f0] rounded focus:outline-none focus:border-[#f59e0b]"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          {cascadeSteps.length > 1 && (
                            <button onClick={() => removeCascadeStep(i)} className="text-[#94a3b8] hover:text-[#e11d48]">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleCascade}
                disabled={!cascadeCInput || cascadeSteps.length === 0}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Calculator className="w-4 h-4" /> Calculer la cascade
              </button>
            </div>

            {cascadeResult && cascadeResult.length > 0 && (
              <div className="space-y-4">
                <div className="bg-[#ecfdf5] rounded-xl p-5 border border-[#99f6e4]">
                  <h3 className="text-[15px] font-semibold text-[#0f172a] mb-3">Résultats</h3>
                  <div className="space-y-2">
                    {cascadeResult.map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-[#99f6e4]/50 last:border-0">
                        <span className="text-[12px] text-[#475569]">Étape {r.step}</span>
                        <span className="font-mono text-[13px] font-semibold text-[#0f172a]">
                          C = {r.C_output?.toExponential(3) || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#99f6e4] flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#0f172a]">Facteur total</span>
                    <span className="font-mono text-[16px] font-bold text-[#059669]">
                      ×{totalDilutionFactor.toExponential(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className={mainTab === 'statistiques' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Statistiques analytiques</h2>
              <p className="text-[13px] text-[#475569] mb-5">Collez une série de valeurs séparées par des virgules, espaces ou retours à la ligne.</p>

              <div className="mb-4">
                <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">Série de valeurs</label>
                <textarea
                  value={statsInput}
                  onChange={e => setStatsInput(e.target.value)}
                  placeholder="Ex: 10.2, 10.5, 10.1, 10.3, 10.4"
                  rows={5}
                  className="w-full px-3 py-2 text-[14px] bg-white border border-[#cbd5e1] rounded-md
                    focus:outline-none focus:border-[#f59e0b] focus:ring-[3px] focus:ring-[rgba(245,158,11,0.1)]
                    transition-all placeholder:text-[#94a3b8] resize-y font-mono"
                />
              </div>

              <button
                onClick={handleStats}
                disabled={!statsInput.trim()}
                className="w-full h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Sigma className="w-4 h-4" /> Calculer les statistiques
              </button>
            </div>

            {statsResult && (
              <ResultCard
                results={[
                  { label: 'n', value: statsResult.n },
                  { label: 'Moyenne', value: statsResult.mean },
                  { label: 'Écart-type', value: statsResult.stdDev },
                  { label: 'RSD (%)', value: statsResult.rsd, unit: '%' },
                  { label: 'Minimum', value: statsResult.min },
                  { label: 'Maximum', value: statsResult.max },
                  { label: 'Médiane', value: statsResult.median },
                  { label: 'IC 95%', value: statsResult.ci95 },
                ]}
                interpretation={statsResult.interpretation}
              />
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
