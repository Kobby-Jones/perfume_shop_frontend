// app/admin/layout.tsx

'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Users, LayoutDashboard, ShoppingBag, BarChart, Menu, X, MessageSquare, Tag, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useAlert } from '@/components/shared/ModalAlert';
import { Loader2 } from 'lucide-react';

// Define roles allowed for each link
const adminNavLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, roles: ['admin', 'staff'] },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, roles: ['admin', 'staff'] },
  { href: '/admin/products', label: 'Products', icon: Package, roles: ['admin', 'staff'] },
  { href: '/admin/users', label: 'Customers', icon: Users, roles: ['admin'] }, // Admin Only
  { href: '/admin/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'staff'] },
  { href: '/admin/reports', label: 'Analytics', icon: BarChart, roles: ['admin'] }, // Admin Only
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare, roles: ['admin', 'staff'] },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag, roles: ['admin'] }, // Admin Only
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { alert } = useAlert();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 1. Allow both Admin and Staff
  const isAuthorized = user?.role === "admin" || user?.role === "staff";

  useEffect(() => {
    if (!isAuthLoading) {
        if (!isLoggedIn) {
            router.push('/account/auth/login');
            return;
        }
        
        // 2. Update Security Check
        if (isLoggedIn && !isAuthorized) {
            alert({ title: "Access Denied", message: "Management privileges required.", variant: 'error' });
            router.push('/account'); 
        }
    }
  }, [isLoggedIn, isAuthorized, isAuthLoading, router, alert]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/account/auth/login');
    alert({ title: "Signed Out", message: "Logged out of Management Dashboard.", variant: 'info' });
  };
  
  if (isAuthLoading || (isLoggedIn && !isAuthorized)) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  // 3. Filter Links based on Role
  const visibleLinks = adminNavLinks.filter(link => 
    link.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-serif font-bold tracking-widest text-primary">
          {user?.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
        </h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={cn(
        "w-64 bg-white border-r shadow-lg flex flex-col p-4",
        "fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <h1 className="hidden md:block text-2xl font-serif font-bold tracking-widest text-primary mb-6">
           {user?.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
        </h1>
        
        <div className="mb-6 px-3 py-2 bg-muted/50 rounded-lg">
            <p className="text-xs font-bold text-muted-foreground uppercase">Logged in as</p>
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-primary font-semibold capitalize">{user?.role}</p>
        </div>

        <nav className="flex flex-col space-y-1 flex-grow overflow-y-auto">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-colors duration-200 min-h-[48px]",
                  isActive ? "bg-primary text-white font-semibold shadow-md" : "hover:bg-secondary text-foreground/80"
                )}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <Separator className="my-4" />

        <Button onClick={handleLogout} variant="outline" className="w-full text-red-500 hover:bg-red-50/50">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}