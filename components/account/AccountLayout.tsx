// components/account/AccountLayout.tsx
'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingBag, MapPin, Heart, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// Navigation links for the user dashboard
const accountNavLinks = [
  { href: '/account', label: 'Dashboard', icon: User },
  { href: '/account/orders', label: 'Order History', icon: ShoppingBag },
  { href: '/account/addresses', label: 'Address Book', icon: MapPin },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/settings', label: 'Account Settings', icon: Settings },
];

/**
 * A reusable layout wrapper for all user account pages.
 * Features a responsive sidebar navigation for desktop and a clean content area.
 * @param children - The content of the specific account page (e.g., Order History).
 */
export function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">My Account</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Navigation Sidebar */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <nav className="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-2 p-4 border rounded-lg overflow-x-auto">
                {accountNavLinks.map((link) => {
                    const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/account' && (link.href === '/account/addresses' || pathname.startsWith(link.href)));
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center space-x-3 p-3 rounded-md transition-colors duration-200 whitespace-nowrap",
                                isActive ? "bg-primary text-primary-foreground font-semibold shadow-md" : "hover:bg-secondary text-foreground/80"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>

        {/* Right Column: Page Content */}
        <div className="flex-1 min-w-0 border p-6 rounded-lg shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}