// app/info/about/page.tsx

import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

/**
 * About Us Page: Tells the brand story for credibility and connection.
 */
export default function AboutUsPage() {
  return (
    <InfoPageLayout title="Our Scented Story">
      <p>
        Founded in 2023, **Scentia** was born from a passion for the art of perfumery and a commitment to sustainability. 
        We believe that luxury should not compromise the planet. Our fragrances are crafted by master perfumers 
        using ethically sourced, high-grade natural oils and materials.
      </p>
      <p>
        We specialize in complex, long-lasting **Eau de Parfums** and modern colognes. Each bottle is a testament 
        to our dedication to quality, designed to evoke emotion and elevate your daily ritual. Thank you for choosing to 
        experience the world through scent with us.
      </p>
    </InfoPageLayout>
  );
}