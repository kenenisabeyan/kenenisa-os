import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client.js';
import type {
  PublicUserDto,
  AuthState,
  LoginInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@kenenisa-os/shared';

export interface AuthContextValue {
  user: PublicUserDto | null;
  authState: AuthState;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<PublicUserDto>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  changePassword: (payload: ChangePasswordInput) => Promise<void>;
  forgotPassword: (
    payload: ForgotPasswordInput,
  ) => Promise<{ email: string; resetCode: string; expiresInMinutes: number }>;
  resetPassword: (payload: ResetPasswordInput) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUserDto | null>(null);
  const [authState, setAuthState] = useState<AuthState>('UNKNOWN');

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiClient<{ user: PublicUserDto }>('/api/v1/auth/me');
      setUser(data.user);
      setAuthState('AUTHENTICATED');
    } catch {
      setUser(null);
      setAuthState('UNAUTHENTICATED');
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials: LoginInput): Promise<PublicUserDto> => {
    const data = await apiClient<{ user: PublicUserDto }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(data.user);
    setAuthState('AUTHENTICATED');
    return data.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Safe fallback clear even if server logout errored
    } finally {
      setUser(null);
      setAuthState('UNAUTHENTICATED');
    }
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordInput): Promise<void> => {
    await apiClient('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }, []);

  const forgotPassword = useCallback(
    async (
      payload: ForgotPasswordInput,
    ): Promise<{ email: string; resetCode: string; expiresInMinutes: number }> => {
      const response = await apiClient<{
        email: string;
        resetCode: string;
        expiresInMinutes: number;
      }>('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    },
    [],
  );

  const resetPassword = useCallback(async (payload: ResetPasswordInput): Promise<void> => {
    await apiClient('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }, []);

  const value: AuthContextValue = {
    user,
    authState,
    isAuthenticated: authState === 'AUTHENTICATED',
    isLoading: authState === 'UNKNOWN',
    login,
    logout,
    checkAuth,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

