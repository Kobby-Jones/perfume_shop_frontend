// components/home/FeaturedProductsSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/httpClient';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Client Component to fetch and display a selection of featured products.
 * Converted to client-side to avoid build-time timeouts on Netlify.
 */
export function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await apiFetch('/products?isFeatured=true&limit=4', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setProducts(response.products || []);
        setError(false);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setError(true);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-16 md:py-24 container">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
          Signature Selections
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Our most loved fragrances, curated for exceptional quality and longevity.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Unable to load featured products at this time.
          </p>
          <Link href="/shop">
            <Button variant="outline">Browse All Products</Button>
          </Link>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* View All CTA */}
          <div className="text-center mt-12">
            <Link href="/shop">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-primary border-primary hover:bg-primary/10 transition-colors"
              >
                View All Scents
              </Button>
            </Link>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No featured products available right now.
          </p>
          <Link href="/shop">
            <Button variant="outline">Browse All Products</Button>
          </Link>
        </div>
      )}
    </section>
  );
}