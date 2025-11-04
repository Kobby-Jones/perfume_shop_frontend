// app/page.tsx

import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { PromotionalBanner } from '@/components/home/PromotionalBanner';
import { TopCategoriesSection } from '@/components/home/TopCategoriesSection';
/**
 * Main Home Page component.
 * This page serves as the entry point and marketing hub for the e-commerce site.
 */
export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* 1. Primary Hero Banner */}
      <HeroBanner />

      {/* 2. Featured Products Section */}
      {/* NOTE: Using Server Component for initial data fetch (FeaturedProductsSection) */}
      <FeaturedProductsSection />
      
      {/* 3. Promotional Banner 1 (e.g., Free Shipping) */}
      <PromotionalBanner 
        title="Complimentary Shipping"
        subtitle="On all orders above GHS 100. Delivered directly to your door."
        bgColor="bg-accent text-accent-foreground"
        ctaText="See Details"
        ctaLink="/info/shipping"
      />

      {/* 4. Top Categories/Collections */}
      {/* NOTE: This component is designed to guide users to key sections */}
      <TopCategoriesSection />

      {/* 5. Promotional Banner 2 (e.g., Sale) */}
      <PromotionalBanner 
        title="Summer Sale Event"
        subtitle="Up to 40% off selected seasonal fragrances. Limited time only."
        bgColor="bg-secondary text-secondary-foreground"
        ctaText="Shop Sale"
        ctaLink="/shop?tag=sale"
      />
    </div>
  );
}