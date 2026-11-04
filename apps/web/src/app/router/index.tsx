import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { PublicLayout } from '../../components/layout/PublicLayout.js';

// Lazy-loaded top-level pages
const HomePage = lazy(() => import('../../pages/HomePage.js').then((m) => ({ default: m.HomePage })));
const HowItWorksPage = lazy(() => import('../../pages/HowItWorksPage.js').then((m) => ({ default: m.HowItWorksPage })));
const CapabilitiesPage = lazy(() => import('../../pages/CapabilitiesPage.js').then((m) => ({ default: m.CapabilitiesPage })));
const AboutPage = lazy(() => import('../../pages/AboutPage.js').then((m) => ({ default: m.AboutPage })));
const LoginPage = lazy(() => import('../../pages/LoginPage.js').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('../../pages/ForgotPasswordPage.js').then((m) => ({ default: m.ForgotPasswordPage })));
const ForgotEmailPage = lazy(() => import('../../pages/ForgotEmailPage.js').then((m) => ({ default: m.ForgotEmailPage })));
const AppShellPage = lazy(() => import('../../pages/AppShellPage.js').then((m) => ({ default: m.AppShellPage })));

const TopLevelLoader: React.FC = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<TopLevelLoader />}>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
          <Route path="/capabilities" element={<PublicLayout><CapabilitiesPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />

          {/* Authentication & Private Operating App Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-email" element={<ForgotEmailPage />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppShellPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
