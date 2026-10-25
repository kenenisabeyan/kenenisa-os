import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../../pages/LoginPage.js';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage.js';
import { AppShellPage } from '../../pages/AppShellPage.js';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { PublicLayout } from '../../components/layout/PublicLayout.js';
import { HomePage } from '../../pages/HomePage.js';
import { HowItWorksPage } from '../../pages/HowItWorksPage.js';
import { CapabilitiesPage } from '../../pages/CapabilitiesPage.js';
import { AboutPage } from '../../pages/AboutPage.js';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};
