import { Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chromatographie from './pages/Chromatographie';
import Spectrometrie from './pages/Spectrometrie';
import Calculs from './pages/Calculs';
import Preparation from './pages/Preparation';
import Echantillons from './pages/Echantillons';
import Outils from './pages/Outils';
import Preanalytique from './pages/Preanalytique';
import Conformite from './pages/Conformite';

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chromatographie" element={<Chromatographie />} />
          <Route path="/spectrometrie" element={<Spectrometrie />} />
          <Route path="/calculs" element={<Calculs />} />
          <Route path="/preparation" element={<Preparation />} />
          <Route path="/echantillons" element={<Echantillons />} />
          <Route path="/outils" element={<Outils />} />
          <Route path="/preanalytique" element={<Preanalytique />} />
          <Route path="/conformite" element={<Conformite />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  );
}
