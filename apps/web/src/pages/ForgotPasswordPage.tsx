import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth.js';
import { forgotPasswordSchema, resetPasswordSchema, PASSWORD_MIN_LENGTH } from '@kenenisa-os/shared';
import { ApiError } from '../lib/api-client.js';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Step state: 1 = Enter Email, 2 = Enter Code & New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [email, setEmail] = useState('beyankenenisa@kenenisa.com');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Handle Step 1: Request reset code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldErrors({ email: result.error.format().email?._errors[0] });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPassword({ email: result.data.email });
      if (response && response.resetCode) {
        setGeneratedCode(response.resetCode);
        setCode(response.resetCode); // Convenience prefill
      }
      setStep(2);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to request password reset code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2: Confirm reset with code & new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    const result = resetPasswordSchema.safeParse({
      email,
      code,
      newPassword,
    });

    if (!result.success) {
      const formatted = result.error.format();
      setFieldErrors({
        email: formatted.email?._errors[0],
        code: formatted.code?._errors[0],
        newPassword: formatted.newPassword?._errors[0],
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({
        email: result.data.email,
        code: result.data.code,
        newPassword: result.data.newPassword,
      });
      setStep(3);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to reset password. Please verify your code and try again.');
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
            Recovery
          </span>
        </div>

        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3AB1EC] to-[#3B82F6] text-white font-extrabold text-2xl shadow-lg shadow-blue-500/20 mb-3">
            K
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {step === 3 ? 'Password Reset Complete' : 'Forgot Password?'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1 && 'Enter your account email to receive your secure recovery code'}
            {step === 2 && 'Enter the verification code and set your new account password'}
            {step === 3 && 'Your password has been securely updated. You can now sign in.'}
          </p>
        </div>

        {/* Progress Step Indicator */}
        {step !== 3 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 1 ? 'w-10 bg-[#3B82F6]' : 'w-6 bg-slate-200'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 2 ? 'w-10 bg-[#3B82F6]' : 'w-6 bg-slate-200'
              }`}
            />
          </div>
        )}

        {/* Global Error Alert */}
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

        {/* STEP 1: Request Code Form */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Account Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beyankenenisa@kenenisa.com"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  fieldErrors.email ? 'border-rose-400' : 'border-slate-300'
                } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all`}
              />
              {fieldErrors.email && (
                <p className="text-rose-600 text-xs font-medium mt-1.5">{fieldErrors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Code...</span>
                </>
              ) : (
                <span>Request Recovery Code</span>
              )}
            </button>

            {/* Autofill Owner Helper */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEmail('beyankenenisa@kenenisa.com')}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                ⚡ Autofill Owner Email (beyankenenisa@kenenisa.com)
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter Code & New Password Form */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            {/* Generated Code Highlight Card */}
            {generatedCode && (
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-blue-700">
                    🔑 Recovery Code
                  </span>
                  <span className="font-mono text-base font-extrabold tracking-widest text-[#3B82F6] bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-sm">
                    {generatedCode}
                  </span>
                </div>
                <p className="text-[11px] text-blue-600">
                  This code has been prefilled below and is valid for 15 minutes.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="verification-code"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                6-Digit Verification Code
              </label>
              <input
                id="verification-code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                placeholder="123456"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  fieldErrors.code ? 'border-rose-400' : 'border-slate-300'
                } rounded-xl text-slate-900 text-base font-mono tracking-widest text-center placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all`}
              />
              {fieldErrors.code && (
                <p className="text-rose-600 text-xs font-medium mt-1.5">{fieldErrors.code}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 12 characters"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-slate-50 border ${
                    fieldErrors.newPassword ? 'border-rose-400' : 'border-slate-300'
                  } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-xs font-semibold px-2 py-1 rounded bg-slate-200/60 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Must be at least {PASSWORD_MIN_LENGTH} characters long.
              </p>
              {fieldErrors.newPassword && (
                <p className="text-rose-600 text-xs font-medium mt-1.5">
                  {fieldErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  fieldErrors.confirmPassword ? 'border-rose-400' : 'border-slate-300'
                } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all`}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-rose-600 text-xs font-medium mt-1.5">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Confirm & Reset Password</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Request a different code
            </button>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center space-y-6 py-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl mx-auto shadow-inner">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Password Changed!</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Your new password has been verified and updated. All active sessions have been
                invalidated for your security.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-3.5 px-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Sign In With New Password</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-xs font-medium text-slate-400">
          Protected Owner System &bull; V1.0.0
        </div>
      </div>
    </div>
  );
};
