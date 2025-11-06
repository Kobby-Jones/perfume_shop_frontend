// lib/hooks/useAuth.tsx

'use client';

import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { apiFetch, setToken, removeToken, getToken } from '@/lib/api/httpClient';

// Define the user type based on backend response
interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider
 * Handles session management, login, registration, and logout with backend API.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  /**
   * Initial load: check if token exists locally.
   * If yes, mark as authenticated and set placeholder user data.
   * In a real app, you should verify token validity via /auth/me.
   */
  useEffect(() => {
    // Step 1: Retrieve stored token
    const token = getToken();

    if (token) {
      // If token exists, assume a valid session for now
      setIsLoggedIn(true);
      setUser({ id: 999, name: 'Guest User', email: 'verified@user.com' });
    }

    // Step 2: Mark as finished loading after token check
    setIsLoading(false);
    setIsReady(true);
  }, []);

  /**
   * Handles user login via backend API.
   * On success, store the token and user info in local state.
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      setToken(data.token);
      setIsLoggedIn(true);
      setUser(data.user); 
      setIsLoading(false);

      
    } catch (error) {
      setIsLoading(false);
      throw error; 
    }
};

  /**
   * Handles new user registration via backend API.
   * Stores token and user info on success.
   */
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      setToken(data.token);
      setIsLoggedIn(true);
      
      // CRITICAL FIX: Set the user data from the registration response
      setUser(data.user); 
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
};

  /**
   * Logs out the user by clearing token and local session state.
   * Also attempts to notify backend for cleanup.
   */
  const logout = () => {
    apiFetch('/auth/logout', { method: 'POST' }).catch((err) =>
      console.error('Logout API failed:', err)
    );

    removeToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      login,
      register,
      logout,
      isLoading,
      isReady,
    }),
    [isLoggedIn, user, isLoading, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook for accessing the authentication context.
 * Must be used within an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
