'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import Link from 'next/link';

import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ImageGallery } from '@/components/product/ImageGallery';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewSection } from '@/components/product/ReviewSection';

interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetails({ product, relatedProducts }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isProductInWishlist } = useWishlist();

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= 5;
  const isInWishlist = isProductInWishlist(product.id);

  // Handle Price being string (from Decimal) or number
  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;

  const hasDiscount = originalPrice ? originalPrice > price : false;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(p);

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

  // Safe parsing of JSON details
  const details = product.details as any || {};
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
          <div className="flex flex-wrap gap-2">
            {hasDiscount && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">
                -{discountPercentage}% OFF
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-semibold">
                Featured
              </Badge>
            )}
          </div>

          <p className="text-sm font-semibold uppercase text-accent tracking-wide">{product.brand}</p>
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
            <p className="text-3xl md:text-4xl font-bold text-primary">{formatPrice(price)}</p>
            {originalPrice && (
              <p className="text-xl text-muted-foreground line-through font-medium">
                {formatPrice(originalPrice)}
              </p>
            )}
          </div>

          <Separator />

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

          <p className="text-foreground/80 leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-3 gap-3 py-4">
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <Truck className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs font-medium text-center">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs font-medium text-center">Authentic</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <RotateCcw className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs font-medium text-center">Returns</span>
            </div>
          </div>

          <Separator />

          {/* Quantity & Cart Buttons */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-4 py-2 hover:bg-muted disabled:opacity-50"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold border-x">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.availableStock}
                  className="px-4 py-2 hover:bg-muted disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

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
              <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
            </Button>
          </div>

          <Separator />

          {/* Tabs */}
          <div className="mt-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Size</h4>
                    <p className="font-medium">{details?.size || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Concentration</h4>
                    <p className="font-medium">{details?.concentration || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                    <h4 className="font-semibold">Scent Profile</h4>
                    <div className="flex flex-wrap gap-2">
                    {scentProfile.map((profile: string) => (
                        <Badge key={profile} variant="secondary">{profile}</Badge>
                    ))}
                    </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg border">
                    <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">Top Notes</h4>
                    <p className="text-sm">{topNotes.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-pink-50/50 dark:bg-pink-950/10 rounded-lg border">
                    <h4 className="font-semibold mb-2 text-pink-900 dark:text-pink-100">Middle Notes</h4>
                    <p className="text-sm">{middleNotes.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/10 rounded-lg border">
                    <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Base Notes</h4>
                    <p className="text-sm">{baseNotes.join(', ') || 'N/A'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <ReviewSection productId={product.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Related Products */}
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