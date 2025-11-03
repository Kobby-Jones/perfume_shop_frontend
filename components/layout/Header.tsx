// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { Menu, Search, User, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/hooks/useCart'; // Import the hook
/**
 * Main navigation links for the application.
 */
const navLinks = [
  { name: 'Shop All', href: '/shop' },
  { name: 'Women', href: '/shop?category=Women' },
  { name: 'Men', href: '/shop?category=Men' },
  { name: 'About Us', href: '/info/about' },
];

/**
 * Renders the main application header with navigation, logo, and utility icons.
 * The design is mobile-first, using a Sheet component for the main menu on small screens.
 */
export function Header() {
    const { totalItems } = useCart(); // Get the total item count

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* --- Mobile Menu Trigger (Left) --- */}
        <div className="flex lg:hidden">
          {/* Sheet component for the mobile sidebar navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open mobile menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 pt-6">
                <p className="text-lg font-semibold text-primary">Perfume Shop</p>
                <Separator />
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block py-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* --- Logo (Center) --- */}
        <Link href="/" className="flex-shrink-0">
          {/* Using a custom class for branding color and font */}
          <h1 className="text-2xl font-serif font-bold tracking-widest text-primary">
            Scentia
          </h1>
        </Link>

        {/* --- Desktop Navigation (Hidden on Mobile) --- */}
        <nav className="hidden lg:flex lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary text-foreground/80"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* --- Utility Icons (Right) --- */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/account">
            <Button variant="ghost" size="icon" aria-label="User Account">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
              {/* Dynamic Cart Count Indicator */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {/* Display count, limiting to 9+ for small badge size */}
                  {totalItems > 9 ? '9+' : totalItems} 
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}