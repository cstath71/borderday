import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getPreferredLang } from './lib/preferredLang';
import Layout from './components/Layout';
import Account from './pages/Account';
import AppPage from './pages/AppPage';
import Cancel from './pages/Cancel';
import Accessibility from './pages/Accessibility';
import Disclaimer from './pages/Disclaimer';
import Faq from './pages/Faq';
import ForIndividuals from './pages/ForIndividuals';
import EmployersTicino from './pages/employers/Ticino';
import EmployersGeneva from './pages/employers/Geneva';
import EmployersLuxembourg from './pages/employers/Luxembourg';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dpa from './pages/Dpa';
import Withdrawal from './pages/Withdrawal';
import CompanySignup from './pages/company/Signup';
import CompanyDashboard from './pages/company/Dashboard';
import CompanyInvite from './pages/company/Invite';
import JoinCompany from './pages/company/Join';
import EmployeeHistory from './pages/company/History';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import AuthCallback from './pages/auth/Callback';

// The browser-local mock stays out of the main bundle: it is only reachable under /demo.
const DemoRoutes = lazy(() => import('./pages/demo/DemoRoutes'));

function PreferredHome() {
  return <Navigate to={`/${getPreferredLang()}/`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PreferredHome />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/:lang" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="app" element={<AppPage />} />
        <Route path="for-individuals" element={<ForIndividuals />} />
        <Route path="employers/ticino" element={<EmployersTicino />} />
        <Route path="employers/geneva" element={<EmployersGeneva />} />
        <Route path="employers/luxembourg" element={<EmployersLuxembourg />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="faq" element={<Faq />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="disclaimer" element={<Disclaimer />} />
        <Route path="accessibility" element={<Accessibility />} />
        <Route path="terms" element={<Terms />} />
        <Route path="dpa" element={<Dpa />} />
        <Route path="withdrawal" element={<Withdrawal />} />
        <Route path="cancel" element={<Cancel />} />
        <Route path="account" element={<Account />} />
        <Route path="auth/sign-in" element={<SignIn />} />
        <Route path="auth/sign-up" element={<SignUp />} />
        <Route path="auth/callback" element={<AuthCallback />} />
        <Route path="company/signup" element={<CompanySignup />} />
        <Route path="company/:companyId/dashboard" element={<CompanyDashboard />} />
        <Route path="company/:companyId/invite" element={<CompanyInvite />} />
        <Route path="company/:companyId/employee/:employeeId" element={<EmployeeHistory />} />
        <Route path="company/dashboard" element={<CompanyDashboard />} />
        <Route path="join" element={<JoinCompany />} />
        <Route path="join/:token" element={<JoinCompany />} />
        <Route
          path="demo/*"
          element={
            <Suspense fallback={null}>
              <DemoRoutes />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<PreferredHome />} />
    </Routes>
  );
}
