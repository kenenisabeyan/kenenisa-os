import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth.js';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading || authState === 'UNKNOWN') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-bold text-xs">
            K-OS
          </div>
        </div>
        <p className="mt-4 text-slate-400 text-sm font-medium animate-pulse">
          Authenticating KENENISA OS...
        </p>
      </div>
    );
  }

  if (authState === 'UNAUTHENTICATED') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
