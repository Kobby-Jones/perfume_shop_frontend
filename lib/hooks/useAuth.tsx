// lib/hooks/useAuth.tsx

'use client';

import { createContext, useContext, useState, useMemo, ReactNode, useEffect, useCallback } from 'react';
import { apiFetch, setToken, removeToken, getToken, setCsrfToken, removeCsrfToken } from '@/lib/api/httpClient';
import { toast } from 'sonner';

// Updated User interface to match backend
interface User {
  id: number;
  name: string;
  phoneNumber: string; // Primary identifier
  email?: string;      // Optional now
  role: 'user' | 'admin' | 'staff';
  createdAt?: string; 
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (phoneNumber: string, password: string) => Promise<User>;
  register: (name: string, phoneNumber: string, password: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<User>; // NEW: OTP Verification
  resendOtp: (phoneNumber: string) => Promise<void>; // NEW: Resend OTP
  logout: () => void;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URLS = {
  ME: '/auth/me',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY: '/auth/verify',     // Backend endpoint for OTP verification
  RESEND: '/auth/resend-otp', // Backend endpoint for resending OTP
  LOGOUT: '/auth/logout',
  CSRF_TOKEN: '/csrf-token',
};

const fetchCsrfToken = async () => {
  try {
    if (typeof window === 'undefined') return;
    const csrfData = await apiFetch(API_URLS.CSRF_TOKEN);
    if (csrfData.csrfToken) setCsrfToken(csrfData.csrfToken);
  } catch (e) {
    console.error('Failed to fetch CSRF token:', e);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    const token = getToken();
    await fetchCsrfToken(); // Ensure CSRF is always fresh on load

    if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
        return;
    }

    try {
      const data = await apiFetch(API_URLS.ME);
      setIsLoggedIn(true);
      setUser(data.user);
    } catch (error) {
      console.error('Session validation failed:', error);
      removeToken();
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  // --- Login (Phone + Password) ---
  const login = async (phoneNumber: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch(API_URLS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
      });
      
      setToken(data.token);
      setIsLoggedIn(true);
      setUser(data.user);
      await fetchCsrfToken();
      return data.user;
    } catch (error) {
      setIsLoading(false);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  // --- Register (Step 1: Send OTP) ---
  const register = async (name: string, phoneNumber: string, password: string) => {
    setIsLoading(true);
    try {
      // This triggers the SMS but does NOT log the user in yet
      await apiFetch(API_URLS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({ name, phoneNumber, password }),
      });
      
      await fetchCsrfToken();
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
        setIsLoading(false);
    }
  };

  // --- Verify OTP (Step 2: Confirm & Login) ---
  const verifyOtp = async (phoneNumber: string, otp: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch(API_URLS.VERIFY, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, otp }),
      });

      setToken(data.token);
      setIsLoggedIn(true);
      setUser(data.user);
      await fetchCsrfToken();
      return data.user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- Resend OTP ---
  const resendOtp = async (phoneNumber: string) => {
      await apiFetch(API_URLS.RESEND, {
          method: 'POST',
          body: JSON.stringify({ phoneNumber })
      });
  };

  const logout = () => {
    apiFetch(API_URLS.LOGOUT, { method: 'POST' }).catch(console.error);
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
    fetchCsrfToken();
    toast.info("You have been signed out.");
  };

  const value = useMemo(() => ({
      isLoggedIn, user, login, register, verifyOtp, resendOtp, logout, isLoading, refetchUser
  }), [isLoggedIn, user, isLoading, refetchUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};