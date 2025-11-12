// components/product/FilterSidebar.tsx

'use client';

import { useState, useMemo } from 'react';
import { Filter, X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api/httpClient'; // Import API client

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

const priceRangeMin = 0; 

/**
 * Function to fetch dynamic filter options from the live API endpoint.
 */
const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
    try {
        const data = await apiFetch('/products/filters');
        // Ensure maxPrice is at least 100 for a reasonable slider scale
        data.maxPrice = Math.max(100, Math.ceil(data.maxPrice / 100) * 100); 
        return data as FilterOptionsResponse;
    } catch (error) {
        console.error("Failed to fetch filter options:", error);
        // Return a safe default structure on error
        return { brands: [], maxPrice: 1000 };
    }
};


/**
 * Renders the interactive filter controls for the Product Listing Page.
 * @param props.onFilterChange - Callback function when filter values change.
 */
export function FilterSidebar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // Fetch dynamic filter options from the live backend
  const { data: filterOptions, isLoading: isLoadingOptions } = useQuery<FilterOptionsResponse>({
      queryKey: ['filterOptions'],
      queryFn: fetchFilterOptions,
      staleTime: Infinity, // These options don't change often
  });

  const maxPrice = filterOptions?.maxPrice || 1000;
  // Use a sensible default range based on the fetched maxPrice
  const initialPriceRange: number[] = useMemo(() => [priceRangeMin, maxPrice], [maxPrice]);
  const [priceRange, setPriceRange] = useState<number[]>(initialPriceRange);
  
  // Reset price range when dynamic maxPrice is initially fetched
  useMemo(() => {
      setPriceRange(initialPriceRange);
  }, [initialPriceRange]);


  /**
   * Handles changes to the selected brand checkboxes.
   */
  const handleBrandChange = (brand: string, isChecked: boolean) => {
    const newBrands = isChecked
      ? [...selectedBrands, brand]
      : selectedBrands.filter((b) => b !== brand);
    
    setSelectedBrands(newBrands);
    // Join brands with comma for the API query string
    onFilterChange({ brands: newBrands.join(',') });
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

  // Determine if filters are active to enable the clear button
  const areFiltersActive = useMemo(() => {
      return (
          selectedBrands.length > 0 ||
          priceRange[0] !== priceRangeMin ||
          priceRange[1] !== maxPrice
      );
  }, [selectedBrands, priceRange, maxPrice]);


  // The actual filter content, reusable for both mobile Sheet and desktop sidebar
  const filterContent = isLoadingOptions ? (
      <div className="flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground ml-2">Loading filters...</p>
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
        disabled={!areFiltersActive}
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