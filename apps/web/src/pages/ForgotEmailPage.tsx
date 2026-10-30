import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth.js';
import { forgotEmailSchema, type RecoveredAccountDto } from '@kenenisa-os/shared';
import { ApiError } from '../lib/api-client.js';

export const ForgotEmailPage: React.FC = () => {
  const { forgotEmail } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({});
  const [accounts, setAccounts] = useState<RecoveredAccountDto[] | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [showFullEmail, setShowFullEmail] = useState<Record<string, boolean>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const result = forgotEmailSchema.safeParse({ name });
    if (!result.success) {
      setFieldErrors({ name: result.error.format().name?._errors[0] });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotEmail({ name: result.data.name });
      setAccounts(response.accounts);
    } catch (err) {
      setAccounts(null);
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to find account. Please verify the name entered.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (email: string) => {
    void navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const toggleEmailVisibility = (email: string) => {
    setShowFullEmail((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Accent Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#3AB1EC]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl relative z-10">
        {/* Top Header Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#3B82F6] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Sign In</span>
          </Link>
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Account Discovery
          </span>
        </div>

        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3AB1EC] to-[#3B82F6] text-white font-extrabold text-2xl shadow-lg shadow-blue-500/20 mb-3">
            K
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Forgot Your Email?
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Search with your registered full name or display name to recover your account email address.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
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
            <span className="font-medium text-xs leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="search-name"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Your Full Name or Display Name
            </label>
            <div className="relative">
              <input
                id="search-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kenenisa Beyan"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  fieldErrors.name ? 'border-rose-400' : 'border-slate-300'
                } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all`}
              />
              {name && (
                <button
                  type="button"
                  onClick={() => setName('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
            {fieldErrors.name && (
              <p className="text-rose-600 text-xs font-medium mt-1.5">{fieldErrors.name}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 sm:py-3.5 px-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Searching Records...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>Find My Account Email</span>
              </>
            )}
          </button>

          {/* Quick Autofill Owner */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setName('Kenenisa Beyan')}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>⚡ Autofill Owner Name (Kenenisa Beyan)</span>
            </button>
          </div>
        </form>

        {/* Found Accounts Card Section */}
        {accounts && accounts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Matched Accounts ({accounts.length})
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Verified
              </span>
            </div>

            {accounts.map((acc, idx) => {
              const isVisible = showFullEmail[acc.email] ?? true;
              const displayEmail = isVisible ? acc.email : acc.maskedEmail;
              const isCopied = copiedEmail === acc.email;

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200/80 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#3B82F6] text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                      {acc.firstName.charAt(0)}
                      {acc.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {acc.displayName || `${acc.firstName} ${acc.lastName}`}
                        </h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-[#3B82F6] border border-blue-200">
                          {acc.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Registered account in KENENISA OS
                      </p>
                    </div>
                  </div>

                  {/* Email display and copy */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Email Address
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 truncate block">
                        {displayEmail}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleEmailVisibility(acc.email)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title={isVisible ? 'Mask email' : 'Reveal full email'}
                      >
                        {isVisible ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(acc.email)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        {isCopied ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            ✓ Copied
                          </span>
                        ) : (
                          <span>Copy</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions for this account */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/login?email=${encodeURIComponent(acc.email)}`)}
                      className="py-2.5 px-3 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Sign In with Email</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/forgot-password?email=${encodeURIComponent(acc.email)}`)}
                      className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Reset Password</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Helper Links */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <Link
            to="/login"
            className="font-semibold text-[#3B82F6] hover:text-blue-700 hover:underline transition-colors"
          >
            Remembered your email? Sign In
          </Link>
          <Link
            to="/forgot-password"
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            Forgot your password instead?
          </Link>
        </div>

        <div className="mt-6 text-center text-xs font-medium text-slate-400">
          Protected Owner System &bull; V1.0.0
        </div>
      </div>
    </div>
  );
};
