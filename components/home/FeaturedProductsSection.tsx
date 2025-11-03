// components/home/FeaturedProductsSection.tsx

import { getProducts } from '@/lib/data/mock-products';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Server Component to fetch and display a selection of featured products.
 * Uses the mock API function.
 */
export async function FeaturedProductsSection() {
  // Fetch only products marked as featured, or the first 4 if not explicitly marked.
  const allProducts = await getProducts();
  const featuredProducts = allProducts.filter(p => p.isFeatured).slice(0, 4);
  
  // Use non-featured products if the mock data doesn't have 'isFeatured' set up.
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 4);

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