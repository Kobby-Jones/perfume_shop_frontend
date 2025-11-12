// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { Menu, Search, User, ShoppingCart, LogOut, Heart, Package, ChevronDown, Sparkles, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth'; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; 
import { SearchCommand } from './SearchCommand';

// Define types for navigation links
interface NavLink {
  name: string;
  href: string;
  featured?: boolean;
  subcategories?: string[];
  badge?: string;
}

const navLinks: NavLink[] = [
  { 
    name: 'Women', 
    href: '/shop?category=Women',
    featured: true,
    subcategories: ['Floral', 'Fruity', 'Oriental', 'Fresh', 'Gourmand']
  },
  { 
    name: 'Men', 
    href: '/shop?category=Men',
    featured: true,
    subcategories: ['Woody', 'Spicy', 'Fresh', 'Aromatic', 'Leather']
  },
  { 
    name: 'Unisex', 
    href: '/shop?category=Unisex',
    subcategories: ['Citrus', 'Aquatic', 'Amber', 'Musk']
  },
  { name: 'New Arrivals', href: '/shop?sort=newest', badge: 'New' },
  { name: 'Best Sellers', href: '/shop?sort=popular', badge: 'Hot' },
];

export function Header() {
    const { totalItems } = useCart();
    const { isLoggedIn, user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/account/auth/login');
    };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top Bar - Announcements/Promos */}
      <div className="bg-gradient-to-r from-primary/90 to-primary text-white">
        <div className="container flex h-9 items-center justify-center px-4 text-xs sm:text-sm">
          <Sparkles className="w-3 h-3 mr-2 hidden sm:inline" />
          <span className="font-medium">Free Shipping on Orders Over GHS 500 | Shop Now!</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu + Logo */}
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu" className="hover:bg-gray-100">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                <div className="flex flex-col space-y-6 pt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center">
                    <h2 className="text-2xl font-serif font-bold tracking-widest text-primary">
                      Scentia
                    </h2>
                  </div>
                  
                  <Separator />

                  {/* Admin Dashboard Link - Mobile */}
                  {isLoggedIn && user?.role === 'admin' && (
                    <>
                      <Link 
                        href="/admin" 
                        className="flex items-center px-4 py-3 rounded-lg text-base font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <LayoutDashboard className="mr-2 h-5 w-5" />
                        Admin Dashboard
                      </Link>
                      <Separator />
                    </>
                  )}

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-1">
                    <Link href="/shop" className="px-4 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors">
                      Shop All Fragrances
                    </Link>
                    
                    <Separator className="my-2" />
                    
                    {navLinks.map((link) => (
                      <div key={link.name}>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-100 transition-colors"
                        >
                          <span>{link.name}</span>
                          {link.badge && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {link.badge}
                            </Badge>
                          )}
                        </Link>
                        {link.subcategories && (
                          <div className="ml-6 mt-1 space-y-1">
                            {link.subcategories.map((sub) => (
                              <Link
                                key={sub}
                                href={`${link.href}&subcategory=${sub}`}
                                className="block px-4 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>

                  <Separator />

                  {/* Mobile Quick Links */}
                  <div className="space-y-2">
                    <Link href="/info/about" className="block px-4 py-2 text-sm text-gray-600 hover:text-primary">
                      About Us
                    </Link>
                    <Link href="/info/contact" className="block px-4 py-2 text-sm text-gray-600 hover:text-primary">
                      Contact
                    </Link>
                    <Link href="/info/faq" className="block px-4 py-2 text-sm text-gray-600 hover:text-primary">
                      FAQ
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-widest text-primary hover:text-primary/80 transition-colors">
                Scentia
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.subcategories ? (
                  // Dropdown for categories with subcategories
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="text-sm font-medium hover:text-primary hover:bg-gray-50 px-3 py-2"
                      >
                        {link.name}
                        {link.featured && (
                          <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                        )}
                        {link.badge && (
                          <Badge variant="destructive" className="ml-2 text-xs py-0 px-1.5">
                            {link.badge}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Shop {link.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={link.href}>
                        <DropdownMenuItem>All {link.name}</DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      {link.subcategories.map((sub) => (
                        <Link key={sub} href={`${link.href}&subcategory=${sub}`}>
                          <DropdownMenuItem>{sub}</DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  // Regular link
                  <Link href={link.href}>
                    <Button 
                      variant="ghost" 
                      className="text-sm font-medium hover:text-primary hover:bg-gray-50 px-3 py-2"
                    >
                      {link.name}
                      {link.badge && (
                        <Badge variant="destructive" className="ml-2 text-xs py-0 px-1.5">
                          {link.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Utility Icons - Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <SearchCommand />

            {/* Wishlist - Hidden on small mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Wishlist"
              className="hidden sm:flex hover:bg-gray-100"
            >
              <Heart className="h-5 w-5" />
            </Button>

            {/* Admin Dashboard - Desktop (only for admins) */}
            {isLoggedIn && user?.role === 'admin' && (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Admin Dashboard"
                  className="hidden lg:flex hover:bg-gray-100 relative"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-primary"></span>
                </Button>
              </Link>
            )}

            {/* User Account */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account" className="hover:bg-gray-100">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-semibold">Welcome back!</p>
                      <p className="text-xs text-gray-500 font-normal">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <Badge variant="default" className="mt-1 text-xs">Admin</Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Admin Dashboard in dropdown for mobile/tablet */}
                  {user?.role === 'admin' && (
                    <>
                      <Link href="/admin">
                        <DropdownMenuItem className="lg:hidden">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator className="lg:hidden" />
                    </>
                  )}
                  
                  <Link href="/account">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/account/orders">
                    <DropdownMenuItem>
                      <Package className="mr-2 h-4 w-4" />
                      Order History
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/account/wishlist">
                    <DropdownMenuItem>
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-500 cursor-pointer focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/account/auth/login">
                <Button variant="ghost" size="icon" aria-label="Sign In" className="hover:bg-gray-100">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Shopping Cart */}
            <Link href="/cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-gray-100" 
                aria-label={`Shopping cart with ${totalItems} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-md">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar - Desktop Only */}
      <div className="hidden lg:block border-b border-gray-100 bg-gray-50/50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex h-10 items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-6">
              <Link href="/shop?sort=newest" className="hover:text-primary transition-colors font-medium">
                New Arrivals
              </Link>
              <Link href="/shop?discount=true" className="hover:text-primary transition-colors font-medium">
                Sale
              </Link>
              <Link href="/shop?featured=true" className="hover:text-primary transition-colors font-medium">
                Featured
              </Link>
              <Link href="/shop?category=Women" className="hover:text-primary transition-colors font-medium">
                Women's Collection
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/info/about" className="hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/info/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/info/faq" className="hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}