// app/not-found.tsx

import Link from 'next/link';
import { Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Custom 404 Not Found Page.
 * This is a highly accessible and professional error page, guiding the user back to the main site.
 */
export default function NotFound() {
  return (
    <div className="container text-center py-20 md:py-32 flex flex-col items-center">
      <Frown className="w-16 h-16 text-primary/80 mb-6" />
      <h1 className="text-6xl md:text-8xl font-extrabold text-foreground mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-4">
        Page Not Found
      </h2>
      <p className="text-lg text-foreground/70 max-w-lg mb-8">
        The fragrance you are looking for seems to have evaporated. Please check the URL or return to the homepage.
      </p>
      
      <Link href="/">
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          Return to Homepage
        </Button>
      </Link>
      <Link href="/shop" className="mt-4">
        <Button variant="link">
          Browse All Products
        </Button>
      </Link>
    </div>
  );
}