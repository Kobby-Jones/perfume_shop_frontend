// app/shop/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { ListFilter, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { getProducts, Product } from '@/lib/data/mock-products';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/product/FilterSidebar';
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
}

/**
 * Renders a loading skeleton layout for the product grid.
 */
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
    {[...Array(8)].map((_, i) => (
      // Aspect ratio matches the ProductCard
      <Skeleton key={i} className="aspect-[3/4] w-full" />
    ))}
  </div>
);

/**
 * Main Product Listing Page component.
 * Features: Filters (Price, Brand), Sorting, Responsive Grid, and Loading State.
 */
export default function ShopPage() {
  const [filters, setFilters] = useState<Filters>({
    brands: [],
    price: [0, 1000], // Default wide range
    sort: 'name-asc', // Default sort
  });

  // Fetch product data using TanStack Query (React Query)
  const { data: products = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  /**
   * Memoized function to apply filtering and sorting logic locally (simulating server-side filter).
   */
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // 1. Price Filter
      const [minPrice, maxPrice] = filters.price;
      const isPriceMatch = product.price >= minPrice && product.price <= maxPrice;

      // 2. Brand Filter
      const isBrandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand);

      return isPriceMatch && isBrandMatch;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters]);

  /**
   * Updates the global filter state.
   */
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Updates the sorting selection.
   */
  const handleSortChange = (newSort: string) => {
    setFilters(prev => ({ ...prev, sort: newSort }));
  };

  // --- Render Logic ---
  if (isError) {
    return <div className="container py-20 text-center text-red-600">Failed to load products. Please try again.</div>;
  }
  
  const totalResults = filteredAndSortedProducts.length;

  return (
    <div className="container flex flex-col lg:flex-row gap-6 md:gap-10">
      
      {/* 1. Desktop Filter Sidebar / Mobile Filter Trigger */}
      <FilterSidebar onFilterChange={(f) => handleFilterChange(f)} />

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
        ) : totalResults > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredAndSortedProducts.map(product => (
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