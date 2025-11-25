// app/product/[id]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/product/ProductDetails';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Server-side data fetching
async function getProduct(id: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://scentia-api.onrender.com/api';
    const res = await fetch(`${baseUrl}/products/${id}`, { 
      cache: 'no-store' // Fetch fresh data every time for stock accuracy
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

async function getRelatedProducts(category: string, currentId: number): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://scentia-api.onrender.com/api';
    // Fetch products filtered by category
    const res = await fetch(`${baseUrl}/products?category=${category}&limit=5`, { 
      next: { revalidate: 3600 } // Cache similar products for 1 hour
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    
    // Filter out current product and limit to 4
    return (data.products || [])
      .filter((p: Product) => p.id !== currentId)
      .slice(0, 4);
  } catch (error) {
    return [];
  }
}

// Generate Dynamic Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; // Await params before accessing properties
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | Scentia',
    };
  }

  return {
    title: `${product.name} | Scentia Perfumes`,
    description: product.description.substring(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Await params before accessing properties
  
  // 1. Fetch Product
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <p className="text-lg text-foreground/70 mt-2">The fragrance you are looking for does not exist.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  // 2. Fetch Related Products
  const relatedProducts = await getRelatedProducts(product.category, product.id);

  // 3. Render Client Component
  return <ProductDetails product={product} relatedProducts={relatedProducts} />;
}