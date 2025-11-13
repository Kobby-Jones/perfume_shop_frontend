// app/shop/page.tsx

'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { ListFilter, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { apiFetch } from '@/lib/api/httpClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

/**
 * Interface for the active filters state.
 */
interface Filters {
  brands: string[];
  price: number[];
  sort: string;
  search?: string;
  category?: string;
}

// Global interface for the API response
interface ProductListResponse {
    products: Product[];
    totalCount: number;
}

/**
 * API fetch function with dynamic query parameters
 */
const fetchProducts = async (filters: Filters): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    
    // Convert array filters to repeating parameters
    filters.brands.forEach(brand => params.append('brand', brand));
    
    // Price range
    params.append('minPrice', filters.price[0].toString());
    params.append('maxPrice', filters.price[1].toString());

    // Sort, Search, and Category
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);

    const data = await apiFetch(`/products?${params.toString()}`);
    return data as ProductListResponse;
};

/**
 * Renders a loading skeleton layout for the product grid.
 */
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="aspect-[3/4] flex flex-col p-4 space-y-2 border rounded-lg">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-full mt-2" />
        </div>
    ))}
  </div>
);

/**
 * Shop Content Component (uses useSearchParams)
 */
function ShopContent() {
    const searchParams = useSearchParams();
    
    const [filters, setFilters] = useState<Filters>({
      brands: [],
      price: [0, 1000], 
      sort: 'name-asc', 
      category: searchParams.get('category') || undefined,
    });
    
    // Update category filter when URL changes
    useEffect(() => {
        const urlCategory = searchParams.get('category');
        setFilters(prev => ({ 
            ...prev, 
            category: urlCategory || undefined 
        }));
    }, [searchParams]);

    // Fetch product data using TanStack Query (React Query)
    const { 
        data: productsData, 
        isLoading, 
        isError,
        refetch
    } = useQuery<ProductListResponse>({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
    });
    
    const products = productsData?.products || [];
    const totalResults = productsData?.totalCount || 0;

    /**
     * Updates the filter state and triggers a refetch.
     */
    const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
        setFilters(prev => {
            const updatedFilters = { ...prev, ...newFilters };
            return updatedFilters; 
        });
    }, []);

    /**
     * Updates the sorting selection.
     */
    const handleSortChange = useCallback((newSort: string) => {
        handleFilterChange({ sort: newSort });
    }, [handleFilterChange]);

  // --- Render Logic ---
  if (isError) {
    return <div className="container py-20 text-center text-red-600">Failed to load products. Please try again.</div>;
  }
  
  return (
    <div className="container flex flex-col lg:flex-row gap-6 md:gap-10">
      
      {/* 1. Desktop Filter Sidebar / Mobile Filter Trigger */}
      <FilterSidebar onFilterChange={handleFilterChange} />

      {/* 2. Product Content Area */}
      <div className="flex-1 min-w-0">
        
        {/* Top Control Bar (Sorting and Results Count) */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-foreground">
            Shop All Scents <span className="text-foreground/60">({totalResults} Results)</span>
          </h1>

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort-select" className="hidden sm:block text-sm font-medium">Sort by:</Label>
            <Select value={filters.sort} onValueChange={handleSortChange}>
              <SelectTrigger id="sort-select" className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <ProductGridSkeleton />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/50 rounded-lg">
            <ListFilter className="w-10 h-10 text-foreground/50 mx-auto mb-4" />
            <p className="text-xl font-semibold">No products match your current filters.</p>
            <p className="text-foreground/70">Try adjusting your price range or clearing some filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main Product Listing Page with Suspense boundary
 */
export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="container py-20">
                <ProductGridSkeleton />
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}