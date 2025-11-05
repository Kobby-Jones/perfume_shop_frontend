'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/httpClient';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner'; // ✅ Using Sonner instead of useToast
import { Product } from '@/lib/data/mock-products';

// --- API Response & Type Definitions ---
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
  product: Product;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_QUERY_KEY = 'cart';

/**
 * Core cart logic integrated with backend, auth, and Sonner notifications
 */
const useCartLogic = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // --- 1. Fetch Cart Data (Only when logged in) ---
  const { data, isLoading } = useQuery<CartResponse>({
    queryKey: [CART_QUERY_KEY],
    queryFn: () => apiFetch('/cart'),
    enabled: isLoggedIn, // Fetch only if authenticated
  });

  const cartDetails = data?.items || [];
  const totals = data?.totals;
  const cartTotal = totals?.subtotal || 0;

  // --- 2. Derived Values ---
  const totalItems = useMemo(
    () => cartDetails.reduce((sum, item) => sum + item.quantity, 0),
    [cartDetails]
  );

  // --- 3. Mutations ---
  const mutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      toast.success('Item added to cart');
    },
    onError: (error: any) => {
      console.error('Cart update failed:', error);
      toast.error(error.message || 'Failed to update cart. Please try again.');
    },
  });

  const removeMutation = useMutation({
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

  // --- 4. Auth-Protected Actions ---
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
        const existingItem = cartDetails.find(
          (item) => item.productId === productId
        );
        const newQuantity = (existingItem?.quantity || 0) + quantity;
        mutation.mutate({ productId, quantity: newQuantity });
      });
    },
    [cartDetails, mutation, checkAuthAndProceed]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      checkAuthAndProceed(() => {
        if (quantity <= 0) {
          removeMutation.mutate(productId);
          return;
        }
        mutation.mutate({ productId, quantity });
      });
    },
    [mutation, removeMutation, checkAuthAndProceed]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      checkAuthAndProceed(() => removeMutation.mutate(productId));
    },
    [removeMutation, checkAuthAndProceed]
  );

  const clearCart = useCallback(() => {
    toast.info('Clear cart feature not yet implemented');
  }, []);

  // --- 6. Return All Cart Utilities ---
  return {
    cartDetails,
    cartTotal,
    totalItems,
    totals,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
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
