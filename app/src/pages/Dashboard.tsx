import { useNavigate } from 'react-router';
import {
  LayoutDashboard, FlaskConical, Flame, Sun, Radio,
  Droplet, Palette, Boxes, Clock, Calculator, FileSpreadsheet,
  History, Zap, BookOpen, Info, ArrowRight, ShieldAlert,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const MODULES = [
  {
    title: 'Chromatographie HPLC',
    description: 'Facteur de résolution, plateaux théoriques, facteur de capacité, sélectivité',
    icon: FlaskConical,
    color: '#059669',
    path: '/chromatographie',
  },
  {
    title: 'Chromatographie GC',
    description: 'Résolution, efficacité colonne, indices de rétention de Kovats',
    icon: Flame,
    color: '#059669',
    path: '/chromatographie',
  },
  {
    title: 'Spectrométrie UV-Vis',
    description: 'Loi de Beer-Lambert, concentration, absorbance, coefficient d\'extinction',
    icon: Sun,
    color: '#7c3aed',
    path: '/spectrometrie',
  },
  {
    title: 'Spectrométrie IR',
    description: 'Analyse fréquentielle, identification de groupements fonctionnels',
    icon: Radio,
    color: '#7c3aed',
    path: '/spectrometrie',
  },
  {
    title: 'Titrage',
    description: 'Calculs de titrage acide-base, redox, complexométrie, précipitation',
    icon: Droplet,
    color: '#2a5298',
    path: '/calculs',
  },
  {
    title: 'Colorimétrie',
    description: 'Concentration par étalonnage, équation de régression, LOD/LOQ',
    icon: Palette,
    color: '#2a5298',
    path: '/calculs',
  },
];

const GUIDE_ITEMS = [
  {
    question: 'Comment effectuer un calcul ?',
    answer: 'Sélectionnez un module dans le menu latéral, entrez vos données dans les champs prévus, puis cliquez sur Calculer. Les résultats s\'affichent avec interprétation automatique.',
  },
  {
    question: 'Exporter vers Excel',
    answer: 'Chaque module dispose d\'un bouton "Exporter Excel" dans l\'en-tête qui génère un fichier .xlsx avec vos données, résultats et interprétation. Le fichier contient jusqu\'à 3 feuilles : Données, Résultats, Interprétation.',
  },
  {
    question: 'Interprétation des résultats',
    answer: 'Chaque calcul inclut une interprétation automatique basée sur les valeurs de référence du domaine. Les indicateurs de conformité (vert/rouge/orange) vous aident à évaluer rapidement vos résultats.',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [calcCount] = useLocalStorage<number>('chimlab_calc_count', 0);
  const [exportCount] = useLocalStorage<number>('chimlab_export_count', 0);
  const [lastAnalysis] = useLocalStorage<number>('chimlab_last_analysis', 0);

  const stats = [
    { label: 'Calculs effectués', value: calcCount || '--', icon: Calculator, color: '#1e3a5f' },
    { label: 'Fichiers exportés', value: exportCount || '--', icon: FileSpreadsheet, color: '#0d9488' },
    { label: 'Modules disponibles', value: 12, icon: Boxes, color: '#7c3aed' },
    {
      label: 'Dernière analyse',
      value: lastAnalysis ? new Date(lastAnalysis).toLocaleDateString('fr-FR') : '--',
      icon: Clock,
      color: '#f59e0b'
    },
  ];

  const recentCalculations: { module: string; name: string; date: string; value: string; icon: React.ElementType }[] = [];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0f172a] flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#1e3a5f]" />
            Tableau de bord
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Bienvenue sur ChimLab. Sélectionnez un outil dans le menu ou utilisez les raccourcis ci-dessous.
          </p>
        </div>
        <span className="text-[14px] text-[#475569] hidden sm:block">
          {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <button type="button" onClick={() => navigate('/preanalytique')} className="preanalytique-prompt">
        <span className="preanalytique-prompt-icon"><ShieldAlert className="w-5 h-5" /></span>
        <span><strong>Ouvrir le pilotage pré-analytique</strong><small>Rejets, délais de transport, indices HIL et alertes qualité</small></span>
        <ArrowRight className="w-4 h-4 ml-auto" />
      </button>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] border-l-4"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="font-mono text-[18px] font-semibold text-[#0f172a]">{stat.value}</div>
                <div className="text-[12px] text-[#475569] font-medium">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick access modules */}
      <div>
        <h2 className="text-[18px] font-semibold text-[#0f172a] flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-[#f59e0b]" />
          Accès rapide aux modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod, i) => (
            <button
              key={i}
              onClick={() => navigate(mod.path)}
              className="bg-white rounded-xl p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]
                border-t-[3px] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)] hover:-translate-y-0.5"
              style={{ borderTopColor: mod.color }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${mod.color}12` }}
              >
                <mod.icon className="w-6 h-6" style={{ color: mod.color }} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#0f172a] mb-1">{mod.title}</h3>
              <p className="text-[13px] text-[#475569] leading-relaxed mb-4 line-clamp-2">{mod.description}</p>
              <span className="text-[12px] font-semibold text-[#1e3a5f] flex items-center gap-1 group-hover:underline">
                Ouvrir <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent history */}
      <div>
        <h2 className="text-[18px] font-semibold text-[#0f172a] flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-[#2a5298]" />
          Calculs récents
        </h2>
        {recentCalculations.length > 0 ? (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] divide-y divide-[#f1f5f9]">
            {recentCalculations.map((calc, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-center gap-3">
                  <calc.icon className="w-4 h-4 text-[#475569]" />
                  <div>
                    <span className="text-[13px] text-[#0f172a] font-medium">{calc.name}</span>
                    <span className="text-[11px] text-[#94a3b8] ml-2">{calc.date}</span>
                  </div>
                </div>
                <span className="font-mono text-[13px] text-[#0f172a]">{calc.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <Info className="w-8 h-8 text-[#94a3b8] mx-auto mb-3" />
            <p className="text-[14px] text-[#475569]">
              Aucun calcul récent. Commencez par sélectionner un module ci-dessus.
            </p>
          </div>
        )}
      </div>

      {/* Guide */}
      <div>
        <h2 className="text-[18px] font-semibold text-[#0f172a] flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[#059669]" />
          Guide d'utilisation
        </h2>
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {GUIDE_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-[#f1f5f9] last:border-0">
                <AccordionTrigger className="px-5 py-4 text-[14px] font-medium text-[#0f172a] hover:no-underline hover:bg-[#f8fafc]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 text-[13px] text-[#475569] leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
