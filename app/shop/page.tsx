// app/shop/page.tsx

import { Metadata } from 'next';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Shop All Fragrances | Scentia',
  description:
    'Explore our extensive collection of luxury perfumes for men and women.',
};

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getProducts(searchParams: any) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://scentia-api.onrender.com/api';

  const params = new URLSearchParams();
  if (searchParams.category) params.append('category', searchParams.category);
  if (searchParams.brand) params.append('brand', searchParams.brand);
  if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
  if (searchParams.search) params.append('search', searchParams.search);
  if (searchParams.sort) params.append('sort', searchParams.sort);

  const page = searchParams.page || '1';
  params.append('page', page);
  params.append('limit', '12');

  try {
    const res = await fetch(`${baseUrl}/products?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error(error);
    return { products: [], totalCount: 0 };
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;

  const data = await getProducts(resolvedSearchParams);

  const isLoading = !data;

  if (isLoading) {
    return (
      <div className="container py-8">
        <Breadcrumb 
          items={[
            { label: 'Shop' }
          ]} 
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          <aside className="w-full lg:w-64">
            <Skeleton className="h-96 w-full rounded-lg" />
          </aside>

          <div className="flex-1">
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    );
  }

  const { products, totalCount } = data;
  const hasProducts = products && products.length > 0;

  return (
    <div className="container py-8">
      <Breadcrumb 
        items={[
          { label: 'Shop' }
        ]} 
      />

      <div className="flex items-baseline justify-between border-b pb-6 mb-8 mt-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {resolvedSearchParams.search
            ? `Search: "${resolvedSearchParams.search}"`
            : 'All Fragrances'}
        </h1>
        <span className="text-muted-foreground">{totalCount} products found</span>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar />
        </div>

        <div className="flex-1">
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
        </div>
      </div>
    </div>
  );
}
