import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { PublicLayout } from '../../components/layout/PublicLayout.js';

// Public pages imported statically for instantaneous, zero-latency route switching
import { HomePage } from '../../pages/HomePage.js';
import { HowItWorksPage } from '../../pages/HowItWorksPage.js';
import { CapabilitiesPage } from '../../pages/CapabilitiesPage.js';
import { AboutPage } from '../../pages/AboutPage.js';

// Lazy-loaded auth and app pages
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
          {/* Public Website Routes sharing persistent PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/capabilities" element={<CapabilitiesPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Direct aliases for app domains so links like /goals or /tasks work seamlessly */}
          <Route path="/goals" element={<Navigate to="/app/goals" replace />} />
          <Route path="/workstreams" element={<Navigate to="/app/workstreams" replace />} />
          <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
          <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
          <Route path="/planning" element={<Navigate to="/app/planning" replace />} />
          <Route path="/evidence" element={<Navigate to="/app/evidence" replace />} />
          <Route path="/career" element={<Navigate to="/app/career" replace />} />
          <Route path="/reflection" element={<Navigate to="/app/reviews" replace />} />
          <Route path="/reviews" element={<Navigate to="/app/reviews" replace />} />
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

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
