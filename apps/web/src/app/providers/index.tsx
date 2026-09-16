import React from 'react';
import { AuthProvider } from '../../features/auth/AuthContext.js';
import { ToastProvider } from '../../components/ui/Toast.js';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
};

