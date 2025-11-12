// components/home/FeaturedProductsSection.tsx

import { apiFetch } from '@/lib/api/httpClient';
import { Product } from '@/lib/types'; // <-- CORRECTED: Use central type
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Server Component to fetch and display a selection of featured products.
 */
export async function FeaturedProductsSection() {
  
  // Fetch products directly from the API endpoint.
  // We request the API to handle the filtering for featured items.
  const response = await apiFetch('/products?isFeatured=true&limit=4').catch(() => ({ products: [] }));
  const displayProducts: Product[] = response.products || [];

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

      {/* Responsive Grid for Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {displayProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* View All CTA */}
      <div className="text-center mt-12">
        <Link href="/shop">
            <Button variant="outline" size="lg" className="text-primary border-primary hover:bg-primary/10 transition-colors">
                View All Scents
            </Button>
        </Link>
      </div>
    </section>
  );
}