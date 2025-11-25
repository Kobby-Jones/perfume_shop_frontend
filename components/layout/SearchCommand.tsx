// components/layout/SearchCommand.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  // Close dialog on route change (navigation)
  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden bg-transparent border-none shadow-none">
        <VisuallyHidden>
          <DialogTitle>Search Products</DialogTitle>
        </VisuallyHidden>
        <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
          <form onSubmit={handleSearch} className="flex items-center border-b px-4 py-3">
            <Search className="mr-3 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for perfumes, brands, or notes..."
              className="flex-1 h-10 border-none focus-visible:ring-0 text-lg bg-transparent"
              autoFocus
            />
            {query && (
              <button 
                type="button" 
                onClick={() => setQuery('')}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button type="submit" size="sm" className="ml-4">Search</Button>
          </form>
          
          <div className="px-4 py-6 text-center text-sm text-muted-foreground bg-muted/30">
            <p>Press <strong>Enter</strong> to search</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}