'use client';

import { ReactNode, useEffect } from 'react'; // Import useEffect
import Link from 'next/link';
import { Package, Users, Settings, LogOut, LayoutDashboard, ShoppingBag, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useAlert } from '@/components/shared/ModalAlert';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Order Management', icon: ShoppingBag },
  { href: '/admin/products', label: 'Product Catalog', icon: Package },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/reports', label: 'Sales Reports', icon: BarChart },
];

/**
 * Admin Layout component with Authentication Guard.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { alert } = useAlert();
  
  // MOCK CHECK: We assume if the user is not 'admin@scentia.com' in the mock, they fail.
  const isAdminUser = user?.email === "admin@scentia.com";

  // --- Move redirection into useEffect ---
  useEffect(() => {
    // 1. If not logged in, redirect immediately.
    if (!isLoggedIn) {
        router.push('/account/auth/login');
        return;
    }
    
    // 2. If logged in but NOT admin, redirect.
    if (isLoggedIn && !isAdminUser) {
        alert({ title: "Access Denied", message: "Administrator privileges required.", variant: 'error' });
        router.push('/account/dashboard'); // Redirect to their regular dashboard
    }
  // Added user dependency to ensure check runs when user state updates after login
  }, [isLoggedIn, user?.email, router, alert]); 


  const handleLogout = () => {
    logout();
    router.push('/account/auth/login');
    alert({ title: "Signed Out", message: "You have securely logged out of the Admin Dashboard.", variant: 'info' });
  };
  
  /// Display a temporary loading screen or null while checking/redirecting
  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
}

// If the component reaches this point, the user is logged in.
  // We rely on the useEffect to do the final isAdminUser check.
  if (!isAdminUser) {
    // Show a loading/denied state while the useEffect executes the redirect.
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }
  // If the component reaches this point, the user is authenticated and is an admin.
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-lg flex flex-col p-4">
        <h1 className="text-2xl font-serif font-bold tracking-widest text-primary mb-6">
            Scentia Admin
        </h1>
        <nav className="flex flex-col space-y-1 flex-grow">
          {adminNavLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-colors duration-200",
                  isActive ? "bg-primary text-white font-semibold shadow-md" : "hover:bg-secondary text-foreground/80"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <Separator className="my-4" />

        <Button onClick={handleLogout} variant="outline" className="w-full text-red-500 hover:bg-red-50/50">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
// Import Loader2 for the temporary loading state
import { Loader2 } from 'lucide-react';
