// components/product/ProductCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';

import { Product } from '@/lib/data/mock-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

/**
 * A compact, modern product card inspired by popular e-commerce platforms.
 * Optimized for grid layouts with consistent height and clean design.
 */
export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.availableStock <= 0;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GHS',
  }).format(product.price);

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <Link href={`/product/${product.id}`} className="block">
        {/* Compact Image Container - Square aspect ratio like Jumia */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-50' : 'opacity-100'
            }`}
            placeholder="empty"
          />
          
          {/* Wishlist Button - Floating on image */}
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Added to wishlist');
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white z-10"
            aria-label="Add to Wishlist"
          >
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-semibold uppercase tracking-wide bg-gray-900 px-3 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Compact Content Area */}
        <CardContent className="p-3">
          {/* Product Name - 2 lines max */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] mb-1.5 leading-tight">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-lg font-bold text-gray-900 mb-2">{formattedPrice}</p>

          {/* Add to Cart Button - Compact */}
          <Button
            className="w-full h-9 text-xs font-medium"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault();
              console.log(`Added ${product.name} to cart`);
            }}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            {isOutOfStock ? 'Notify Me' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}