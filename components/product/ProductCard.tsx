// components/product/ProductCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';

import { Product } from '@/lib/data/mock-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

/**
 * Props for the ProductCard component.
 * @property product - The product data object to display.
 */
interface ProductCardProps {
  product: Product;
}

/**
 * A reusable, responsive card component for displaying product information in listings.
 * Features: Image, Name, Price, Stock status, Add to Cart button, and Wishlist icon.
 * Includes professional hover effects and clear stock indicators.
 */
export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.availableStock <= 0;

  // Format price to local currency (assuming USD for example)
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    // The Card provides a clean, elevated container
    <Card className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex flex-col">
      {/* Link wraps the entire card for click navigation */}
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Image component for performance optimization */}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-500 ${isOutOfStock ? 'opacity-50' : 'opacity-100'}`}
            // NOTE: Placeholder image is required in /public/images for this to run
            placeholder="empty" 
          />
          {/* Out of Stock Overlay/Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-lg font-bold uppercase tracking-wider bg-primary px-4 py-1 rounded-full">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4 flex-grow">
        {/* Product Details */}
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-foreground truncate max-w-[75%]">
                <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
                    {product.name}
                </Link>
            </h3>
            {/* Wishlist Icon - Placeholder for future state management */}
            <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" aria-label="Add to Wishlist">
                <Heart className="h-4 w-4 text-foreground/50 hover:text-primary transition-colors" />
            </Button>
        </div>
        
        {/* Price and Category */}
        <p className="text-sm text-foreground/70 mb-2">{product.category} Collection</p>
        <p className="text-xl font-bold text-primary">{formattedPrice}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Add to Cart Button */}
        <Button 
            className="w-full text-sm font-semibold h-9" 
            disabled={isOutOfStock}
            // NOTE: The actual cart function will be implemented with a useCart hook later.
            onClick={() => console.log(`Added ${product.name} to cart`)} 
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Notify Me' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}