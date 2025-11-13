// lib/hooks/useWishlist.tsx

'use client';

import React, { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/httpClient'; 
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Product } from '@/lib/types';

// Define the expected structure
interface WishlistItem {
    product: Product;
    dateAdded: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  isError: boolean;
  itemCount: number;
  isProductInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_QUERY_KEY = 'wishlist';

/**
 * Hook to manage the user's wishlist state via API and TanStack Query.
 */
const useWishlistLogic = () => {
    const queryClient = useQueryClient();
    const { isLoggedIn } = useAuth();

    
    // 1. Fetch Wishlist Data
    const { data, isLoading, isError } = useQuery<{ items: WishlistItem[] }>({
        queryKey: [WISHLIST_QUERY_KEY],
        queryFn: () => apiFetch('/account/wishlist'), // GET /api/account/wishlist
        enabled: isLoggedIn, // Only fetch if user is logged in
    });

    const items = data?.items || [];
    const itemCount = items.length;

    /**
     * Checks if a product is currently in the wishlist.
     */
    const isProductInWishlist = useCallback((productId: number) => {
        return items.some(item => item.product.id === productId);
    }, [items]);

    // 2. Mutation for adding/removing items
    const wishlistMutation = useMutation<any, Error, { productId: number, isAdding: boolean }>({
        mutationFn: ({ productId, isAdding }) => {
            const endpoint = `/account/wishlist/${productId}`;
            // If adding, use POST; if removing, use DELETE on the specific ID
            return apiFetch(isAdding ? '/account/wishlist' : endpoint, {
                method: isAdding ? 'POST' : 'DELETE',
                body: isAdding ? JSON.stringify({ productId }) : undefined,
            });
        },
        onSuccess: (_, variables) => {
            // Invalidate to refetch the latest list
            queryClient.invalidateQueries({ queryKey: [WISHLIST_QUERY_KEY] }); 
            toast.success(variables.isAdding ? "Product added to your wishlist." : "Product removed from your wishlist.");

        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update wishlist. Please try again.");
        },
    });

    /**
     * Toggles the presence of a product in the wishlist.
     * Also handles the redirection/protection check.
     */
    const toggleWishlist = useCallback((productId: number) => {
        if (!isLoggedIn) {
            toast.warning('Please sign in to manage your Wishlist');
            return;
        }

        const isAdding = !isProductInWishlist(productId);
        wishlistMutation.mutate({ productId, isAdding });
    }, [isLoggedIn, isProductInWishlist, wishlistMutation, toast]);

    return {
        items,
        isLoading,
        isError,
        itemCount,
        isProductInWishlist,
        toggleWishlist,
    };
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const wishlist = useWishlistLogic();
  return <WishlistContext.Provider value={wishlist}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};