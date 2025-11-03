// components/home/HeroBanner.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Renders the main Hero section banner.
 * Designed to be impactful and mobile-responsive, prioritizing the call-to-action.
 */
export function HeroBanner() {
  return (
    <div className="relative h-[400px] md:h-[600px] w-full bg-secondary overflow-hidden">
      {/* Background/Image Placeholder */}
      <div className="absolute inset-0">
        {/* Placeholder for a high-quality background image or video */}
        <div className="w-full h-full bg-cover bg-center" style={{ 
            backgroundImage: "url('/images/hero-bg-2.png')", 
            // NOTE: Ensure you place a placeholder image in /public/images/hero-bg-mock.jpg
        }} aria-hidden="true"></div>
        {/* Semi-transparent dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content Layer (Mobile-first centering) */}
      <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center p-4">
        <p className="text-accent text-sm font-semibold uppercase tracking-[0.2em] mb-2">
            New Collection
        </p>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          The Scent of Luxury
        </h2>
        <p className="text-lg text-white/90 max-w-xl mb-8">
          Discover our exclusive range of handcrafted Eau de Parfums and Colognes. Timeless elegance redefined.
        </p>
        <Link href="/shop">
          {/* Large, primary CTA button */}
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-10 py-6 transition-all duration-300 shadow-xl">
            Shop The Collection
          </Button>
        </Link>
      </div>
    </div>
  );
}