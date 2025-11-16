// lib/hooks/useAuth.tsx

'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';

import {
  apiFetch,
  setToken,
  removeToken,
  getToken,
  setCsrfToken,
  removeCsrfToken,
} from '@/lib/api/httpClient';

import { toast } from 'sonner';

// ---- TYPES ----
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- API URLS ----
const API_URLS = {
  ME: '/auth/me',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  CSRF_TOKEN: '/csrf-token',
};

// ---- FETCH CSRF TOKEN ----
const fetchCsrfToken = async () => {
  try {
    const csrfData = await apiFetch(API_URLS.CSRF_TOKEN);
    if (csrfData.csrfToken) {
      setCsrfToken(csrfData.csrfToken);
    }
  } catch (e) {
    console.error('Failed to fetch CSRF token:', e);
  }
};

// =======================================================
//                AUTH PROVIDER
// =======================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---- REFRESH SESSION ----
  const refetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
      removeCsrfToken(); // IMPORTANT
      return;
    }

    try {
      const data = await apiFetch(API_URLS.ME);

      setIsLoggedIn(true);
      setUser(data.user);

      // Fetch CSRF after session revalidation
      await fetchCsrfToken();
    } catch (error) {
      console.error('Session validation failed:', error);

      removeToken();
      setIsLoggedIn(false);
      setUser(null);
      removeCsrfToken(); // clear CSRF
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load session on mount
  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  // =======================================================
  //                    LOGIN
  // =======================================================
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch(API_URLS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setIsLoggedIn(true);
      setUser(data.user);

      // Fetch CSRF token
      await fetchCsrfToken();
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // =======================================================
  //                    REGISTER
  // =======================================================
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch(API_URLS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      setToken(data.token);
      setIsLoggedIn(true);
      setUser(data.user);

      // Fetch CSRF token
      await fetchCsrfToken();
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // =======================================================
  //                    LOGOUT
  // =======================================================
  const logout = () => {
    apiFetch(API_URLS.LOGOUT, { method: 'POST' }).catch((err) =>
      console.error('Logout API failed:', err)
    );

    removeToken();
    removeCsrfToken();
    setIsLoggedIn(false);
    setUser(null);

    toast.info('You have been signed out.');
  };

  // =======================================================
  //                    CONTEXT VALUE
  // =======================================================
  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      login,
      register,
      logout,
      isLoading,
      refetchUser,
    }),
    [isLoggedIn, user, isLoading, refetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---- PUBLIC HOOK ----
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
