import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getPreferredLang } from './lib/preferredLang';
import Layout from './components/Layout';
import Cancel from './pages/Cancel';
import Accessibility from './pages/Accessibility';
import Disclaimer from './pages/Disclaimer';
import Faq from './pages/Faq';
import ForIndividuals from './pages/ForIndividuals';
import EmployersTicino from './pages/employers/Ticino';
import EmployersGeneva from './pages/employers/Geneva';
import EmployersLuxembourg from './pages/employers/Luxembourg';
import FrenchGuide from './pages/guides/FrenchGuide';
import GuidesHub from './pages/guides/Hub';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dpa from './pages/Dpa';
import Withdrawal from './pages/Withdrawal';
import CompanySignup from './pages/company/Signup';

// App, account, auth and company tools stay out of the marketing/guide chunk.
const Account = lazy(() => import('./pages/Account'));
const AppPage = lazy(() => import('./pages/AppPage'));
const CompanyDashboard = lazy(() => import('./pages/company/Dashboard'));
const CompanyInvite = lazy(() => import('./pages/company/Invite'));
const JoinCompany = lazy(() => import('./pages/company/Join'));
const EmployeeHistory = lazy(() => import('./pages/company/History'));
const SignIn = lazy(() => import('./pages/auth/SignIn'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const AuthCallback = lazy(() => import('./pages/auth/Callback'));
const DemoRoutes = lazy(() => import('./pages/demo/DemoRoutes'));

function lazyPage(node: ReactNode) {
  return <Suspense fallback={null}>{node}</Suspense>;
}

function PreferredHome() {
  return <Navigate to={`/${getPreferredLang()}/`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PreferredHome />} />
      <Route path="/auth/callback" element={lazyPage(<AuthCallback />)} />
      <Route path="/:lang" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="app" element={lazyPage(<AppPage />)} />
        <Route path="for-individuals" element={<ForIndividuals />} />
        <Route path="employers/ticino" element={<EmployersTicino />} />
        <Route path="employers/geneva" element={<EmployersGeneva />} />
        <Route path="employers/luxembourg" element={<EmployersLuxembourg />} />
        <Route path="guides" element={<GuidesHub />} />
        <Route path="guides/france-luxembourg-compter-jours-teletravail" element={<FrenchGuide id="luxembourg" />} />
        <Route path="guides/france-geneve-compter-jours-teletravail" element={<FrenchGuide id="geneva" />} />
        <Route path="guides/france-bale-compter-jours-teletravail" element={<FrenchGuide id="bale" />} />
        <Route path="guides/deutschland-schweiz-grenzgaenger-tage-zaehlen" element={<FrenchGuide id="deCh" />} />
        <Route path="guides/italia-ticino-contare-giorni-telelavoro" element={<FrenchGuide id="ticinoIt" />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="faq" element={<Faq />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="disclaimer" element={<Disclaimer />} />
        <Route path="accessibility" element={<Accessibility />} />
        <Route path="terms" element={<Terms />} />
        <Route path="dpa" element={<Dpa />} />
        <Route path="withdrawal" element={<Withdrawal />} />
        <Route path="cancel" element={<Cancel />} />
        <Route path="account" element={lazyPage(<Account />)} />
        <Route path="auth/sign-in" element={lazyPage(<SignIn />)} />
        <Route path="auth/sign-up" element={lazyPage(<SignUp />)} />
        <Route path="auth/callback" element={lazyPage(<AuthCallback />)} />
        <Route path="company/signup" element={<CompanySignup />} />
        <Route path="company/:companyId/dashboard" element={lazyPage(<CompanyDashboard />)} />
        <Route path="company/:companyId/invite" element={lazyPage(<CompanyInvite />)} />
        <Route path="company/:companyId/employee/:employeeId" element={lazyPage(<EmployeeHistory />)} />
        <Route path="company/dashboard" element={lazyPage(<CompanyDashboard />)} />
        <Route path="join" element={lazyPage(<JoinCompany />)} />
        <Route path="join/:token" element={lazyPage(<JoinCompany />)} />
        <Route path="demo/*" element={lazyPage(<DemoRoutes />)} />
      </Route>
      <Route path="*" element={<PreferredHome />} />
    </Routes>
  );
}
