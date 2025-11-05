// components/layout/SearchCommand.tsx

'use client';

import { Search } from 'lucide-react';
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

// Mock search result type (using minimal fields)
interface SearchResult {
    id: number;
    name: string;
    category: string;
}

/**
 * Global search component using the Command Dialog (Ctrl+K or Button click).
 * Provides a fast, premium search experience.
 */
export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  // Debounced API search call (best practice for search)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        try {
          // NOTE: Uses the listProducts API with a search query parameter (needs backend support)
          const data = await apiFetch(`/products?search=${searchTerm}&limit=10`);
          setResults(data.products.map((p: any) => ({ id: p.id, name: p.name, category: p.category })));
        } catch (error) {
          console.error("Search API failed:", error);
          setResults([]); // Clear results on error
        }
      } else {
        setResults([]);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((id: number) => {
    router.push(`/product/${id}`);
    setOpen(false);
    setSearchTerm(''); // Clear state on close
  }, [router]);


  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        aria-label="Search" 
        className="w-8 h-8 hidden sm:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Mobile search button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="sm:hidden flex items-center space-x-2 text-sm"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
      </Button>


      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
            placeholder="Search for a scent, brand, or category..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
        />
        <CommandList>
          {searchTerm.length > 2 && results.length > 0 && (
            <CommandGroup heading={`Products matching "${searchTerm}"`}>
              {results.map((result) => (
                <CommandItem key={result.id} onSelect={() => handleSelect(result.id)} className="cursor-pointer">
                  <span>{result.name}</span>
                  <span className="ml-auto text-sm text-foreground/60">{result.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {searchTerm.length > 2 && results.length === 0 && (
            <CommandEmpty>
                No fragrances found for "{searchTerm}".
            </CommandEmpty>
          )}

          {searchTerm.length <= 2 && (
             <CommandEmpty>
                <p>Start typing to search products. Try "Rose" or "AromaLux".</p>
                <p className="text-xs text-foreground/50 mt-2">Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd> or <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    Ctrl K
                </kbd> to open anytime.</p>
            </CommandEmpty>
          )}
          
          <CommandSeparator />
          
          {/* Static informational links for quick access */}
          <CommandGroup heading="Quick Access">
            <CommandItem onSelect={() => router.push('/shop')}>Shop All Products</CommandItem>
            <CommandItem onSelect={() => router.push('/info/faq')}>Help & FAQ</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}