// lib/hooks/useCart.tsx

'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/httpClient';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner'; 
import { Product } from '@/lib/data/mock-products'; // Used for local type definition

// --- API Response & Type Definitions ---
// Matches the structure returned by GET /api/cart
interface CartResponse {
  items: CartDetailItem[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    grandTotal: number;
  };
}

export interface CartDetailItem {
  productId: number;
  quantity: number;
  product: Product; // Full product details included here
  subtotal: number;
}

interface CartContextType {
  cartDetails: CartDetailItem[];
  cartTotal: number;
  totalItems: number;
  totals: CartResponse['totals'] | undefined;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  refetchCart: () => void; // Added for manual checkout trigger
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_QUERY_KEY = 'cart';

/**
 * Core cart logic integrated with backend, auth, and Sonner notifications
 */
const useCartLogic = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // --- 1. Fetch Cart Data (Only when logged in) ---
  const { data, isLoading, refetch } = useQuery<CartResponse>({
    queryKey: [CART_QUERY_KEY],
    queryFn: () => apiFetch('/cart'), // Live API call
    enabled: isLoggedIn && !isAuthLoading, // Fetch only if authenticated and auth state is settled
    staleTime: 1000 * 30,
  });
  
  const refetchCart = () => refetch();

  const cartDetails = data?.items || [];
  const totals = data?.totals;
  const cartTotal = totals?.subtotal || 0;

  // --- 2. Derived Values ---
  const totalItems = useMemo(
    () => cartDetails.reduce((sum, item) => sum + item.quantity, 0),
    [cartDetails]
  );

  // --- 3. Mutations (Uses TanStack Query to keep UI in sync) ---

  // Unified mutation for add/update
  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      toast.success('Cart updated.');
    },
    onError: (error: any) => {
      console.error('Cart update failed:', error);
      toast.error(error.message || 'Failed to update cart. Check stock and try again.');
    },
  });

  // Mutation for removing an item
  const removeCartMutation = useMutation({
    mutationFn: (productId: number) =>
      apiFetch(`/cart/${productId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      toast.success('Item removed from cart');
    },
    onError: (error: any) => {
      console.error('Cart item removal failed:', error);
      toast.error(error.message || 'Failed to remove item. Try again.');
    },
  });

  // --- 4. Auth-Protected Action Wrapper ---
  const checkAuthAndProceed = useCallback(
    (action: () => void) => {
      if (!isLoggedIn) {
        toast.warning('Please sign in to manage your cart');
        router.push('/account/auth/login');
        return;
      }
      action();
    },
    [isLoggedIn, router]
  );

  // --- 5. Cart Actions ---
  const addToCart = useCallback(
    (productId: number, quantity: number = 1) => {
      checkAuthAndProceed(() => {
        // Calculate the target quantity: find existing, add new quantity
        const existingItem = cartDetails.find(item => item.productId === productId);
        const targetQuantity = (existingItem?.quantity || 0) + quantity;
        
        updateCartMutation.mutate({ productId, quantity: targetQuantity });
      });
    },
    [cartDetails, updateCartMutation, checkAuthAndProceed]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      checkAuthAndProceed(() => {
        if (quantity <= 0) {
          removeCartMutation.mutate(productId);
          return;
        }
        updateCartMutation.mutate({ productId, quantity });
      });
    },
    [updateCartMutation, removeCartMutation, checkAuthAndProceed]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      checkAuthAndProceed(() => removeCartMutation.mutate(productId));
    },
    [removeCartMutation, checkAuthAndProceed]
  );

  const clearCart = useCallback(() => {
    // NOTE: Backend API for /api/cart/clear is missing, keeping the mock toast.
    toast.info('Clear cart feature not yet implemented on the backend.');
  }, []);

  // --- 6. Return All Cart Utilities ---
  return {
    cartDetails,
    cartTotal,
    totalItems,
    totals,
    isLoading: isLoading || isAuthLoading, // Combine loading states
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refetchCart,
  };
};

// --- Provider & Hook ---
export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCartLogic();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};