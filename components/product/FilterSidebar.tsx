// components/product/FilterSidebar.tsx

'use client';

import { useState, useMemo } from 'react';
import { Filter, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/httpClient'; // Import API client
// import { MOCK_PRODUCTS } from '@/lib/data/mock-products'; // <-- REMOVED MOCK IMPORT

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface FilterOptionsResponse {
    brands: string[];
    maxPrice: number;
}

// Function to fetch dynamic filter options from a new hypothetical API endpoint
// NOTE: We assume a new API endpoint /products/filters that returns this
const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
    // For now, we mock the API response structure until the backend is fully deployed
    // In a production backend, this endpoint would query unique brands and MAX(price).
    return {
        brands: ['AromaLux', 'The Scent Co.', 'Oud Masters', 'Citrus Bliss', 'Elite Fragrances', 'Urban Essence', 'Lumière Parfum', 'BlueWave', 'Scentory Labs', 'Flora Essence', 'Artisan Blends'],
        maxPrice: 200, // Safe maximum price based on mock data
    };
    // const data = await apiFetch('/products/filters');
    // return data as FilterOptionsResponse;
};


const priceRangeMin = 0; 

/**
 * Renders the interactive filter controls for the Product Listing Page.
 * @param props.onFilterChange - Callback function when filter values change.
 */
export function FilterSidebar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // Fetch dynamic filter options
  const { data: filterOptions, isLoading: isLoadingOptions } = useQuery<FilterOptionsResponse>({
      queryKey: ['filterOptions'],
      queryFn: fetchFilterOptions,
      staleTime: Infinity, // These options don't change often
  });

  const maxPrice = filterOptions?.maxPrice || 1000;
  const initialPriceRange: number[] = [priceRangeMin, maxPrice];
  const [priceRange, setPriceRange] = useState<number[]>(initialPriceRange);
  
  // Re-initialize price range if maxPrice changes (e.g., first load)
  useMemo(() => {
    setPriceRange(initialPriceRange);
  }, [maxPrice]);


  /**
   * Handles changes to the selected brand checkboxes.
   */
  const handleBrandChange = (brand: string, isChecked: boolean) => {
    const newBrands = isChecked
      ? [...selectedBrands, brand]
      : selectedBrands.filter((b) => b !== brand);
    
    setSelectedBrands(newBrands);
    onFilterChange({ brands: newBrands });
  };

  /**
   * Handles changes to the price range slider.
   */
  const handlePriceUpdate = (newRange: number[]) => {
    setPriceRange(newRange);
    onFilterChange({ price: newRange });
  };

  /**
   * Clears all active filters and resets state.
   */
  const handleClearFilters = () => {
    setSelectedBrands([]);
    setPriceRange(initialPriceRange);
    onFilterChange({ 
        brands: [], 
        price: initialPriceRange 
    });
    setIsSheetOpen(false);
  };

  // The actual filter content, reusable for both mobile Sheet and desktop sidebar
  const filterContent = isLoadingOptions ? (
      <div className="flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
  ) : (
    <div className="space-y-6 p-4">
      
      {/* Price Range Filter */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Price Range</h4>
        <Label className="block text-sm font-medium text-primary">
            GHS {priceRange[0].toFixed(0)} - GHS {priceRange[1].toFixed(0)}
        </Label>
        <Slider
          min={priceRangeMin}
          max={maxPrice}
          step={1}
          value={priceRange}
          onValueChange={handlePriceUpdate}
          className="w-full pt-2"
        />
      </div>

      <Separator className="bg-border" />

      {/* Brand Filter (Checkboxes) */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Brand</h4>
        {(filterOptions?.brands || []).map((brand) => (
          <div key={brand} className="flex items-center space-x-2">
            <Checkbox
              id={`brand-${brand}`}
              checked={selectedBrands.includes(brand)}
              onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
            />
            <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">
              {brand}
            </Label>
          </div>
        ))}
      </div>

      <Separator className="bg-border" />

      {/* Category Filter (Placeholder - assuming this is handled via URL params) */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Category (via URL)</h4>
        {['Women', 'Men', 'Unisex'].map((category) => (
          <div key={category} className="flex items-center space-x-2">
            {/* Keeping as disabled/placeholder as the main route handles this filter */}
            <Checkbox id={`cat-${category}`} disabled /> 
            <Label htmlFor={`cat-${category}`} className="text-sm font-normal text-foreground/60">
              {category}
            </Label>
          </div>
        ))}
      </div>

      {/* Clear Button */}
      <Button 
        variant="outline" 
        onClick={handleClearFilters}
        className="w-full mt-6"
        disabled={selectedBrands.length === 0 && priceRange[0] === priceRangeMin && priceRange[1] === maxPrice}
      >
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Sheet Trigger */}
      <div className="lg:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter & Sort</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-lg font-bold">Filter Products</SheetTitle>
            </SheetHeader>
            {/* The filter content itself */}
            {filterContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Sidebar (Hidden on Mobile) */}
      <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 border-r border-border">
        {filterContent}
      </aside>
    </>
  );
}