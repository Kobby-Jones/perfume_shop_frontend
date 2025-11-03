// components/product/FilterSidebar.tsx

'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

import { MOCK_PRODUCTS } from '@/lib/data/mock-products';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

/**
 * Utility function to extract unique brands and max price from mock data.
 */
const getFilterOptions = () => {
    const brands = Array.from(new Set(MOCK_PRODUCTS.map(p => p.brand)));
    const maxPrice = Math.max(...MOCK_PRODUCTS.map(p => p.price));
    return { brands, maxPrice: Math.ceil(maxPrice / 10) * 10 }; // Round up to nearest 10
};

// Global filter options
const { brands, maxPrice } = getFilterOptions();
const priceRangeMin = 20; // Minimum price filterable

/**
 * Renders the interactive filter controls for the Product Listing Page.
 * Uses a mobile-first approach (Sheet for small screens, persistent sidebar for desktop).
 * @param props.onFilterChange - Callback function when filter values change.
 */
export function FilterSidebar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([priceRangeMin, maxPrice]);

  /**
   * Handles changes to the selected brand checkboxes.
   * @param brand - The brand name that was toggled.
   * @param isChecked - The new checked state.
   */
  const handleBrandChange = (brand: string, isChecked: boolean) => {
    const newBrands = isChecked
      ? [...selectedBrands, brand]
      : selectedBrands.filter((b) => b !== brand);
    
    setSelectedBrands(newBrands);
    onFilterChange({ brands: newBrands, price: priceRange });
  };

  /**
   * Handles changes to the price range slider.
   * @param newRange - The new array containing [min, max] price values.
   */
  const handlePriceChange = (newRange: number[]) => {
    setPriceRange(newRange);
    // Debounce or apply filter immediately depending on UX preference. Applying immediately for simplicity.
    onFilterChange({ brands: selectedBrands, price: newRange });
  };

  /**
   * Clears all active filters and resets state.
   */
  const handleClearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([priceRangeMin, maxPrice]);
    onFilterChange({ brands: [], price: [priceRangeMin, maxPrice] });
    setIsSheetOpen(false);
  };

  // The actual filter content, reusable for both mobile Sheet and desktop sidebar
  const filterContent = (
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
          onValueChange={handlePriceChange}
          className="w-full pt-2"
        />
      </div>

      <Separator className="bg-border" />

      {/* Brand Filter (Checkboxes) */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Brand</h4>
        {brands.map((brand) => (
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

      {/* Category Filter (Placeholder) */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Category</h4>
        {['Women', 'Men', 'Unisex'].map((category) => (
          <div key={category} className="flex items-center space-x-2">
            {/* Using a disabled checkbox for demonstration */}
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