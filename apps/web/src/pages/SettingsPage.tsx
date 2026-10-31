import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../features/auth/useAuth.js';
import { changePasswordSchema, createUserSchema } from '@kenenisa-os/shared';
import type { PublicUserDto, CreateUserInput, AuthSessionDto, AuditLogDto, UserSettingsDto } from '@kenenisa-os/shared';
import { apiClient, ApiError } from '../lib/api-client.js';
import { useToast } from '../components/ui/Toast.js';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user, changePassword, updateProfile } = useAuth();

  // Profile Edit state
  const [profileFirstName, setProfileFirstName] = useState(user?.firstName || '');
  const [profileLastName, setProfileLastName] = useState(user?.lastName || '');
  const [profileDisplayName, setProfileDisplayName] = useState(user?.displayName || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileFirstName(user.firstName);
      setProfileLastName(user.lastName);
      setProfileDisplayName(user.displayName);
    }
  }, [user]);

  // Preferences & Capacity state
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsTimezone, setSettingsTimezone] = useState('Africa/Addis_Ababa');
  const [settingsWeekStartsOn, setSettingsWeekStartsOn] = useState(1);
  const [settingsDailyCapacity, setSettingsDailyCapacity] = useState(480);
  const [settingsWeeklyCapacity, setSettingsWeeklyCapacity] = useState(2400);
  const [settingsDefaultPriority, setSettingsDefaultPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P2');
  const [settingsDefaultView, setSettingsDefaultView] = useState<'board' | 'list'>('board');

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Active Sessions state
  const [sessionsList, setSessionsList] = useState<AuthSessionDto[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Security Audit Logs state
  const [auditLogsList, setAuditLogsList] = useState<AuditLogDto[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // User Management state (for OWNER / ADMIN)
  const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN';
  const [usersList, setUsersList] = useState<PublicUserDto[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userListError, setUserListError] = useState<string | null>(null);

  // Create User Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'OWNER'>('USER');

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createModalError, setCreateModalError] = useState<string | null>(null);
  const [createModalFieldErrors, setCreateModalFieldErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  // Fetch Active Sessions
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionError(null);
    try {
      const data = await apiClient<{ sessions: AuthSessionDto[] }>('/api/v1/auth/sessions');
      setSessionsList(data.sessions);
    } catch {
      setSessionError('Failed to load active sessions.');
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Fetch Security Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await apiClient<{ logs: AuditLogDto[] }>('/api/v1/auth/audit-logs');
      setAuditLogsList(data.logs);
    } catch {
      // Safe fallback ignore
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  // Fetch System Users
  const fetchUsers = useCallback(async () => {
    if (!isOwnerOrAdmin) return;
    setIsLoadingUsers(true);
    setUserListError(null);
    try {
      const data = await apiClient<{ users: PublicUserDto[] }>('/api/v1/users');
      setUsersList(data.users);
    } catch (err) {
      if (err instanceof ApiError) {
        setUserListError(err.message);
      } else {
        setUserListError('Failed to load system users list.');
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isOwnerOrAdmin]);

  // Fetch User Settings & Preferences
  const fetchSettings = useCallback(async () => {
    try {
      const data = await apiClient<{ settings: UserSettingsDto }>('/api/v1/auth/settings');
      setSettingsTimezone(data.settings.timezone);
      setSettingsWeekStartsOn(data.settings.weekStartsOn);
      setSettingsDailyCapacity(data.settings.dailyWorkCapacityMinutes);
      setSettingsWeeklyCapacity(data.settings.weeklyWorkCapacityMinutes);
      setSettingsDefaultPriority(data.settings.defaultTaskPriority);
      setSettingsDefaultView(data.settings.defaultProjectView === 'list' ? 'list' : 'board');
    } catch {
      // Safe fallback ignore
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFirstName.trim() || !profileLastName.trim()) {
      showToast('First and last name cannot be empty', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile({
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        displayName: profileDisplayName.trim() || `${profileFirstName.trim()} ${profileLastName.trim()}`,
      });
      showToast('Profile details updated successfully', 'success');
      void fetchAuditLogs();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await apiClient<{ settings: UserSettingsDto }>('/api/v1/auth/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          timezone: settingsTimezone,
          weekStartsOn: settingsWeekStartsOn,
          dailyWorkCapacityMinutes: Number(settingsDailyCapacity),
          weeklyWorkCapacityMinutes: Number(settingsWeeklyCapacity),
          defaultTaskPriority: settingsDefaultPriority,
          defaultProjectView: settingsDefaultView,
          theme: 'light',
        }),
      });
      showToast('Operating capacity & preferences updated successfully', 'success');
      void fetchAuditLogs();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    void fetchSessions();
    void fetchAuditLogs();
    void fetchUsers();
    void fetchSettings();
  }, [fetchSessions, fetchAuditLogs, fetchSettings, fetchUsers]);

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordFieldErrors({});

    if (newPassword !== confirmPassword) {
      setPasswordFieldErrors({ confirmPassword: 'Confirm password does not match new password' });
      return;
    }

    const validationResult = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
    });

    if (!validationResult.success) {
      const formatted = validationResult.error.format();
      setPasswordFieldErrors({
        currentPassword: formatted.currentPassword?._errors[0],
        newPassword: formatted.newPassword?._errors[0],
      });
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Your password has been changed successfully!');
      showToast('Your password has been changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      void fetchAuditLogs();
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.message);
        showToast(err.message, 'error');
      } else {
        setPasswordError('Failed to change password. Please check your credentials and try again.');
        showToast('Failed to change password', 'error');
      }
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient(`/api/v1/auth/sessions/${sessionId}`, { method: 'DELETE' });
      showToast('Device session revoked', 'info');
      void fetchSessions();
      void fetchAuditLogs();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, 'error');
      } else {
        showToast('Failed to revoke session', 'error');
      }
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    const otherSessions = sessionsList.filter((s) => !s.isCurrent);
    if (otherSessions.length === 0) return;

    if (!confirm('Are you sure you want to revoke access from all other devices?')) return;

    for (const sess of otherSessions) {
      await apiClient(`/api/v1/auth/sessions/${sess.id}`, { method: 'DELETE' }).catch(() => {});
    }
    showToast('All other device sessions revoked', 'info');
    void fetchSessions();
    void fetchAuditLogs();
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateModalError(null);
    setCreateModalFieldErrors({});

    const payload: CreateUserInput = {
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      password: newUserPassword,
      role: newRole,
    };

    const validation = createUserSchema.safeParse(payload);
    if (!validation.success) {
      const formatted = validation.error.format();
      setCreateModalFieldErrors({
        email: formatted.email?._errors[0],
        password: formatted.password?._errors[0],
        firstName: formatted.firstName?._errors[0],
        lastName: formatted.lastName?._errors[0],
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      await apiClient<{ user: PublicUserDto }>('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify(validation.data),
      });

      showToast('User account provisioned successfully', 'success');
      setIsCreateModalOpen(false);
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewUserPassword('');
      setNewRole('USER');
      void fetchUsers();
      void fetchAuditLogs();
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateModalError(err.message);
        showToast(err.message, 'error');
      } else {
        setCreateModalError('Failed to provision new user account.');
        showToast('Failed to provision new user account', 'error');
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUserStatus = async (targetUser: PublicUserDto) => {
    try {
      await apiClient<{ user: PublicUserDto }>(`/api/v1/users/${targetUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !targetUser.isActive }),
      });
      showToast(`User ${targetUser.displayName} ${!targetUser.isActive ? 'activated' : 'deactivated'}`, 'info');
      void fetchUsers();
      void fetchAuditLogs();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, 'error');
      } else {
        showToast('Failed to update user status', 'error');
      }
    }
  };

  const handleDeleteUser = async (targetUser: PublicUserDto) => {
    if (!confirm(`Are you sure you want to delete account for ${targetUser.displayName}?`)) {
      return;
    }
    try {
      await apiClient(`/api/v1/users/${targetUser.id}`, { method: 'DELETE' });
      showToast(`User ${targetUser.displayName} deleted`, 'info');
      void fetchUsers();
      void fetchAuditLogs();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, 'error');
      } else {
        showToast('Failed to delete user', 'error');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Security Settings</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage your account security, credentials, active sessions, and system access for KENENISA OS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Overview Card */}
        <div className="md:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
              {(user?.displayName || 'K')[0]}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{user?.displayName || 'Kenenisa Beyan'}</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-50 text-cyan-700 border border-cyan-200/80">
                {user?.role || 'OWNER'}
              </span>
            </div>
          </div>

          <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1">First Name</label>
              <input
                type="text"
                value={profileFirstName}
                onChange={(e) => setProfileFirstName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1">Last Name</label>
              <input
                type="text"
                value={profileLastName}
                onChange={(e) => setProfileLastName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="Last name"
                required
              />
            </div>
            <div>
              <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1">Display Name</label>
              <input
                type="text"
                value={profileDisplayName}
                onChange={(e) => setProfileDisplayName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="Display name"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full mt-2 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSavingProfile ? 'Saving Profile...' : 'Save Profile Details'}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Primary Email</span>
              <span className="font-semibold text-slate-800 break-all">{user?.email || 'beyankenenisa@gmail.com'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Registration Policy</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                🔒 Public Signup Disabled
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">System Status</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active & Protected
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form Card */}
        <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500">Update your account password. Passwords must be at least 12 characters.</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Alerts */}
          {passwordSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmitPasswordChange(e)} className="space-y-5">
            {/* Current Password */}
            <div>
              <label htmlFor="current-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={isSubmittingPassword}
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${
                    passwordFieldErrors.currentPassword ? 'border-rose-400' : 'border-slate-300'
                  } rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 pr-14 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200/60"
                >
                  {showCurrentPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {passwordFieldErrors.currentPassword && (
                <p className="text-rose-600 text-xs font-medium mt-1">{passwordFieldErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 12 chars)"
                  disabled={isSubmittingPassword}
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${
                    passwordFieldErrors.newPassword ? 'border-rose-400' : 'border-slate-300'
                  } rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 pr-14 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200/60"
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {passwordFieldErrors.newPassword && (
                <p className="text-rose-600 text-xs font-medium mt-1">{passwordFieldErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isSubmittingPassword}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${
                  passwordFieldErrors.confirmPassword ? 'border-rose-400' : 'border-slate-300'
                } rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              {passwordFieldErrors.confirmPassword && (
                <p className="text-rose-600 text-xs font-medium mt-1">{passwordFieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingPassword ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Operating Capacity & Regional Preferences */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Operating Capacity & Regional Preferences</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Core Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure daily/weekly available work hours, timezone, and operational defaults used across planning, reviews, and analytics.
            </p>
          </div>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <form onSubmit={(e) => void handleSaveSettings(e)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Daily Capacity */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold block">Daily Work Capacity</label>
                <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {Math.floor(settingsDailyCapacity / 60)}h {settingsDailyCapacity % 60}m
                </span>
              </div>
              <input
                type="number"
                min="30"
                max="1440"
                step="15"
                value={settingsDailyCapacity}
                onChange={(e) => setSettingsDailyCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
              <p className="text-[10px] text-slate-400">Total planned work minutes per day (e.g. 480m = 8h)</p>
            </div>

            {/* Weekly Capacity */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold block">Weekly Work Capacity</label>
                <span className="font-mono text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {Math.floor(settingsWeeklyCapacity / 60)}h {settingsWeeklyCapacity % 60}m
                </span>
              </div>
              <input
                type="number"
                min="60"
                max="10080"
                step="60"
                value={settingsWeeklyCapacity}
                onChange={(e) => setSettingsWeeklyCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
              <p className="text-[10px] text-slate-400">Total planned work minutes per week (e.g. 2400m = 40h)</p>
            </div>

            {/* Timezone */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <label className="text-slate-700 font-bold block">Operating Timezone</label>
              <select
                value={settingsTimezone}
                onChange={(e) => setSettingsTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT +03:00)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New York (Eastern Time)</option>
                <option value="America/Chicago">America/Chicago (Central Time)</option>
                <option value="America/Denver">America/Denver (Mountain Time)</option>
                <option value="America/Los_Angeles">America/Los Angeles (Pacific Time)</option>
                <option value="Europe/London">Europe/London (GMT / BST)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET / CEST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST +09:00)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
              <p className="text-[10px] text-slate-400">Determines day boundaries and schedule timestamps</p>
            </div>

            {/* Week Starts On */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <label className="text-slate-700 font-bold block">First Day of the Week</label>
              <select
                value={settingsWeekStartsOn}
                onChange={(e) => setSettingsWeekStartsOn(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value={1}>Monday (Standard ISO)</option>
                <option value={0}>Sunday</option>
                <option value={6}>Saturday</option>
              </select>
              <p className="text-[10px] text-slate-400">Weekly planning horizon and reviews alignment</p>
            </div>

            {/* Default Task Priority */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <label className="text-slate-700 font-bold block">Default Task Priority</label>
              <select
                value={settingsDefaultPriority}
                onChange={(e) => setSettingsDefaultPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="P0">P0 - Critical / Immediate</option>
                <option value="P1">P1 - High Priority</option>
                <option value="P2">P2 - Normal Priority</option>
                <option value="P3">P3 - Low Priority</option>
              </select>
              <p className="text-[10px] text-slate-400">Initial priority assigned when quick-creating tasks</p>
            </div>

            {/* Default Project View */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <label className="text-slate-700 font-bold block">Default Project View</label>
              <select
                value={settingsDefaultView}
                onChange={(e) => setSettingsDefaultView(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="board">Kanban Board</option>
                <option value="list">Linear Task List</option>
              </select>
              <p className="text-[10px] text-slate-400">Primary layout for project task workflows</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSavingSettings ? 'Saving Preferences...' : 'Save Operating Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Logged-In Sessions Panel */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Devices & Sessions</h2>
            <p className="text-xs text-slate-500">
              Manage all active sessions and devices currently logged into your KENENISA OS account.
            </p>
          </div>
          {sessionsList.filter((s) => !s.isCurrent).length > 0 && (
            <button
              onClick={() => void handleRevokeAllOtherSessions()}
              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors shrink-0"
            >
              Revoke All Other Sessions
            </button>
          )}
        </div>

        {sessionError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {sessionError}
          </div>
        )}

        <div className="space-y-3">
          {isLoadingSessions ? (
            <p className="text-xs text-slate-400 py-4 font-medium">Loading active sessions...</p>
          ) : sessionsList.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 font-medium">No active sessions found.</p>
          ) : (
            sessionsList.map((sess) => (
              <div
                key={sess.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900">{sess.userAgent || 'Web Client'}</span>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          This Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>IP: {sess.ipAddress || '127.0.0.1'}</span>
                      <span>&bull;</span>
                      <span>Last active: {new Date(sess.lastUsedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => void handleRevokeSession(sess.id)}
                    className="self-end sm:self-auto py-1.5 px-3 bg-slate-200/70 hover:bg-rose-100 text-slate-600 hover:text-rose-700 font-semibold rounded-lg text-xs transition-colors border border-slate-200"
                  >
                    Revoke Access
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Audit Log History Panel */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Security Audit Trail</h2>
          <p className="text-xs text-slate-500">Real-time log of security events and authentication history for your account.</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2.5 px-3">Event Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Metadata</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingLogs ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 font-medium">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : auditLogsList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 font-medium">
                    No security events logged yet.
                  </td>
                </tr>
              ) : (
                auditLogsList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          log.action.includes('SUCCESS') || log.action === 'USER_CREATED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.action.includes('FAILURE')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{log.entityType}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Section (Owner & Admin Only) */}
      {isOwnerOrAdmin && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">User Management & System Access</h2>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-[10px] rounded uppercase">
                  Owner Provisioning
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Public signups are disabled. Provision new team members and manage active system accounts directly.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Provision New User</span>
            </button>
          </div>

          {userListError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {userListError}
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                      No additional users found.
                    </td>
                  </tr>
                ) : (
                  usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center">
                            {usr.displayName[0]}
                          </div>
                          <span className="font-semibold text-slate-900">{usr.displayName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600">{usr.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            usr.role === 'OWNER'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : usr.role === 'ADMIN'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {usr.isActive ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-500 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {usr.id !== user?.id && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => void handleToggleUserStatus(usr)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              {usr.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => void handleDeleteUser(usr)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision New User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Provision New User Account</h3>
                <p className="text-xs text-slate-500">Add a new authenticated user to KENENISA OS</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createModalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {createModalError}
              </div>
            )}

            <form onSubmit={(e) => void handleCreateUserSubmit(e)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="First Name"
                    disabled={isCreatingUser}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {createModalFieldErrors.firstName && (
                    <p className="text-rose-600 text-[10px] mt-0.5">{createModalFieldErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Last Name"
                    disabled={isCreatingUser}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {createModalFieldErrors.lastName && (
                    <p className="text-rose-600 text-[10px] mt-0.5">{createModalFieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@domain.com"
                  disabled={isCreatingUser}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {createModalFieldErrors.email && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{createModalFieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Min. 12 characters"
                  disabled={isCreatingUser}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {createModalFieldErrors.password && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{createModalFieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  System Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'USER' | 'ADMIN' | 'OWNER')}
                  disabled={isCreatingUser}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">USER (Standard Access)</option>
                  <option value="ADMIN">ADMIN (Administrative Access)</option>
                  <option value="OWNER">OWNER (Full System Privilege)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreatingUser}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  {isCreatingUser ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
