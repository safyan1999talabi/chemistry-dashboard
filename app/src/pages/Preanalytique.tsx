import { useMemo, useState } from 'react';
import {
  AlertTriangle, BarChart3, CheckCircle2, Clock3, Download,
  FlaskConical, Search, ShieldAlert, Thermometer, Truck, XCircle,
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';

type SampleStatus = 'Rejeté' | 'En attente' | 'Validé';
type Sample = {
  id: string;
  patient: string;
  service: string;
  motif: string;
  H: number;
  I: number;
  L: number;
  delay: number;
  status: SampleStatus;
  daysAgo: number;
};

const SAMPLES: Sample[] = [
  { id: 'ECH-48290', patient: 'Dupont M.', service: 'Urgences', motif: 'Hémolyse', H: 142, I: 18, L: 42, delay: 38, status: 'Rejeté', daysAgo: 1 },
  { id: 'ECH-48289', patient: 'Benali K.', service: 'Réanimation', motif: 'Retard transport', H: 22, I: 9, L: 68, delay: 147, status: 'En attente', daysAgo: 2 },
  { id: 'ECH-48288', patient: 'Martin L.', service: 'Médecine interne', motif: 'Conforme', H: 12, I: 5, L: 24, delay: 32, status: 'Validé', daysAgo: 3 },
  { id: 'ECH-48287', patient: 'Nguyen T.', service: 'Chirurgie', motif: 'Volume insuffisant', H: 28, I: 12, L: 51, delay: 44, status: 'Rejeté', daysAgo: 5 },
  { id: 'ECH-48286', patient: 'Garcia P.', service: 'Pédiatrie', motif: 'Mauvais tube', H: 16, I: 7, L: 32, delay: 29, status: 'Rejeté', daysAgo: 8 },
  { id: 'ECH-48285', patient: 'Leroy S.', service: 'Urgences', motif: 'Conforme', H: 8, I: 4, L: 19, delay: 26, status: 'Validé', daysAgo: 12 },
  { id: 'ECH-48284', patient: 'Moreau C.', service: 'Consultations externes', motif: 'Identification', H: 31, I: 15, L: 45, delay: 61, status: 'En attente', daysAgo: 17 },
  { id: 'ECH-48283', patient: 'Fournier J.', service: 'Réanimation', motif: 'Hémolyse', H: 118, I: 21, L: 72, delay: 41, status: 'Rejeté', daysAgo: 24 },
  { id: 'ECH-48282', patient: 'Girard A.', service: 'Chirurgie', motif: 'Conforme', H: 9, I: 6, L: 27, delay: 36, status: 'Validé', daysAgo: 38 },
];

const motifColors: Record<string, string> = {
  Hémolyse: 'b-hemolyse',
  'Retard transport': 'b-transport',
  'Volume insuffisant': 'b-volume',
  'Mauvais tube': 'b-tube',
  Identification: 'b-ident',
  Conforme: 'b-calc',
};

const statusColors: Record<SampleStatus, string> = {
  Rejeté: 'status-rejected',
  'En attente': 'status-pending',
  Validé: 'status-valid',
};

export default function Preanalytique() {
  const [range, setRange] = useState(30);
  const [query, setQuery] = useState('');
  const [motif, setMotif] = useState('');
  const [service, setService] = useState('');

  const periodSamples = useMemo(() => SAMPLES.filter(sample => sample.daysAgo <= range), [range]);
  const filteredSamples = useMemo(() => periodSamples.filter(sample => {
    const matchesQuery = `${sample.id} ${sample.patient} ${sample.service}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (!motif || sample.motif === motif) && (!service || sample.service === service);
  }), [motif, periodSamples, query, service]);

  const rejected = periodSamples.filter(sample => sample.status === 'Rejeté').length;
  const validated = periodSamples.filter(sample => sample.status === 'Validé').length;
  const averageDelay = Math.round(periodSamples.reduce((total, sample) => total + sample.delay, 0) / periodSamples.length);
  const rejectionRate = ((rejected / periodSamples.length) * 100).toFixed(1).replace('.', ',');

  const handleExport = () => {
    exportToCsv('chimlab-preanalytique', filteredSamples.map(sample => [
      sample.id, sample.patient, sample.service, sample.motif, sample.H, sample.I, sample.L, sample.delay, sample.status,
    ]), ['Échantillon', 'Patient', 'Service', 'Motif', 'Hémolyse', 'Ictère', 'Lipémie', 'Délai (min)', 'Statut']);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <section className="preanalytique-hero">
        <div>
          <div className="eyebrow"><ShieldAlert className="w-4 h-4" /> Pilotage qualité</div>
          <h2>Phase pré-analytique</h2>
          <p>Suivez les non-conformités, les délais et les indices HIL avant l’analyse.</p>
        </div>
        <div className="range-group" role="group" aria-label="Période d'analyse">
          {[7, 30, 90].map(value => (
            <button key={value} type="button" onClick={() => setRange(value)} className={range === value ? 'range-btn active' : 'range-btn'}>{value} j</button>
          ))}
        </div>
      </section>

      <section className="preanalytique-kpis" aria-label="Indicateurs clés">
        <Kpi icon={<BarChart3 />} label="Taux de rejet" value={`${rejectionRate} %`} detail={`Objectif < 1,0 %`} accent="var(--bad)" />
        <Kpi icon={<XCircle />} label="Échantillons rejetés" value={rejected} detail="sur la période sélectionnée" accent="var(--bad)" />
        <Kpi icon={<Clock3 />} label="Délai moyen" value={`${averageDelay} min`} detail="prélèvement → réception" accent="var(--warn)" />
        <Kpi icon={<CheckCircle2 />} label="Échantillons conformes" value={validated} detail="contrôle pré-analytique validé" accent="var(--ok)" />
      </section>

      <section className="surface-card p-5">
        <div className="section-heading">
          <div><h3>Chaîne pré-analytique</h3><p>Points de contrôle et niveau de conformité</p></div>
          <span className="b-calc badge">Processus standardisé</span>
        </div>
        <div className="preanalytique-flow">
          <FlowStep icon={<FlaskConical />} label="Prélèvement" value="98,4 %" done />
          <FlowStep icon={<Truck />} label="Transport" value="94,8 %" done />
          <FlowStep icon={<Thermometer />} label="Réception" value="97,1 %" done />
          <FlowStep icon={<ShieldAlert />} label="Contrôle qualité" value="91,6 %" />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-6">
        <section className="surface-card p-5">
          <div className="section-heading"><div><h3>Indices HIL</h3><p>Échantillons hors seuil par indice</p></div><span className="b-tube badge">Sérum</span></div>
          <div className="hil-bars">
            <HilBar label="Hémolyse" value={24} color="var(--bad)" threshold="≥ 100" />
            <HilBar label="Ictère" value={11} color="var(--violet)" threshold="≥ 60" />
            <HilBar label="Lipémie" value={16} color="var(--warn)" threshold="≥ 300" />
          </div>
        </section>
        <section className="surface-card p-5">
          <div className="section-heading"><div><h3>Alertes qualité</h3><p>Priorités à traiter</p></div><span className="status-dot status-pending">2 en cours</span></div>
          <div className="quality-alert alert-warn"><AlertTriangle /><div><strong>Retards transport</strong><span>3 échantillons au-delà de 120 minutes</span></div></div>
          <div className="quality-alert alert-danger"><XCircle /><div><strong>Hémolyse critique</strong><span>2 prélèvements à recontrôler</span></div></div>
        </section>
      </div>

      <section className="surface-card p-5">
        <div className="section-heading section-heading-wrap">
          <div><h3>Registre des échantillons</h3><p>{filteredSamples.length} résultat{filteredSamples.length > 1 ? 's' : ''} affiché{filteredSamples.length > 1 ? 's' : ''}</p></div>
          <div className="preanalytique-actions">
            <label className="search-field"><Search className="w-4 h-4" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher…" aria-label="Rechercher un échantillon" /></label>
            <select value={motif} onChange={event => setMotif(event.target.value)} aria-label="Filtrer par motif"><option value="">Tous les motifs</option>{Object.keys(motifColors).map(item => <option key={item}>{item}</option>)}</select>
            <select value={service} onChange={event => setService(event.target.value)} aria-label="Filtrer par service"><option value="">Tous les services</option>{[...new Set(SAMPLES.map(sample => sample.service))].map(item => <option key={item}>{item}</option>)}</select>
            <button type="button" className="csv-button" onClick={handleExport}><Download className="w-4 h-4" /> CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="preanalytique-table"><thead><tr><th>Échantillon</th><th>Patient</th><th>Service</th><th>Motif</th><th>HIL</th><th>Délai</th><th>Statut</th></tr></thead>
            <tbody>{filteredSamples.map(sample => <tr key={sample.id}><td className="font-semibold">{sample.id}</td><td>{sample.patient}</td><td>{sample.service}</td><td><span className={`badge ${motifColors[sample.motif]}`}>{sample.motif}</span></td><td><span className="hil-cell-text">H {sample.H} · I {sample.I} · L {sample.L}</span></td><td>{sample.delay} min</td><td><span className={`status-dot ${statusColors[sample.status]}`}>{sample.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ icon, label, value, detail, accent }: { icon: React.ReactNode; label: string; value: string | number; detail: string; accent: string }) {
  return <div className="preanalytique-kpi" style={{ '--accent': accent } as React.CSSProperties}><div className="kpi-ico">{icon}</div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function FlowStep({ icon, label, value, done = false }: { icon: React.ReactNode; label: string; value: string; done?: boolean }) {
  return <div className={`flow-step ${done ? 'done' : ''}`}><div className="flow-step-icon">{icon}</div><strong>{label}</strong><span>{value}</span></div>;
}

function HilBar({ label, value, color, threshold }: { label: string; value: number; color: string; threshold: string }) {
  return <div className="hil-bar"><div><strong>{label}</strong><span>{value} % · seuil {threshold}</span></div><div className="hil-track"><span style={{ width: `${value * 2.5}%`, background: color }} /></div></div>;
}