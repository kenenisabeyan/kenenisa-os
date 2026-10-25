import React, { useState } from 'react';
import { useNavigate, Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth.js';
import { loginSchema } from '@kenenisa-os/shared';
import { ApiError } from '../lib/api-client.js';

export const LoginPage: React.FC = () => {
  const { login, authState } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);

  // If already authenticated, redirect to app shell
  if (authState === 'AUTHENTICATED') {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setFieldErrors({});

    // Client-side schema validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const formatted = result.error.format();
      setFieldErrors({
        email: formatted.email?._errors[0],
        password: formatted.password?._errors[0],
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: result.data.email, password: result.data.password });
      await navigate('/app', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setAuthError(err.message);
      } else {
        setAuthError('An unexpected authentication error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Accent Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#3AB1EC]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#3B82F6] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Website</span>
            </Link>
            <span className="text-[10px] font-bold text-[#3B82F6] uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Pre-Auth
            </span>
          </div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3AB1EC] to-[#3B82F6] text-white font-extrabold text-2xl shadow-lg shadow-blue-500/20 mb-4">
            K
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            KENENISA OS
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
            Personal Engineering Operating System
          </p>
        </div>

        {/* Global Error Alert */}
        {authError && (
          <div
            id="auth-error-alert"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3"
          >
            <svg
              className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-medium">{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-5"
          noValidate
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Email Address
              </label>
              <Link
                to="/forgot-email"
                id="forgot-email-link"
                className="text-xs font-semibold text-[#3B82F6] hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot email?
              </Link>
            </div>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="beyankenenisa@gmail.com"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 bg-slate-50 border ${
                fieldErrors.email ? 'border-rose-400' : 'border-slate-300'
              } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#3B82F6] transition-all`}
            />
            {fieldErrors.email && (
              <p className="text-rose-600 text-xs font-medium mt-1.5">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                id="forgot-password-link"
                className="text-xs font-semibold text-[#3B82F6] hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  fieldErrors.password ? 'border-rose-400' : 'border-slate-300'
                } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#3B82F6] transition-all pr-14`}
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-xs font-semibold px-2 py-1 rounded bg-slate-200/60 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-rose-600 text-xs font-medium mt-1.5">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* 1-Click Quick Owner Login */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setEmail('beyankenenisa@gmail.com');
              setPassword('kenenisa@3072215');
            }}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            ⚡ Autofill Owner Credentials (beyankenenisa@gmail.com)
          </button>
        </div>

        <div className="mt-6 text-center text-xs font-medium text-slate-400">
          Protected Owner System &bull; V1.0.0
        </div>
      </div>
    </div>
  );
};

