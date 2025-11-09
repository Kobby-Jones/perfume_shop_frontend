// components/product/StarRating.tsx

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: number;
  displayCount?: boolean;
  reviewCount?: number;
  className?: string;
}

/**
 * Renders star icons based on a rating value (1-5).
 * Supports full, half, and empty stars with proper visual styling.
 * @param rating - The score (e.g., 4.5).
 * @param size - Icon size in pixels (default: 18).
 * @param displayCount - If true, displays the numeric rating next to stars.
 * @param reviewCount - Number of reviews to display.
 * @param className - Additional CSS classes for the container.
 */
export function StarRating({ 
  rating, 
  size = 18, 
  displayCount = false, 
  reviewCount,
  className 
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const stars = [];

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={`full-${i}`} 
        size={size} 
        className="fill-amber-400 text-amber-400 transition-colors" 
      />
    );
  }

  // Half star
  if (halfStar) {
    stars.push(
      <div 
        key="half" 
        className="relative flex-shrink-0" 
        style={{ width: size, height: size }}
      >
        {/* Empty star base */}
        <Star 
          size={size} 
          className="text-gray-300 absolute top-0 left-0" 
        />
        {/* Full star overlay clipped to half */}
        <Star 
          size={size} 
          className="fill-amber-400 text-amber-400 absolute top-0 left-0 transition-colors" 
          style={{ clipPath: 'inset(0 50% 0 0)' }} 
        />
      </div>
    );
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star 
        key={`empty-${i}`} 
        size={size} 
        className="fill-gray-200 text-gray-300 transition-colors" 
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars}
      {displayCount && (
        <span className="ml-1 text-sm font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}