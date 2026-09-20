import { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultCard, InputField } from '@/components/CalculationCard';
import { calculateDilution, calculateSolutionMass } from '@/lib/calculations';
import { Beaker, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CalibrationPoint } from '@/types';

export default function Preparation() {
  const [mainTab, setMainTab] = useState('dilution');

  // Dilution C1V1=C2V2
  const [dilInput, setDilInput] = useState({ C1: '', V1: '', C2: '', V2: '', calcWhat: 'V2' as string });
  const [dilResult, setDilResult] = useState<number | null>(null);
  const [dilLabel, setDilLabel] = useState('');

  // Solution mère
  const [solInput, setSolInput] = useState({ C: '', V: '', M: '' });
  const [solResult, setSolResult] = useState<number | null>(null);

  // Solution étalon
  const [etalonPoints, setEtalonPoints] = useState<CalibrationPoint[]>([
    { concentration: 0, absorbance: 0 },
    { concentration: 0, absorbance: 0 },
    { concentration: 0, absorbance: 0 },
  ]);
  const [C_mere, setC_mere] = useState('');
  const [V_final, setV_final] = useState('');
  const [etalonResults, setEtalonResults] = useState<{ V_preleve: number; C_etalon: number }[] | null>(null);

  const handleDilution = useCallback(() => {
    const input = {
      C1: dilInput.calcWhat !== 'C1' ? parseFloat(dilInput.C1) || undefined : undefined,
      V1: dilInput.calcWhat !== 'V1' ? parseFloat(dilInput.V1) || undefined : undefined,
      C2: dilInput.calcWhat !== 'C2' ? parseFloat(dilInput.C2) || undefined : undefined,
      V2: dilInput.calcWhat !== 'V2' ? parseFloat(dilInput.V2) || undefined : undefined,
    };
    const r = calculateDilution(input);
    setDilResult(r);
    const labels: Record<string, string> = { C1: 'C1', V1: 'V1', C2: 'C2', V2: 'V2' };
    setDilLabel(labels[dilInput.calcWhat] || '');
  }, [dilInput]);

  const handleSolution = useCallback(() => {
    const r = calculateSolutionMass({
      concentration: parseFloat(solInput.C),
      volume: parseFloat(solInput.V),
      molarMass: parseFloat(solInput.M),
    });
    setSolResult(r);
  }, [solInput]);

  const handleEtalon = useCallback(() => {
    const Cm = parseFloat(C_mere);
    const Vf = parseFloat(V_final);
    const results = etalonPoints
      .filter(p => p.concentration > 0)
      .map(p => {
        const V_preleve = (p.concentration * Vf) / Cm;
        return { V_preleve, C_etalon: p.concentration };
      });
    setEtalonResults(results);
  }, [etalonPoints, C_mere, V_final]);

  const updateEtalon = (i: number, field: keyof CalibrationPoint, value: number) => {
    setEtalonPoints(p => p.map((pt, j) => j === i ? { ...pt, [field]: value } : pt));
  };
  const addEtalon = () => setEtalonPoints(p => [...p, { concentration: 0, absorbance: 0 }]);
  const removeEtalon = (i: number) => etalonPoints.length > 1 && setEtalonPoints(p => p.filter((_, j) => j !== i));

  const isFilled = (vals: string[], count: number) => vals.filter(v => v !== '').length >= count;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="bg-white border border-[#e2e8f0] p-1 rounded-lg h-auto">
          <TabsTrigger value="dilution" className="text-[13px] px-4 py-2 data-[state=active]:text-[#0d9488] data-[state=active]:border-b-2 data-[state=active]:border-[#0d9488] rounded-none">Dilution</TabsTrigger>
          <TabsTrigger value="solution" className="text-[13px] px-4 py-2 data-[state=active]:text-[#0d9488] data-[state=active]:border-b-2 data-[state=active]:border-[#0d9488] rounded-none">Solution mère</TabsTrigger>
          <TabsTrigger value="etalon" className="text-[13px] px-4 py-2 data-[state=active]:text-[#0d9488] data-[state=active]:border-b-2 data-[state=active]:border-[#0d9488] rounded-none">Solutions étalons</TabsTrigger>
        </TabsList>

        {/* Dilution */}
        <div className={mainTab === 'dilution' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Dilution C₁V₁ = C₂V₂</h2>
              <p className="text-[13px] text-[#475569] mb-5">Saisissez 3 valeurs sur 4 pour calculer la quatrième.</p>

              <div className="mb-4">
                <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">Variable à calculer</label>
                <div className="flex gap-2 flex-wrap">
                  {(['C1', 'V1', 'C2', 'V2'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setDilInput(p => ({ ...p, calcWhat: v }))}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-colors ${
                        dilInput.calcWhat === v
                          ? 'bg-[#0d9488] text-white border-[#0d9488]'
                          : 'bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f8fafc]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {dilInput.calcWhat !== 'C1' && (
                  <InputField label="C₁ (concentration initiale)" value={dilInput.C1} onChange={v => setDilInput(p => ({ ...p, C1: v }))} required />
                )}
                {dilInput.calcWhat !== 'V1' && (
                  <InputField label="V₁ (volume initial)" value={dilInput.V1} onChange={v => setDilInput(p => ({ ...p, V1: v }))} unit="mL" required />
                )}
                {dilInput.calcWhat !== 'C2' && (
                  <InputField label="C₂ (concentration finale)" value={dilInput.C2} onChange={v => setDilInput(p => ({ ...p, C2: v }))} required />
                )}
                {dilInput.calcWhat !== 'V2' && (
                  <InputField label="V₂ (volume final)" value={dilInput.V2} onChange={v => setDilInput(p => ({ ...p, V2: v }))} unit="mL" required />
                )}
              </div>

              <button
                onClick={handleDilution}
                disabled={isFilled([dilInput.C1, dilInput.V1, dilInput.C2, dilInput.V2].filter((_, i) => ['C1', 'V1', 'C2', 'V2'][i] !== dilInput.calcWhat), 3)}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Beaker className="w-4 h-4" /> Calculer {dilLabel}
              </button>
            </div>
            {dilResult !== null && (
              <ResultCard
                results={[{ label: `Valeur de ${dilLabel}`, value: dilResult }]}
                formula="C₁V₁ = C₂V₂"
              />
            )}
          </div>
        </div>

        {/* Solution mère */}
        <div className={mainTab === 'solution' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Préparation de solution mère</h2>
              <p className="text-[13px] text-[#475569] mb-5">Masse à peser = C × V × Masse molaire.</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Concentration souhaitée (C)" value={solInput.C} onChange={v => setSolInput(p => ({ ...p, C: v }))} unit="mol/L" required />
                <InputField label="Volume (V)" value={solInput.V} onChange={v => setSolInput(p => ({ ...p, V: v }))} unit="L" required />
                <InputField label="Masse molaire (M)" value={solInput.M} onChange={v => setSolInput(p => ({ ...p, M: v }))} unit="g/mol" required />
              </div>
              <button
                onClick={handleSolution}
                disabled={!isFilled([solInput.C, solInput.V, solInput.M], 3)}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Beaker className="w-4 h-4" /> Calculer la masse
              </button>
            </div>
            {solResult !== null && (
              <ResultCard
                results={[{ label: 'Masse à peser', value: solResult, unit: 'g' }]}
                formula="m = C × V × M"
              />
            )}
          </div>
        </div>

        {/* Solutions étalons */}
        <div className={mainTab === 'etalon' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Préparation de solutions étalons</h2>
              <p className="text-[13px] text-[#475569] mb-5">Dilutions depuis solution mère.</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <InputField label="C mère" value={C_mere} onChange={setC_mere} unit="mg/L" required />
                <InputField label="Volume final (Vf)" value={V_final} onChange={setV_final} unit="mL" required />
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#475569]">Concentrations étalons souhaitées</span>
                <Button size="sm" variant="ghost" onClick={addEtalon} className="h-7 text-[12px] gap-1">
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden mb-4">
                <table className="w-full text-[13px]">
                  <thead className="bg-[#f8fafc]">
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-[#475569] uppercase">N°</th>
                      <th className="px-3 py-2 text-left text-[11px] font-medium text-[#475569] uppercase">C étalon (mg/L)</th>
                      <th className="px-2 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {etalonPoints.map((pt, i) => (
                      <tr key={i} className="hover:bg-[#f8fafc]">
                        <td className="px-3 py-1.5 text-[#475569]">{i + 1}</td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            step="any"
                            value={pt.concentration || ''}
                            onChange={e => updateEtalon(i, 'concentration', parseFloat(e.target.value) || 0)}
                            className="w-full h-8 px-2 text-[13px] border border-[#e2e8f0] rounded focus:outline-none focus:border-[#0d9488]"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          {etalonPoints.length > 1 && (
                            <button onClick={() => removeEtalon(i)} className="text-[#94a3b8] hover:text-[#e11d48]">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleEtalon}
                disabled={!C_mere || !V_final}
                className="w-full h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Beaker className="w-4 h-4" /> Calculer les volumes
              </button>
            </div>

            {etalonResults && etalonResults.length > 0 && (
              <div className="bg-[#ecfdf5] rounded-xl p-5 border border-[#99f6e4]">
                <h3 className="text-[15px] font-semibold text-[#0f172a] mb-4">Volumes à prélever</h3>
                <div className="space-y-2">
                  {etalonResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#99f6e4]/50 last:border-0">
                      <span className="text-[13px] text-[#475569]">Étalon {i + 1}: C = {r.C_etalon} mg/L</span>
                      <span className="font-mono text-[14px] font-semibold text-[#0f172a]">
                        V = {r.V_preleve.toFixed(3)} mL
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-[#475569] mt-3">
                  Compléter chaque fiole à {V_final} mL avec le solvant.
                </p>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
