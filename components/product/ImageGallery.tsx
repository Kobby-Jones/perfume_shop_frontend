// components/product/ImageGallery.tsx

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the ImageGallery component.
 * @property images - Array of image URLs for the product.
 * @property name - Product name for alt text.
 */
interface ImageGalleryProps {
  images: string[];
  name: string;
}

/**
 * Renders a responsive product image gallery with a main display and clickable thumbnails.
 * Mobile: Horizontal scrolling thumbnails.
 * Desktop: Vertical list of thumbnails.
 */
export function ImageGallery({ images, name }: ImageGalleryProps) {
  if (images.length === 0) {
    return <div className="aspect-[4/5] bg-secondary flex items-center justify-center text-foreground/50">No Image Available</div>;
  }

  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] md:gap-4">
      
      {/* 1. Thumbnail Selector (Vertical on Desktop, Hidden on Mobile) */}
      <div className="hidden md:flex md:flex-col space-y-3">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className={cn(
              "relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
              mainImage === imgUrl ? "border-primary shadow-lg" : "border-border hover:border-foreground/20"
            )}
            onClick={() => setMainImage(imgUrl)}
            role="button"
            tabIndex={0}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={imgUrl}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              sizes="100px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* 2. Main Image Display */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-xl mb-4 md:mb-0">
        <Image
          src={mainImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          priority // Load the main product image quickly
          className="object-cover"
        />
      </div>

      {/* 3. Mobile Thumbnail Selector (Horizontal on Mobile, Hidden on Desktop) */}
      <div className="md:hidden overflow-x-auto whitespace-nowrap py-2">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className={cn(
              "relative inline-block w-20 h-20 aspect-square mr-3 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
              mainImage === imgUrl ? "border-primary shadow-md" : "border-border hover:border-foreground/20"
            )}
            onClick={() => setMainImage(imgUrl)}
          >
            <Image
              src={imgUrl}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}