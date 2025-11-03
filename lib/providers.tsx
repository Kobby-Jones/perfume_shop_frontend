// lib/providers.tsx

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CartProvider } from './hooks/useCart';

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
 * Now includes TanStack Query and CartProvider.
 * @param children - The child components.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {/* Nesting CartProvider here makes cart state available globally */}
        <CartProvider> 
          {children}
        </CartProvider>
      </QueryClientProvider>
    );
  }