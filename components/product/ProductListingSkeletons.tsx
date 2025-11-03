// components/product/ProductListingSkeletons.tsx

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Renders a loading skeleton layout for the product grid.
 * This provides a smooth, professional loading experience for users.
 * Matches the structure of the ProductCard (aspect-[3/4]).
 * @param count - The number of skeletons to display (defaults to 8).
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {[...Array(count)].map((_, i) => (
        // The skeleton uses the same aspect ratio as the ProductCard image (4/5 aspect ratio used in PDP)
        // Adjusting this to match the ProductCard height which is more complex, but using the 3/4 aspect ratio 
        // for the entire card gives a good visual placeholder.
        <div key={i} className="aspect-[3/4] flex flex-col p-4 space-y-2 border rounded-lg">
          {/* Image Placeholder */}
          <Skeleton className="aspect-[3/4] w-full" />
          {/* Title Placeholder */}
          <Skeleton className="h-6 w-3/4" />
          {/* Price Placeholder */}
          <Skeleton className="h-4 w-1/2" />
          {/* Button Placeholder */}
          <Skeleton className="h-9 w-full mt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Renders a placeholder for the Product Detail Page while loading.
 * Provides a basic two-column layout mimic.
 */
export function ProductDetailSkeleton() {
    return (
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 py-12">
            {/* Image Gallery Skeleton (Left Column) */}
            <div className="lg:sticky lg:top-24 h-full">
                <Skeleton className="aspect-[4/5] w-full rounded-lg" />
            </div>

            {/* Details Skeleton (Right Column) */}
            <div className="space-y-6">
                <Skeleton className="h-4 w-20" /> {/* Brand */}
                <Skeleton className="h-10 w-full" /> {/* Main Title */}
                <Skeleton className="h-8 w-1/3" /> {/* Price */}
                <Skeleton className="h-1 w-full" /> {/* Separator */}
                <Skeleton className="h-10 w-full" /> {/* Description lines */}
                <Skeleton className="h-10 w-5/6" /> 
                
                {/* CTA Buttons Skeleton */}
                <div className="flex space-x-4 pt-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-12" />
                </div>

                <Skeleton className="h-1 w-full" /> {/* Separator */}

                {/* Accordion Placeholders */}
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    );
}