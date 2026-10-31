import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AppPage from './pages/AppPage';
import Disclaimer from './pages/Disclaimer';
import Faq from './pages/Faq';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en/" replace />} />
      <Route path="/:lang" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="app" element={<AppPage />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="faq" element={<Faq />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="disclaimer" element={<Disclaimer />} />
      </Route>
      <Route path="*" element={<Navigate to="/en/" replace />} />
    </Routes>
  );
}
