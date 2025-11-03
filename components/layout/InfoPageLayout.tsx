// components/layout/InfoPageLayout.tsx

import { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

/**
 * Props for the InfoPageLayout component.
 * @property title - The main heading for the page.
 * @property children - The content of the informational page.
 */
interface InfoPageLayoutProps {
  title: string;
  children: ReactNode;
}

/**
 * Provides a clean, standardized layout for all informational pages 
 * (About Us, Contact, FAQ, Policies).
 */
export function InfoPageLayout({ title, children }: InfoPageLayoutProps) {
  return (
    <div className="container py-8 md:py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        {title}
      </h1>
      <Separator className="mb-8" />
      <article className="space-y-6 text-lg text-foreground/80 leading-relaxed">
        {children}
      </article>
    </div>
  );
}