// app/admin/layout.tsx

'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Users, Settings, LogOut, LayoutDashboard, ShoppingBag, BarChart, Menu, X, MessageSquare, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useAlert } from '@/components/shared/ModalAlert';
import { Loader2 } from 'lucide-react';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/reports', label: 'Analytics', icon: BarChart },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { alert } = useAlert();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isAdminUser = user?.email === "admin@scentia.com";

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/account/auth/login');
      return;
    }
    
    if (isLoggedIn && !isAdminUser) {
      alert({ title: "Access Denied", message: "Administrator privileges required.", variant: 'error' });
      router.push('/account/dashboard');
    }
  }, [isLoggedIn, user?.email, router, alert]);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/account/auth/login');
    alert({ title: "Signed Out", message: "You have securely logged out of the Admin Dashboard.", variant: 'info' });
  };
  
  if (!isLoggedIn || !isAdminUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-serif font-bold tracking-widest text-primary">
          Scentia Admin
        </h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white border-r shadow-lg flex flex-col p-4",
        "fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <h1 className="hidden md:block text-2xl font-serif font-bold tracking-widest text-primary mb-6">
          Scentia Admin
        </h1>
        
        <nav className="flex flex-col space-y-1 flex-grow overflow-y-auto">
          {adminNavLinks.map((link) => {
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

        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full text-red-500 hover:bg-red-50/50 min-h-[48px]"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}