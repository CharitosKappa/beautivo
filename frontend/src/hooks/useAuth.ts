'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth';

type AdminLoginResponse =
  | {
      requires2FA: true;
      tempToken: string;
    }
  | {
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role?: { id: string; name: string };
      };
    };

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    setAccessToken(getAccessToken());
    setRefreshToken(getRefreshToken());
  }, []);

  const saveTokens = useCallback((access: string, refresh: string) => {
    setTokens(access, refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
  }, []);

  const logout = useCallback(async () => {
    if (refreshToken) {
      await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
    clearTokens();
    setAccessToken(null);
    setRefreshToken(null);
  }, [refreshToken]);

  const requestCustomerOtp = useCallback(async (shopId: string, email: string) => {
    const response = await apiFetch('/api/v1/auth/customer/request-otp', {
      method: 'POST',
      body: JSON.stringify({ shopId, email }),
    });
    if (!response.ok) {
      throw new Error('OTP request failed');
    }
    return response.json();
  }, []);

  const verifyCustomerOtp = useCallback(async (shopId: string, email: string, otp: string) => {
    const response = await apiFetch('/api/v1/auth/customer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ shopId, email, otp }),
    });
    if (!response.ok) {
      throw new Error('OTP verification failed');
    }
    const data = await response.json();
    saveTokens(data.accessToken, data.refreshToken);
    return data;
  }, [saveTokens]);

  const adminLogin = useCallback(async (email: string, password: string) => {
    const response = await apiFetch('/api/v1/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    const data: AdminLoginResponse = await response.json();
    if ('accessToken' in data) {
      saveTokens(data.accessToken, data.refreshToken);
    }
    return data;
  }, [saveTokens]);

  const verifyAdmin2fa = useCallback(async (tempToken: string, code: string) => {
    const response = await apiFetch('/api/v1/auth/admin/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    });
    if (!response.ok) {
      throw new Error('2FA verification failed');
    }
    const data = await response.json();
    saveTokens(data.accessToken, data.refreshToken);
    return data;
  }, [saveTokens]);

  const setup2fa = useCallback(async () => {
    const response = await apiFetch('/api/v1/auth/admin/setup-2fa', { method: 'POST' });
    if (!response.ok) {
      throw new Error('2FA setup failed');
    }
    return response.json();
  }, []);

  const confirm2fa = useCallback(async (code: string) => {
    const response = await apiFetch('/api/v1/auth/admin/confirm-2fa', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      throw new Error('2FA confirmation failed');
    }
    return response.json();
  }, []);

  const disable2fa = useCallback(async (code: string, password: string) => {
    const response = await apiFetch('/api/v1/auth/admin/disable-2fa', {
      method: 'POST',
      body: JSON.stringify({ code, password }),
    });
    if (!response.ok) {
      throw new Error('2FA disable failed');
    }
    return response.json();
  }, []);

  const refresh = useCallback(async () => {
    if (!refreshToken) {
      return null;
    }
    const response = await apiFetch('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      clearTokens();
      setAccessToken(null);
      setRefreshToken(null);
      return null;
    }
    const data = await response.json();
    saveTokens(data.accessToken, data.refreshToken);
    return data;
  }, [refreshToken, saveTokens]);

  return {
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken),
    requestCustomerOtp,
    verifyCustomerOtp,
    adminLogin,
    verifyAdmin2fa,
    setup2fa,
    confirm2fa,
    disable2fa,
    logout,
    refresh,
  };
}
