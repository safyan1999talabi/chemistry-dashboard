import { useState } from 'react';
import { ClipboardList, Plus, Trash2, TestTube } from 'lucide-react';

interface Sample {
  id: number;
  name: string;
  matrix: string;
  method: string;
  status: 'À préparer' | 'Prêt';
}

const initialSamples: Sample[] = [
  { id: 1, name: 'Échantillon S-001', matrix: 'Solution aqueuse', method: 'HPLC', status: 'À préparer' },
];

export default function Echantillons() {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [form, setForm] = useState({ name: '', matrix: '', method: 'HPLC' });

  const addSample = () => {
    if (!form.name.trim() || !form.matrix.trim()) return;
    setSamples(current => [...current, { id: Date.now(), ...form, status: 'À préparer' }]);
    setForm({ name: '', matrix: '', method: 'HPLC' });
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-[#0d9488]" />
            <h2 className="text-xl font-semibold text-[#0f172a]">Échantillons</h2>
          </div>
          <p className="text-[13px] text-[#475569] mt-1">Créez une fiche avant de lancer une préparation ou une analyse.</p>
        </div>
        <div className="text-right text-[12px] text-[#64748b]">{samples.length} échantillon{samples.length > 1 ? 's' : ''}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-6">
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-[15px] font-semibold text-[#0f172a] mb-1">Nouvel échantillon</h3>
          <p className="text-[12px] text-[#64748b] mb-5">Identifiez la matrice et la méthode prévue.</p>
          <div className="space-y-4">
            <label className="block text-[12px] font-medium text-[#475569]">Nom ou référence<input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Ex. S-002" className="mt-1.5 w-full h-10 px-3 text-[14px] border border-[#cbd5e1] rounded-md focus:outline-none focus:border-[#0d9488]" /></label>
            <label className="block text-[12px] font-medium text-[#475569]">Matrice<input value={form.matrix} onChange={event => setForm(current => ({ ...current, matrix: event.target.value }))} placeholder="Ex. Eau" className="mt-1.5 w-full h-10 px-3 text-[14px] border border-[#cbd5e1] rounded-md focus:outline-none focus:border-[#0d9488]" /></label>
            <label className="block text-[12px] font-medium text-[#475569]">Méthode<select value={form.method} onChange={event => setForm(current => ({ ...current, method: event.target.value }))} className="mt-1.5 w-full h-10 px-3 text-[14px] border border-[#cbd5e1] rounded-md bg-white focus:outline-none focus:border-[#0d9488]"><option>HPLC</option><option>GC</option><option>UV-Vis</option><option>IR</option><option>Titrage</option></select></label>
            <button type="button" onClick={addSample} disabled={!form.name.trim() || !form.matrix.trim()} className="w-full h-10 rounded-md bg-[#0d9488] hover:bg-[#0f766e] text-white text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4" /> Ajouter l&apos;échantillon</button>
          </div>
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-[#0d9488]" /><h3 className="text-[15px] font-semibold text-[#0f172a]">Registre des échantillons</h3></div>
          <div className="space-y-3">
            {samples.map(sample => (
              <div key={sample.id} className="flex items-center justify-between gap-4 p-4 border border-[#e2e8f0] rounded-lg">
                <div><p className="text-[14px] font-medium text-[#0f172a]">{sample.name}</p><p className="text-[12px] text-[#64748b] mt-1">{sample.matrix} · {sample.method}</p></div>
                <div className="flex items-center gap-3"><span className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700">{sample.status}</span><button type="button" aria-label={`Supprimer ${sample.name}`} onClick={() => setSamples(current => current.filter(item => item.id !== sample.id))} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            ))}
            {samples.length === 0 && <p className="py-10 text-center text-[13px] text-[#64748b]">Aucun échantillon enregistré.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}