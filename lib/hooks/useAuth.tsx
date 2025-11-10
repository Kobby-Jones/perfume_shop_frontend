// lib/hooks/useAuth.tsx

'use client';

import { createContext, useContext, useState, useMemo, ReactNode, useEffect, useCallback } from 'react';
import { apiFetch, setToken, removeToken, getToken } from '@/lib/api/httpClient';
import { toast } from 'sonner';

// Define the user type based on backend response, including the role
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin'; // <-- ADDED ROLE
  createdAt?: string; 
}
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refetchUser: () => Promise<void>; // Added for manual refresh
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define API URLs for reusability
const API_URLS = {
  ME: '/auth/me',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
};

/**
 * Authentication Provider
 * Handles session management, login, registration, and token validation with backend API.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Core Session Verification ---
  const refetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
        return;
    }

    try {
      // Validate token with the backend and fetch user details
      const data = await apiFetch(API_URLS.ME);
      
      setIsLoggedIn(true);
      setUser(data.user);
    } catch (error) {
      console.error('Session validation failed:', error);
      // If validation fails, assume token is stale/expired
      removeToken();
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  // --- Auth Actions ---
  
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
      
    } catch (error) {
      setIsLoading(false);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

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
      
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
        setIsLoading(false);
    }
};

  const logout = () => {
    apiFetch(API_URLS.LOGOUT, { method: 'POST' }).catch((err) =>
      console.error('Logout API failed:', err)
    );

    removeToken();
    setIsLoggedIn(false);
    setUser(null);
    toast.info("You have been signed out.");
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};