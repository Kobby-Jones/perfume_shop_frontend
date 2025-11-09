// components/layout/SearchCommand.tsx

'use client';

import { Search, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/httpClient';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

interface SearchResult {
    id: number;
    name: string;
    category: string;
    brand?: string;
    price?: number;
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Debounced API search call
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setIsLoading(true);
        try {
          const data = await apiFetch(`/products?search=${searchTerm}&limit=10`);
          
          // Handle different response structures
          if (data && data.products && Array.isArray(data.products)) {
            setResults(data.products.map((p: any) => ({ 
              id: p.id, 
              name: p.name, 
              category: p.category,
              brand: p.brand,
              price: p.price
            })));
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error("Search API failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((id: number) => {
    router.push(`/product/${id}`);
    setOpen(false);
    setSearchTerm('');
    setResults([]);
  }, [router]);

  const handleQuickLink = useCallback((path: string) => {
    router.push(path);
    setOpen(false);
    setSearchTerm('');
  }, [router]);

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', { 
      style: 'currency', 
      currency: 'GHS' 
    }).format(price * 14); // Your conversion rate
  };

  return (
    <>
      {/* Desktop Search Icon */}
      <Button 
        variant="ghost" 
        size="icon" 
        aria-label="Search products" 
        className="hidden sm:flex hover:bg-gray-100"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Mobile Search Button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="sm:hidden flex items-center gap-2 text-sm hover:bg-gray-100"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-xs">Search</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search fragrances, brands, or categories..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchTerm.length > 2 && results.length > 0 && (
            <CommandGroup heading={`Found ${results.length} product${results.length > 1 ? 's' : ''}`}>
              {results.map((result) => (
                <CommandItem 
                  key={result.id} 
                  onSelect={() => handleSelect(result.id)} 
                  className="cursor-pointer"
                >
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.name}</span>
                      {result.price && (
                        <span className="text-sm text-primary font-semibold">
                          {formatPrice(result.price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {result.brand && <span>{result.brand}</span>}
                      {result.brand && result.category && <span>•</span>}
                      {result.category && <span>{result.category}</span>}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* No Results */}
          {!isLoading && searchTerm.length > 2 && results.length === 0 && (
            <CommandEmpty>
              <div className="py-6 text-center">
                <p className="text-sm font-medium">No fragrances found for "{searchTerm}"</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Try searching with different keywords
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* Initial State / Instructions */}
          {!isLoading && searchTerm.length <= 2 && (
            <CommandEmpty>
              <div className="py-6 text-center space-y-3">
                <p className="text-sm">Start typing to search products</p>
                <p className="text-xs text-muted-foreground">
                  Try "Rose", "Woody", or your favorite brand
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                  <span className="text-xs text-muted-foreground">or</span>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    Ctrl K
                  </kbd>
                  <span className="text-xs text-muted-foreground">to open anytime</span>
                </div>
              </div>
            </CommandEmpty>
          )}
          
          <CommandSeparator />
          
          {/* Quick Access Links */}
          <CommandGroup heading="Quick Access">
            <CommandItem 
              onSelect={() => handleQuickLink('/shop')}
              className="cursor-pointer"
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Browse All Products</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleQuickLink('/shop?category=Women')}
              className="cursor-pointer"
            >
              <span>Women's Fragrances</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleQuickLink('/shop?category=Men')}
              className="cursor-pointer"
            >
              <span>Men's Fragrances</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleQuickLink('/info/faq')}
              className="cursor-pointer"
            >
              <span>Help & FAQ</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}