// components/layout/AuthGuard.tsx

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * A client-side route guard for protecting authenticated pages.
 * Redirects unauthenticated users to the login page with a Sonner toast message.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial authentication check finishes
    if (!isLoading) {
      if (!isLoggedIn) {
        toast.error('You must be signed in to access this page.', {
          description: 'Redirecting you to the login page...',
        });
        router.push('/account/auth/login');
      }
    }
  }, [isLoggedIn, isLoading, router]);

  // While checking authentication, show a subtle loading UI
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground/70">Securing your session...</p>
      </div>
    );
  }

  // If logged in, render the protected children
  if (isLoggedIn) {
    return <>{children}</>;
  }

  // If not logged in, redirect will happen — render nothing
  return null;
}
