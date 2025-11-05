// app/product/[id]/page.tsx

'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Truck, RefreshCw } from 'lucide-react';

import { getProducts, Product, MOCK_PRODUCTS } from '@/lib/data/mock-products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ImageGallery } from '@/components/product/ImageGallery';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/product/ProductListingSkeletons';

// New imports for Tabs & Reviews
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewSection } from '@/components/product/ReviewSection';

// Simple mock function to get a single product by ID
async function getProductById(id: number): Promise<Product | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_PRODUCTS.find(p => p.id === id);
}

/**
 * Product Detail Page component.
 * Displays all product information, image gallery, stock status, and add-to-cart controls.
 */
export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);

  // Fetch the specific product data
  const { data: product, isLoading } = useQuery<Product | undefined>({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !isNaN(productId),
  });

  // Fetch related products (using all products minus the current one)
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const relatedProducts = useMemo(() => {
    return allProducts.filter(p => p.id !== productId).slice(0, 4);
  }, [allProducts, productId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(price);

  const isOutOfStock = product && product.availableStock <= 0;

  if (isLoading || !product) {
    if (isLoading) return <div className="container py-12"><ProductGridSkeleton /></div>;
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

  return (
    <div className="container py-6 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:sticky lg:top-24 h-full">
          <ImageGallery images={product.images} name={product.name} />
        </div>

        {/* Right Column: Details and CTA */}
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase text-accent">{product.brand}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">{product.name}</h1>
          <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>

          <Separator />

          {/* Stock and Status */}
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
              {isOutOfStock ? 'OUT OF STOCK' : `IN STOCK (${product.availableStock} available)`}
            </span>
            <span className="text-sm text-foreground/70">• {product.category} Collection</span>
          </div>

          {/* Short Description */}
          <p className="text-foreground/80 leading-relaxed max-w-lg">{product.description}</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Button 
              size="lg" 
              className="flex-1 text-lg font-bold h-12" 
              disabled={isOutOfStock}
              onClick={() => console.log(`Adding ${product.name} to cart`)}
            >
              <ShoppingCart className="mr-3 h-5 w-5" />
              {isOutOfStock ? 'Notify Me When Restocked' : 'Add to Cart'}
            </Button>
            <Button variant="outline" size="lg" className="sm:w-auto h-12">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          {/* --- Product Details Tabs (New Section) --- */}
          <div className="mt-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
                <TabsTrigger value="description">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Description Tab */}
              <TabsContent value="description" className="mt-6 p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Scent Profile & Composition</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">{product.description}</p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>Size: 100ml Eau de Parfum</li>
                  <li>Scent Profile: Oriental, Floral, Woody</li>
                  <li>Concentration: High (EDP)</li>
                  <li>Longevity: 8-10 Hours</li>
                </ul>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <ReviewSection productId={productId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map(relProduct => (
            <ProductCard key={relProduct.id} product={relProduct} />
          ))}
        </div>
      </div>
    </div>
  );
}
