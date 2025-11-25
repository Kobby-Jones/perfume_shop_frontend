// app/shop/page.tsx

import { Metadata } from 'next';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { Product } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Shop All Fragrances | Scentia',
  description: 'Explore our extensive collection of luxury perfumes for men and women.',
};

// Type for SearchParams
interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Server Fetch Function
async function getProducts(searchParams: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://scentia-api.onrender.com/api';
  
  // Construct Query String
  const params = new URLSearchParams();
  if (searchParams.category) params.append('category', searchParams.category);
  if (searchParams.brand) params.append('brand', searchParams.brand);
  if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
  if (searchParams.search) params.append('search', searchParams.search);
  if (searchParams.sort) params.append('sort', searchParams.sort);
  
  // Pagination defaults
  const page = searchParams.page || '1';
  params.append('page', page);
  params.append('limit', '12');

  try {
    const res = await fetch(`${baseUrl}/products?${params.toString()}`, { 
      cache: 'no-store' // Dynamic fetching
    });
    
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error(error);
    return { products: [], totalCount: 0 };
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Await searchParams before accessing properties
  const resolvedSearchParams = await searchParams;
  
  // 1. Fetch Data on Server
  const { products, totalCount } = await getProducts(resolvedSearchParams);
  const hasProducts = products && products.length > 0;

  return (
    <div className="container py-8">
      <div className="flex items-baseline justify-between border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {resolvedSearchParams.search ? `Search: "${resolvedSearchParams.search}"` : 'All Fragrances'}
        </h1>
        <span className="text-muted-foreground">{totalCount} products found</span>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar />
        </div>

        <div className="flex-1">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Product Grid */}
          {hasProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-xl">
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
          
          {/* Simple Pagination (Optional - Add more robust logic if needed) */}
          {/* This is a placeholder. Robust pagination requires client-side logic or simple Link components */}
        </div>
      </div>
    </div>
  );
}