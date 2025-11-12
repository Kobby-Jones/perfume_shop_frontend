// app/product/[id]/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Truck, Shield, RotateCcw, Star, Package } from 'lucide-react';

import { Product } from '@/lib/types';
import { apiFetch } from '@/lib/api/httpClient'; // Import API client
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ImageGallery } from '@/components/product/ImageGallery';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductDetailSkeleton } from '@/components/product/ProductListingSkeletons';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewSection } from '@/components/product/ReviewSection';

// API function to get a single product by ID
async function getProductByIdApi(id: number): Promise<Product | undefined> {
    const data = await apiFetch(`/products/${id}`);
    return data as Product;
}

// API function to get all products (used for related products section)
async function getAllProductsApi(): Promise<Product[]> {
    const data = await apiFetch(`/products`);
    return data.products as Product[];
}


/**
 * Product Detail Page component.
 */
export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { toggleWishlist, isProductInWishlist } = useWishlist();

  // Fetch the specific product data
  const { data: product, isLoading: isProductLoading } = useQuery<Product | undefined>({
    queryKey: ['product', productId],
    queryFn: () => getProductByIdApi(productId),
    enabled: !isNaN(productId),
  });

  // Fetch all products for related section
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getAllProductsApi,
    staleTime: 1000 * 60 * 5, // Cache product list for 5 minutes
  });

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    // Get products from the same category, excluding current product
    return allProducts
      .filter(p => p.category === product.category && p.id !== productId)
      .slice(0, 4);
  }, [allProducts, productId, product]);

  if (isProductLoading) {
    return <div className="container py-12"><ProductDetailSkeleton /></div>;
  }
    
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

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= 5;
  const isInWishlist = isProductInWishlist(product.id);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(price);

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.availableStock) {
      setQuantity(newQuantity);
    }
  };

  // Ensure details object exists and has required sub-arrays
  const details = product.details as any;
  const scentProfile = Array.isArray(details?.scentProfile) ? details.scentProfile : [];
  const season = Array.isArray(details?.season) ? details.season : [];
  const occasion = Array.isArray(details?.occasion) ? details.occasion : [];
  const topNotes = Array.isArray(details?.topNotes) ? details.topNotes : [];
  const middleNotes = Array.isArray(details?.middleNotes) ? details.middleNotes : [];
  const baseNotes = Array.isArray(details?.baseNotes) ? details.baseNotes : [];


  return (
    <div className="container py-6 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:sticky lg:top-24 h-full">
          <ImageGallery images={product.images} name={product.name} />
        </div>

        {/* Right Column: Details and CTA */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {hasDiscount && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">
                -{discountPercentage}% OFF
              </Badge>
            )}
            {/* These flags are not stored in DB, keeping mock logic temporarily or removing them */}
            {product.isNew && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                New Arrival
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-semibold">
                Featured
              </Badge>
            )}
          </div>

          {/* Brand */}
          <p className="text-sm font-semibold uppercase text-accent tracking-wide">{product.brand}</p>

          {/* Product Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < Math.floor(product.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : i < (product.rating || 0)
                      ? "fill-amber-200 text-amber-400"
                      : "fill-gray-200 text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">
              {product.rating?.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <p className="text-3xl md:text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-xl text-muted-foreground line-through font-medium">
                {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>

          <Separator />

          {/* Stock Status */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className={cn(
                "text-sm font-semibold",
                isOutOfStock ? "text-red-500" : isLowStock ? "text-orange-500" : "text-green-600"
              )}>
                {isOutOfStock 
                  ? '● OUT OF STOCK' 
                  : isLowStock 
                  ? `● ONLY ${product.availableStock} LEFT!` 
                  : `● IN STOCK (${product.availableStock} available)`
                }
              </span>
              <span className="text-sm text-muted-foreground">• {product.category} Collection</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-foreground/80 leading-relaxed">{product.description}</p>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-3 gap-3 py-4">
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <Truck className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs font-medium text-center">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs font-medium text-center">Authentic</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <RotateCcw className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs font-medium text-center">30 Day Return</span>
            </div>
          </div>

          <Separator />

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-4 py-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold border-x">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.availableStock}
                  className="px-4 py-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              size="lg" 
              className="flex-1 text-base font-bold h-12 shadow-md hover:shadow-lg" 
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isOutOfStock ? 'Notify Me When Restocked' : 'Add to Cart'}
            </Button>
            <Button 
              variant={isInWishlist ? "default" : "outline"}
              size="lg" 
              className="sm:w-auto h-12"
              onClick={handleToggleWishlist}
            >
              <Heart className={cn(
                "h-5 w-5",
                isInWishlist && "fill-current"
              )} />
            </Button>
          </div>

          <Separator />

          {/* Product Details Tabs */}
          <div className="mt-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Fragrance Notes</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Size</h4>
                    <p className="font-medium">{details?.size}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Concentration</h4>
                    <p className="font-medium">{details?.concentration}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Longevity</h4>
                    <p className="font-medium">{details?.longevity}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Sillage</h4>
                    <p className="font-medium">{details?.sillage}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Scent Profile</h4>
                  <div className="flex flex-wrap gap-2">
                    {scentProfile.map((profile: string) => (
                      <Badge key={profile} variant="secondary">
                        {profile}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Best For</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Season</p>
                      <div className="flex flex-wrap gap-1">
                        {season.map((s: string) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Occasion</p>
                      <div className="flex flex-wrap gap-1">
                        {occasion.map((o: string) => (
                          <Badge key={o} variant="outline" className="text-xs">
                            {o}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Fragrance Notes Tab */}
              <TabsContent value="notes" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-amber-900 dark:text-amber-100">
                      Top Notes
                    </h4>
                    <p className="text-sm text-foreground/80">
                      {topNotes.join(', ')}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-rose-900 dark:text-rose-100">
                      Middle Notes
                    </h4>
                    <p className="text-sm text-foreground/80">
                      {middleNotes.join(', ')}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
                      Base Notes
                    </h4>
                    <p className="text-sm text-foreground/80">
                      {baseNotes.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    Fragrance notes are layered: Top notes are the initial scent, middle notes form the heart, 
                    and base notes provide the lasting impression.
                  </p>
                </div>
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
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Similar Fragrances</h2>
            <Link 
              href={`/shop?category=${product.category}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View All {product.category}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(relProduct => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}