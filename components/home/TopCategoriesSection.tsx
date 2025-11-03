// components/home/TopCategoriesSection.tsx

import Link from 'next/link';

/**
 * Mock data for the primary categories/collections displayed on the home page.
 */
const categories = [
    { name: 'Women’s EDP', href: '/shop?category=Women', image: '/images/cat-women-mock.jpg' },
    { name: 'Men’s Cologne', href: '/shop?category=Men', image: '/images/cat-men-mock.jpg' },
    { name: 'Unisex Blends', href: '/shop?category=Unisex', image: '/images/cat-unisex-mock.jpg' },
];

/**
 * Renders a section showcasing the top product categories or collections.
 * Uses a simple, elegant grid structure with imagery.
 */
export function TopCategoriesSection() {
  return (
    <section className="py-16 md:py-24 container">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Explore Our Collections
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Find the perfect fragrance for any moment or occasion.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.name} 
            href={category.href} 
            className="group block relative aspect-[4/3] overflow-hidden rounded-lg shadow-xl"
          >
            {/* Image Placeholder */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${category.image})` }}
            />
            {/* Overlay for contrast and hover effect */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
            
            {/* Text Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-2xl font-bold tracking-wider uppercase border-b-2 border-accent pb-1">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}