// app/account/(protected)/wishlist/page.tsx

'use client';

import { AccountLayout } from '@/components/account/AccountLayout';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { ProductCard } from '@/components/product/ProductCard';
import { Heart, Loader2 } from 'lucide-react';

/**
 * User Wishlist Page.
 * Displays products saved by the user, fetched via API.
 */
export default function WishlistPage() {
  const { items, isLoading, isError, itemCount } = useWishlist();

  if (isLoading) {
    return (
      <AccountLayout>
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        Your Wishlist <span className="text-foreground/60 ml-3 text-xl">({itemCount})</span>
      </h2>
      
      {itemCount === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg p-6 text-foreground/70">
            <Heart className="w-12 h-12 mx-auto mb-4 text-primary/50" />
            <p className="text-xl font-semibold">Your Wishlist is Empty</p>
            <p className="text-base">Tap the heart icon on any product to save it here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            // Reusing the ProductCard for a consistent listing experience
            <ProductCard key={item.product.id} product={item.product} /> 
          ))}
        </div>
      )}
    </AccountLayout>
  );
}