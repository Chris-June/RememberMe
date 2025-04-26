import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CreateMemorial from './pages/CreateMemorial';
import MemorialPage from './pages/MemorialPage';
import AddMemory from './pages/AddMemory';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MemorialSettings from './pages/MemorialSettings';
import JoinMemorial from './pages/JoinMemorial';
import AuthProtected from './components/auth/AuthProtected';
import { useAuthStore } from './store/authStore';
import useSessionCleanup from './hooks/useSessionCleanup';
import { Toaster } from './components/ui/toaster';

// Import the page components
import ExamplesPage from './pages/ExamplesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import HelpCenterPage from './pages/HelpCenterPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AccessibilityPage from './pages/AccessibilityPage';

function App() {
  const location = useLocation();
  const { refreshUser /*, user */ } = useAuthStore(); // Uncomment 'user' if needed later
  
  // Use the session cleanup hook to fix potential auth issues
  useSessionCleanup();
  
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="create" element={
              <AuthProtected>
                <CreateMemorial />
              </AuthProtected>
            } />
            <Route path="memorial/:id" element={<MemorialPage />} />
            <Route path="memorial/join/:code" element={<JoinMemorial />} />
            <Route path="memorial/:id/add" element={
              <AuthProtected>
                <AddMemory />
              </AuthProtected>
            } />
            <Route path="memorial/:id/settings" element={
              <AuthProtected>
                <MemorialSettings />
              </AuthProtected>
            } />
            <Route path="dashboard" element={
              <AuthProtected>
                <Dashboard />
              </AuthProtected>
            } />
            
            {/* Static page routes */}
            <Route path="examples" element={<ExamplesPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="help-center" element={<HelpCenterPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms-of-service" element={<TermsOfServicePage />} />
            <Route path="accessibility" element={<AccessibilityPage />} />
            
            {/* Redirect legacy routes if needed */}
            <Route path="/account" element={<Navigate to="/dashboard" replace />} />
            
            {/* Wildcard route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster />
    </>
  );
}

export default App;