import React from 'react';
import { useAuth } from '../features/auth/useAuth.js';
import { useNavigate } from 'react-router-dom';

export const AppShellPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    await navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
            K
          </div>
          <span className="font-bold tracking-tight text-white">KENENISA OS</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase tracking-wider">
            {user?.role || 'OWNER'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-200">{user?.displayName}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>

          <button
            id="auth-logout-btn"
            onClick={() => {
              void handleLogout();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-150 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main Container Placeholder for Step 4+ */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl text-cyan-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Protected Owner Environment Established
        </h2>
        <p className="text-slate-400 max-w-lg text-sm mb-6">
          Step 3 (Authentication, Session Management & Authorization Foundation) is verified and
          operational. Your server-side HTTP-Only session is active.
        </p>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-left max-w-md w-full text-xs space-y-2 text-slate-300 font-mono">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">Authenticated User:</span>
            <span className="text-cyan-400 font-bold">{user?.displayName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">Email:</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">Role:</span>
            <span className="text-emerald-400 font-bold">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="text-emerald-400 font-semibold">
              Active Session (HTTP-Only Cookie)
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
