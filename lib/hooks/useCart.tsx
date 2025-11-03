// lib/hooks/useCart.tsx

'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Product, MOCK_PRODUCTS } from '@/lib/data/mock-products';

/**
 * Interface for a single item within the shopping cart.
 */
interface CartItem {
  productId: number;
  quantity: number;
  // NOTE: We don't store the full Product object here; we look it up for current data.
}

/**
 * Interface for the context value provided by the CartProvider.
 */
interface CartContextType {
  cartItems: CartItem[];
  cartDetails: (CartItem & { product: Product | undefined; subtotal: number })[];
  totalItems: number;
  cartTotal: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

// Default context values
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Custom hook to manage all cart logic (add, remove, update, calculation).
 * In a production app, this would use localStorage for persistence or integrate with a server endpoint.
 */
const useCartLogic = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // NOTE: In a real app, product data would be fetched asynchronously here.
  // Using MOCK_PRODUCTS directly for synchronous data look-up.
  const productDataMap = useMemo(() => {
    return MOCK_PRODUCTS.reduce((acc, product) => {
      acc.set(product.id, product);
      return acc;
    }, new Map<number, Product>());
  }, []);

  /**
   * Memoized array containing detailed cart item information (for rendering).
   * Calculates subtotal and looks up product details.
   */
  const cartDetails = useMemo(() => {
    return cartItems.map(item => {
      const product = productDataMap.get(item.productId);
      const subtotal = product ? product.price * item.quantity : 0;
      return {
        ...item,
        product,
        subtotal,
      };
    }).filter(detail => detail.product); // Filter out items where product data lookup failed
  }, [cartItems, productDataMap]);


  /**
   * Calculates the total number of items and the grand total price.
   */
  const { totalItems, cartTotal } = useMemo(() => {
    const total = cartDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const count = cartDetails.reduce((sum, item) => sum + item.quantity, 0);
    return { totalItems: count, cartTotal: total };
  }, [cartDetails]);


  // --- Cart Mutation Functions ---

  const addToCart = useCallback((productId: number, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === productId);
      
      if (existingItem) {
        // If product exists, increment quantity
        return prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // If new product, add to cart
        return [...prevItems, { productId, quantity }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.productId !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return {
    cartItems,
    cartDetails,
    totalItems,
    cartTotal,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};

/**
 * Cart Context Provider component.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCartLogic();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

/**
 * Hook to consume the cart context.
 * @returns The cart context object with all state and actions.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};