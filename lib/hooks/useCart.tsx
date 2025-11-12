// lib/hooks/useCart.tsx

'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/httpClient';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner'; 
import { Product } from '@/lib/types';

// --- API Response & Type Definitions ---
interface CartResponse {
  items: CartDetailItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discountAmount: number;
    grandTotal: number;
  };
  cartTotal: number;
}

export interface CartDetailItem {
  productId: number;
  quantity: number;
  product: Product;
  subtotal: number;
}

interface CartContextType {
  cartDetails: CartDetailItem[];
  rawCartSubtotal: number; 
  totalItems: number;
  totals: CartResponse['totals'] | undefined;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  refetchCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_QUERY_KEY = 'cart';

/**
 * Core cart logic with optimized mutations
 */
const useCartLogic = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // --- 1. Fetch Cart Data ---
  const { data, isLoading, refetch } = useQuery<CartResponse>({
    queryKey: [CART_QUERY_KEY],
    queryFn: () => apiFetch('/cart'),
    enabled: isLoggedIn && !isAuthLoading, 
    staleTime: 1000 * 30,
  });
  
  const refetchCart = () => refetch();

  const cartDetails = data?.items || [];
  const totals = data?.totals;
  const rawCartSubtotal = data?.cartTotal || 0; 

  // --- 2. Derived Values ---
  const totalItems = useMemo(
    () => cartDetails.reduce((sum, item) => sum + item.quantity, 0),
    [cartDetails]
  );

  // --- 3. Optimized Mutations ---
  // Backend now returns 204 No Content, so we rely on query invalidation

  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    onSuccess: () => {
      // Invalidate to trigger background refetch
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
      toast.success('Cart updated');
    },
    onError: (error: any) => {
      console.error('Cart update failed:', error);
      toast.error(error.message || 'Failed to update cart');
    },
  });

  const removeCartMutation = useMutation({
    mutationFn: (productId: number) =>
      apiFetch(`/cart/${productId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
      toast.success('Item removed');
    },
    onError: (error: any) => {
      console.error('Remove failed:', error);
      toast.error(error.message || 'Failed to remove item');
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => apiFetch('/cart/clear', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
      toast.info('Cart cleared');
    },
    onError: (error: any) => {
      console.error('Clear cart failed:', error);
      toast.error(error.message || 'Failed to clear cart');
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

  // --- 5. Optimistic Cart Actions ---
  const addToCart = useCallback(
    (productId: number, quantity: number = 1) => {
      checkAuthAndProceed(() => {
        const existingItem = cartDetails.find(item => item.productId === productId);
        const targetQuantity = (existingItem?.quantity || 0) + quantity;
        
        // Optimistic update
        queryClient.setQueryData<CartResponse>([CART_QUERY_KEY], (old) => {
          if (!old) return old;
          
          const itemIndex = old.items.findIndex(item => item.productId === productId);
          if (itemIndex >= 0) {
            // Update existing item
            const newItems = [...old.items];
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              quantity: targetQuantity,
              subtotal: newItems[itemIndex].product.price * targetQuantity,
            };
            return { ...old, items: newItems };
          } else {
            // Item not in cart yet - will be added by server
            return old;
          }
        });
        
        updateCartMutation.mutate({ productId, quantity: targetQuantity });
      });
    },
    [cartDetails, updateCartMutation, checkAuthAndProceed, queryClient]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      checkAuthAndProceed(() => {
        if (quantity <= 0) {
          // Optimistic removal
          queryClient.setQueryData<CartResponse>([CART_QUERY_KEY], (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.filter(item => item.productId !== productId),
            };
          });
          removeCartMutation.mutate(productId);
          return;
        }
        
        // Optimistic update
        queryClient.setQueryData<CartResponse>([CART_QUERY_KEY], (old) => {
          if (!old) return old;
          const newItems = old.items.map(item =>
            item.productId === productId
              ? { ...item, quantity, subtotal: item.product.price * quantity }
              : item
          );
          return { ...old, items: newItems };
        });
        
        updateCartMutation.mutate({ productId, quantity });
      });
    },
    [updateCartMutation, removeCartMutation, checkAuthAndProceed, queryClient]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      checkAuthAndProceed(() => {
        // Optimistic removal
        queryClient.setQueryData<CartResponse>([CART_QUERY_KEY], (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter(item => item.productId !== productId),
          };
        });
        
        removeCartMutation.mutate(productId);
      });
    },
    [removeCartMutation, checkAuthAndProceed, queryClient]
  );

  const clearCart = useCallback(() => {
    checkAuthAndProceed(() => {
      // Optimistic clear
      queryClient.setQueryData<CartResponse>([CART_QUERY_KEY], (old) => {
        if (!old) return old;
        return { ...old, items: [] };
      });
      
      clearCartMutation.mutate();
    });
  }, [clearCartMutation, checkAuthAndProceed, queryClient]);

  return {
    cartDetails,
    rawCartSubtotal,
    totalItems,
    totals,
    isLoading: isLoading || isAuthLoading,
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