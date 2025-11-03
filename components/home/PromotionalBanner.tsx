// components/home/PromotionalBanner.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // cn utility

/**
 * Props for the PromotionalBanner component.
 */
interface PromotionalBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string; // Tailwind class for background/text color
}

/**
 * Renders a full-width promotional banner, useful for highlighting sales or services.
 * @param props - Banner content and styling props.
 */
export function PromotionalBanner({ title, subtitle, ctaText, ctaLink, bgColor }: PromotionalBannerProps) {
  return (
    <div className={cn("py-8 md:py-10 text-center", bgColor)}>
      <div className="container px-4">
        <h3 className="text-xl md:text-2xl font-semibold mb-2">{title}</h3>
        <p className="mb-4 text-sm md:text-base opacity-90">{subtitle}</p>
        <Link href={ctaLink}>
            {/* Note: Button variant is hardcoded to outline for contrast, adjust color in parent component if needed */}
            <Button variant="outline" className="border-current hover:bg-current/10">
                {ctaText}
            </Button>
        </Link>
      </div>
    </div>
  );
}