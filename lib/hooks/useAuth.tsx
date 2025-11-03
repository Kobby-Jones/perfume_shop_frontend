// lib/hooks/useAuth.tsx

'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

/**
 * Interface for the authentication context.
 */
interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Mock Auth Provider for front-end readiness.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Simulating authentication state. Default is logged out.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  /**
   * Mock login function. In a real app, this verifies credentials via API.
   */
  const login = (email: string) => {
    // Mock successful login
    setIsLoggedIn(true);
    setUser({ name: 'Jane Doe', email: email });
    console.log('User logged in (Mock)');
  };

  /**
   * Mock logout function. Clears session/token in a real app.
   */
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    console.log('User logged out (Mock)');
  };

  const value = useMemo(() => ({
    isLoggedIn,
    user,
    login,
    logout,
  }), [isLoggedIn, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to consume the authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};