import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  FlaskConical, Waves, Calculator,
  Beaker, Wrench, FileSpreadsheet, CircleHelp, Settings, TestTube,
  Menu, X, FlaskConicalOff, ChevronRight
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToExcel } from '@/lib/export';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Préparation', path: '/preparation', icon: Beaker, group: 'OPÉRATIONS' },
  { label: 'Échantillons', path: '/echantillons', icon: TestTube, group: 'OPÉRATIONS' },
  { label: 'Calculs analytiques', path: '/calculs', icon: Calculator, group: 'TECHNIQUES ANALYTIQUES' },
  { label: 'Chromatographie', path: '/chromatographie', icon: FlaskConical, group: 'TECHNIQUES ANALYTIQUES' },
  { label: 'Spectrométrie', path: '/spectrometrie', icon: Waves, group: 'TECHNIQUES ANALYTIQUES' },
  { label: 'Outils', path: '/outils', icon: Wrench, group: 'UTILITAIRES' },
];

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble et accès rapide' },
  '/conformite': { title: 'Conformité QMS', subtitle: 'Suivi des exigences, preuves et actions qualité' },
  '/chromatographie': { title: 'Chromatographie', subtitle: 'HPLC, GC, TLC et paramètres de colonne' },
  '/spectrometrie': { title: 'Spectrométrie', subtitle: 'UV-Vis, IR, MS et NMR' },
  '/calculs': { title: 'Calculs analytiques', subtitle: 'Titrage, colorimétrie et gravimétrie' },
  '/preparation': { title: 'Préparation', subtitle: 'Solutions, dilutions et échantillons' },
  '/echantillons': { title: 'Échantillons', subtitle: 'Créer et suivre les échantillons analysés' },
  '/outils': { title: 'Outils', subtitle: 'Convertisseurs et utilitaires' },
  '/preanalytique': { title: 'Phase pré-analytique', subtitle: 'Pilotage qualité, rejets et délais' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportData] = useLocalStorage('chimlab_export_data', null);

  const currentPage = PAGE_TITLES[location.pathname] || { title: 'ChimLab', subtitle: '' };

  const handleExport = useCallback(() => {
    if (!exportData) {
      toast.error('Aucune donnée à exporter. Effectuez d\'abord un calcul.');
      return;
    }
    try {
      const data = JSON.parse(JSON.stringify(exportData));
      exportToExcel(data.filename || 'chimlab_export', data.sheets || []);
      toast.success('Fichier Excel téléchargé avec succès.');
    } catch {
      toast.error('Erreur lors de la génération du fichier Excel.');
    }
  }, [exportData]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <TooltipProvider>
      <div className="app-shell flex h-screen overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            app-sidebar w-[272px] text-white flex flex-col
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Logo */}
          <div className="h-[72px] flex items-center gap-3 px-5 border-b border-white/[0.08]">
            <div className="logo-badge w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_0_5px_rgba(79,70,229,0.4)]">
              <FlaskConicalOff className="w-5 h-5 text-white" />
            </div>
            <div><span className="text-[18px] font-bold tracking-tight font-['Space_Grotesk']">ChimLab</span><span className="block text-[10px] uppercase tracking-[0.18em] text-teal-200/60">Quality laboratory system</span></div>
            <button onClick={toggleSidebar} className="lg:hidden ml-auto text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-5 overflow-y-auto scrollbar-thin">
            {(['OPÉRATIONS', 'TECHNIQUES ANALYTIQUES', 'UTILITAIRES'] as const).map(group => (
              <div key={group} className="mb-4">
                  <div className="px-5 pb-2 pt-3">
                  <span className="nav-label text-[10px] font-semibold uppercase tracking-[0.18em]">{group}</span>
                </div>
                {NAV_ITEMS.filter(item => item.group === group).map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`
                        w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-[13px] font-medium
                        transition-all duration-200
                        ${isActive
                          ? 'nav-item active text-white border border-transparent'
                          : 'nav-item text-slate-400 hover:text-white border border-transparent'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="text-left">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer px-5 py-4 text-[11px]">
            <span className="text-slate-400">ChimLab v1.0</span><span className="block mt-0.5">Qualite et operations analytiques</span>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="topbar h-[72px] border-b border-[#e2e8f0] flex items-center justify-between px-4 lg:px-8 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2"><span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#4f46e5]" /><h1 className="text-[16px] font-semibold text-[#0f172a] leading-tight">{currentPage.title}</h1></div>
                {currentPage.subtitle && (
                  <p className="text-[12px] text-[#64748b] hidden sm:block mt-0.5">{currentPage.subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleExport}
                className="export-btn text-white gap-2 text-[13px] h-10 px-4 rounded-lg shadow-[0_6px_14px_rgba(16,185,129,0.35)]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter Excel</span>
              </Button>

              <div className="w-px h-6 bg-[#e2e8f0] mx-1 hidden sm:block" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-[#475569] hidden sm:flex">
                    <CircleHelp className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Aide contextuelle</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-[#475569] hidden sm:flex">
                    <Settings className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Paramètres</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Page content */}
          <main className="app-main app-content flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
