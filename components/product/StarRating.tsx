// components/product/StarRating.tsx

import { Star } from 'lucide-react';

/**
 * Renders star icons based on a rating value (1-5).
 * @param rating - The score (e.g., 4.5).
 * @param size - Icon size.
 * @param displayCount - If true, displays the numeric rating next to stars.
 */
export function StarRating({ rating, size = 18, displayCount = false, reviewCount }: { rating: number, size?: number, displayCount?: boolean, reviewCount?: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const stars = [];

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} size={size} className="fill-accent text-accent" />);
  }
  // Half star
  if (halfStar) {
    stars.push(
      <div key="half" className="relative w-[18px] h-[18px]" style={{ width: size, height: size }}>
        {/* Empty star base */}
        <Star size={size} className="text-gray-300" />
        {/* Full star overlay clipped to half (requires complex CSS or SVG mask - simplified here) */}
        <Star size={size} className="absolute top-0 left-0 fill-accent text-accent overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
      </div>
    );
  }
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} size={size} className="text-gray-300" />);
  }

  return (
    <div className="flex items-center space-x-1">
      {stars}
      {displayCount && (
        <span className="ml-2 text-sm font-semibold text-foreground">
            {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && reviewCount > 0 && (
          <span className="text-sm text-foreground/70">
            ({reviewCount} Reviews)
          </span>
      )}
    </div>
  );
}