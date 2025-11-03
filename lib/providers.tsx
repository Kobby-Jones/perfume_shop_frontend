// lib/providers.tsx

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Create a client instance outside of the component to prevent re-instantiation on every render.
// We disable window focus refetching to enhance UX and performance by default.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
      refetchOnWindowFocus: false, // Prevents unnecessary background refetches
    },
  },
});

/**
 * Global provider component to wrap the entire application.
 * Includes TanStack Query (React Query) for state management and data fetching.
 * Future providers (e.g., CartProvider, AuthProvider) will be nested here.
 * @param children - The child components to be rendered within the context.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* NOTE: Future providers (e.g., CartProvider, AuthProvider) 
        should be nested here to provide global state. 
      */}
      {children}
    </QueryClientProvider>
  );
}