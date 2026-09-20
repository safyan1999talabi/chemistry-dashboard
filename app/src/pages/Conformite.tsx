import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

const requirements = [
  { reference: '17025-4.1', title: 'Impartialite', status: 'Conforme', evidence: '2 preuves', owner: 'A. Martin', due: '18 oct. 2026', tone: 'success' },
  { reference: '17025-6.4', title: 'Equipements', status: 'Partiellement conforme', evidence: '1 preuve', owner: 'L. Bernard', due: '24 sept. 2026', tone: 'warning' },
  { reference: '17025-7.2', title: 'Selection et verification des methodes', status: 'A verifier', evidence: 'Aucune preuve', owner: 'C. Robert', due: '30 sept. 2026', tone: 'neutral' },
  { reference: '17025-7.10', title: 'Travaux non conformes', status: 'Non conforme', evidence: '3 preuves', owner: 'A. Martin', due: '21 sept. 2026', tone: 'danger' },
];

const kpis = [
  { label: 'Score interne', value: '78 %', detail: 'Indicateur configurable, non officiel', icon: ShieldCheck, tone: 'teal' },
  { label: 'Exigences conformes', value: '42', detail: 'sur 54 exigences suivies', icon: CheckCircle2, tone: 'green' },
  { label: 'Sans preuve', value: '5', detail: 'à traiter en priorité', icon: FileWarning, tone: 'amber' },
  { label: 'CAPA en retard', value: '3', detail: 'dont 1 critique', icon: AlertTriangle, tone: 'red' },
];

const toneClasses: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-slate-100 text-slate-600',
  danger: 'bg-red-50 text-red-700',
};

export default function Conformite() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">
              <ClipboardCheck className="h-4 w-4" /> Pilotage QMS
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Conformite ISO/IEC 17025</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Une vue de travail des exigences, preuves et actions qui demandent votre attention.
              Le score affiche est un indicateur interne configurable.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Donnees de demonstration</span>
            <span>Derniere mise a jour : aujourd'hui</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <Icon className={`h-5 w-5 ${kpi.tone === 'red' ? 'text-red-500' : kpi.tone === 'amber' ? 'text-amber-500' : kpi.tone === 'green' ? 'text-emerald-600' : 'text-teal-600'}`} />
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{kpi.value}</div>
              <p className="mt-1 text-xs text-slate-500">{kpi.detail}</p>
            </article>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Exigences a surveiller</h3>
              <p className="mt-1 text-xs text-slate-500">Les priorites de la prochaine revue qualite</p>
            </div>
            <button type="button" className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-900">
              Ouvrir la matrice <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-3 font-semibold">Exigence</th><th className="px-4 py-3 font-semibold">Statut</th><th className="px-4 py-3 font-semibold">Preuves</th><th className="px-4 py-3 font-semibold">Responsable</th><th className="px-5 py-3 font-semibold">Echeance</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requirements.map((requirement) => (
                  <tr key={requirement.reference} className="hover:bg-slate-50">
                    <td className="px-5 py-4"><div className="font-mono text-xs text-slate-500">{requirement.reference}</div><div className="mt-1 font-medium text-slate-900">{requirement.title}</div></td>
                    <td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses[requirement.tone]}`}>{requirement.status}</span></td>
                    <td className={`px-4 py-4 text-xs ${requirement.evidence === 'Aucune preuve' ? 'font-semibold text-red-600' : 'text-slate-600'}`}>{requirement.evidence}</td>
                    <td className="px-4 py-4 text-xs text-slate-600">{requirement.owner}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{requirement.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div><h3 className="text-base font-semibold text-slate-950">Actions prochaines</h3><p className="mt-1 text-xs text-slate-500">Ce qui doit avancer cette semaine</p></div>
            <CalendarClock className="h-5 w-5 text-teal-600" />
          </div>
          <div className="space-y-3">
            <ActionRow icon={AlertTriangle} title="Clore la CAPA CAPA-024" detail="Echeance dans 2 jours" tone="danger" />
            <ActionRow icon={Wrench} title="Etalonnage de la balance BA-04" detail="Echeance dans 5 jours" tone="warning" />
            <ActionRow icon={FileWarning} title="Ajouter une preuve a 17025-7.2" detail="Aucune preuve associee" tone="neutral" />
          </div>
          <button type="button" className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Voir toutes les actions</button>
        </section>
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, title, detail, tone }: { icon: typeof AlertTriangle; title: string; detail: string; tone: 'danger' | 'warning' | 'neutral' }) {
  const colors = {
    danger: 'text-red-700 bg-red-50',
    warning: 'text-amber-700 bg-amber-50',
    neutral: 'text-slate-700 bg-slate-100',
  };
  return <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${colors[tone]}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><strong className="block truncate text-xs font-semibold text-slate-900">{title}</strong><small className="mt-1 block text-[11px] text-slate-500">{detail}</small></span><ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" /></div>;
}
