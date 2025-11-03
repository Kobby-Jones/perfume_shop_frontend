// app/error.tsx

'use client'; 

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Client-side Error Boundary Component.
 * Catches runtime errors in the component tree and displays a clean error state.
 * @param error - The error object that was caught.
 * @param reset - Function to attempt re-rendering the segment.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container text-center py-20 md:py-32 flex flex-col items-center bg-secondary">
      <AlertTriangle className="w-16 h-16 text-red-600 mb-6" />
      <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4">
        Application Error
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-red-600">
        Something went wrong.
      </h2>
      <p className="text-lg text-foreground/70 max-w-lg mb-8">
        We encountered an issue while processing your request. Our team has been notified.
        Please try refreshing the page.
      </p>
      
      <div className="flex space-x-4">
        <Button size="lg" onClick={() => reset()}>
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again
        </Button>
        <Link href="/">
          <Button size="lg" variant="outline">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}