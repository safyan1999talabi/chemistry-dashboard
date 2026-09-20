import { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultCard, InputField } from '@/components/CalculationCard';
import { calculateTitration, calculateGravimetry, GRAVIMETRIC_FACTORS } from '@/lib/calculations';
import type { TitrationType, TitrationResult, GravimetryResult } from '@/types';
import { Droplet, Weight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Calculs() {
  const [mainTab, setMainTab] = useState('titrage');

  // Titrage
  const [titrType, setTitrType] = useState<TitrationType>('acidbase');
  const [titrInput, setTitrInput] = useState({ C_titrant: '', V_titrant: '', V_ech: '', n: '1' });
  const [titrResult, setTitrResult] = useState<TitrationResult | null>(null);

  // Gravimétrie
  const [gravInput, setGravInput] = useState({ massPrecipitate: '', massSample: '', gravFactor: '' });
  const [gravFactorName, setGravFactorName] = useState('');
  const [gravResult, setGravResult] = useState<GravimetryResult | null>(null);

  const handleTitration = useCallback(() => {
    const r = calculateTitration({
      type: titrType,
      C_titrant: parseFloat(titrInput.C_titrant),
      V_titrant: parseFloat(titrInput.V_titrant),
      V_ech: parseFloat(titrInput.V_ech),
      n: parseFloat(titrInput.n) || 1,
    });
    setTitrResult(r);
  }, [titrType, titrInput]);

  const handleGravimetry = useCallback(() => {
    const fg = gravFactorName ? GRAVIMETRIC_FACTORS[gravFactorName] : parseFloat(gravInput.gravFactor);
    const r = calculateGravimetry({
      massPrecipitate: parseFloat(gravInput.massPrecipitate),
      massSample: parseFloat(gravInput.massSample),
      gravimetricFactor: fg,
    });
    setGravResult(r);
  }, [gravInput, gravFactorName]);

  const isFilled = (vals: string[], count: number) => vals.filter(v => v !== '').length >= count;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="bg-white border border-[#e2e8f0] p-1 rounded-lg h-auto">
          <TabsTrigger value="titrage" className="text-[13px] px-4 py-2 data-[state=active]:text-[#2a5298] data-[state=active]:border-b-2 data-[state=active]:border-[#2a5298] rounded-none">Titrage</TabsTrigger>
          <TabsTrigger value="gravimetrie" className="text-[13px] px-4 py-2 data-[state=active]:text-[#2a5298] data-[state=active]:border-b-2 data-[state=active]:border-[#2a5298] rounded-none">Gravimétrie</TabsTrigger>
        </TabsList>

        {/* Titrage */}
        <div className={mainTab === 'titrage' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0f172a]">Calculs de titrage</h2>
                <span className="text-[11px] bg-[#2a5298] text-white px-2 py-0.5 rounded-full font-medium">Analyse</span>
              </div>
              <p className="text-[13px] text-[#475569] mb-5">Détermination de concentration par titrage.</p>

              <div className="mb-4">
                <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">Type de titrage</label>
                <Select value={titrType} onValueChange={(v) => setTitrType(v as TitrationType)}>
                  <SelectTrigger className="h-10 text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acidbase">Acide-base</SelectItem>
                    <SelectItem value="redox">Redox</SelectItem>
                    <SelectItem value="complexo">Complexométrie</SelectItem>
                    <SelectItem value="precipitation">Précipitation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="C titrant" value={titrInput.C_titrant} onChange={v => setTitrInput(p => ({ ...p, C_titrant: v }))} unit="mol/L" required />
                <InputField label="V titrant versé" value={titrInput.V_titrant} onChange={v => setTitrInput(p => ({ ...p, V_titrant: v }))} unit="mL" required />
                <InputField label="V échantillon" value={titrInput.V_ech} onChange={v => setTitrInput(p => ({ ...p, V_ech: v }))} unit="mL" required />
                <InputField label="Facteur stœchiométrique (n)" value={titrInput.n} onChange={v => setTitrInput(p => ({ ...p, n: v }))} required />
              </div>

              <button
                onClick={handleTitration}
                disabled={!isFilled([titrInput.C_titrant, titrInput.V_titrant, titrInput.V_ech], 3)}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Droplet className="w-4 h-4" /> Calculer
              </button>
            </div>
            {titrResult && (
              <ResultCard
                results={[{ label: 'Concentration échantillon', value: titrResult.C_ech, unit: 'mol/L' }]}
                interpretation={titrResult.interpretation}
                formula="C_ech = (C_titrant × V_titrant × n) / V_ech"
              />
            )}
          </div>
        </div>

        {/* Gravimétrie */}
        <div className={mainTab === 'gravimetrie' ? 'mt-6' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0f172a]">Analyse gravimétrique</h2>
                <span className="text-[11px] bg-[#475569] text-white px-2 py-0.5 rounded-full font-medium">Analyse</span>
              </div>
              <p className="text-[13px] text-[#475569] mb-5">Détermination par pesée du précipité.</p>

              <div className="mb-4">
                <label className="text-[12px] font-medium text-[#475569] mb-1.5 block">Facteur gravimétrique (prédéfini)</label>
                <Select value={gravFactorName} onValueChange={setGravFactorName}>
                  <SelectTrigger className="h-10 text-[14px]">
                    <SelectValue placeholder="Sélectionner ou saisir manuellement" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GRAVIMETRIC_FACTORS).map(([name, val]) => (
                      <SelectItem key={name} value={name}>{name} (FG={val})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Masse précipité" value={gravInput.massPrecipitate} onChange={v => setGravInput(p => ({ ...p, massPrecipitate: v }))} unit="g" required />
                <InputField label="Masse échantillon" value={gravInput.massSample} onChange={v => setGravInput(p => ({ ...p, massSample: v }))} unit="g" required />
                {!gravFactorName && (
                  <InputField label="Facteur gravimétrique (FG)" value={gravInput.gravFactor} onChange={v => setGravInput(p => ({ ...p, gravFactor: v }))} required />
                )}
              </div>

              <button
                onClick={handleGravimetry}
                disabled={!gravInput.massPrecipitate || !gravInput.massSample || (!gravFactorName && !gravInput.gravFactor)}
                className="w-full mt-5 h-11 bg-[#1e3a5f] hover:bg-[#2a5298] text-white rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium disabled:opacity-50 transition-colors"
              >
                <Weight className="w-4 h-4" /> Calculer
              </button>
            </div>
            {gravResult && (
              <ResultCard
                results={[{ label: '% analyte', value: gravResult.percentage, unit: '%' }]}
                interpretation={gravResult.interpretation}
                formula="% = (masse précipité × FG) / masse échantillon × 100"
              />
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
