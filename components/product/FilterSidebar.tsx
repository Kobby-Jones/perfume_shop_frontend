// components/product/FilterSidebar.tsx

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const CATEGORIES = ['Men', 'Women', 'Unisex', 'Niche', 'Sets'];
const BRANDS = ['Chanel', 'Dior', 'Gucci', 'Tom Ford', 'Creed', 'Versace', 'YSL'];

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial state derived from URL
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  useEffect(() => {
    const min = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
    const max = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 5000;
    setPriceRange([min, max]);

    const cat = searchParams.get('category');
    setSelectedCategories(cat ? cat.split(',') : []);

    const brand = searchParams.get('brand');
    setSelectedBrands(brand ? brand.split(',') : []);
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','));
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 5000) params.set('maxPrice', priceRange[1].toString());
    
    // Preserve search query if it exists
    const currentSearch = searchParams.get('search');
    if (currentSearch) params.set('search', currentSearch);

    router.push(`/shop?${params.toString()}`);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Price Range (GHS)</h3>
        <Slider
          defaultValue={[0, 5000]}
          value={priceRange}
          max={5000}
          step={50}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm">
          <span>{priceRange[0]}</span>
          <span>{priceRange[1]}+</span>
        </div>
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={['categories', 'brands']} className="w-full">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`cat-${cat}`} 
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <Label htmlFor={`cat-${cat}`}>{cat}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {BRANDS.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <Label htmlFor={`brand-${brand}`}>{brand}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
      
      {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] > 0) && (
        <Button 
          variant="outline" 
          className="w-full mt-2"
          onClick={() => router.push('/shop')}
        >
          Clear All
        </Button>
      )}
    </div>
  );
}