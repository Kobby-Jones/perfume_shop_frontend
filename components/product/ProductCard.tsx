// components/product/ProductCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Eye, Star, TrendingUp, Zap, Award } from 'lucide-react';

import { Product } from '@/lib/data/mock-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

/**
 * A rich, feature-complete product card with modern e-commerce features.
 * Includes badges, ratings, discounts, quick view, and smooth interactions.
 * FIXED: Responsive price display that prevents overflow issues.
 */
export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= 5;
  const { addToCart } = useCart();
  const { toggleWishlist, isProductInWishlist } = useWishlist();
  const isInWishlist = isProductInWishlist(product.id);

  // Calculate discount percentage if original price exists
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  // Mock rating data (you can extend your Product type to include these)
  const rating = 4.5; // This should come from product.rating
  const reviewCount = 127; // This should come from product.reviewCount

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GHS',
  }).format(product.price);

  const formattedOriginalPrice = product.originalPrice 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GHS',
      }).format(product.originalPrice)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    console.log(`Added ${product.name} to cart via card.`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Determine badges to show (you can extend Product type with these properties)
  const showNewBadge = true; // product.isNew
  const showBestsellerBadge = false; // product.isBestseller
  const showFeaturedBadge = false; // product.isFeatured

  return (
    <Card className="group relative overflow-hidden border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 bg-white rounded-lg">
      <Link href={`/product/${product.id}`} className="block">
        {/* Badge Container - Top Left */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-0.5 text-xs shadow-md">
              -{discountPercentage}%
            </Badge>
          )}
          {showNewBadge && !hasDiscount && (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-0.5 text-xs shadow-md">
              <Zap className="w-3 h-3 mr-0.5" />
              New
            </Badge>
          )}
          {showBestsellerBadge && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-2 py-0.5 text-xs shadow-md">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              Best Seller
            </Badge>
          )}
          {showFeaturedBadge && (
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-2 py-0.5 text-xs shadow-md">
              <Award className="w-3 h-3 mr-0.5" />
              Featured
            </Badge>
          )}
        </div>

        {/* Action Buttons - Top Right */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={cn(
              "w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110",
              isInWishlist 
                ? "bg-red-500/90 hover:bg-red-600" 
                : "bg-white/90 hover:bg-white"
            )}
            aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={cn(
              "h-4 w-4 transition-all",
              isInWishlist 
                ? "fill-white text-white" 
                : "text-gray-700 hover:text-red-500"
            )} />
          </button>

          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
              aria-label="Quick View"
            >
              <Eye className="h-4 w-4 text-gray-700" />
            </button>
          )}
        </div>

        {/* Image Container - Square aspect ratio */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-110",
              isOutOfStock && "opacity-50"
            )}
            placeholder="empty"
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white text-sm font-bold uppercase tracking-wider bg-gray-900/90 px-4 py-2 rounded-md shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low Stock Indicator */}
          {isLowStock && !isOutOfStock && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded text-center">
                Only {product.availableStock} left in stock!
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <CardContent className="p-4">
          {/* Category or Brand */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-medium">
            {product.category}
          </p>

          {/* Product Name - 2 lines max */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] mb-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : i < rating
                      ? "fill-amber-200 text-amber-400"
                      : "fill-gray-200 text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {rating}
            </span>
            <span className="text-xs text-gray-400">
              ({reviewCount})
            </span>
          </div>

          {/* Price Section - FIXED: Responsive layout that prevents overflow */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-lg sm:text-xl font-bold text-gray-900 flex-shrink-0">
                {formattedPrice}
              </p>
              {formattedOriginalPrice && (
                <p className="text-xs sm:text-sm text-gray-400 line-through font-medium flex-shrink-0">
                  {formattedOriginalPrice}
                </p>
              )}
            </div>
            {/* Optional: Show savings amount */}
            {hasDiscount && (
              <p className="text-xs text-green-600 font-medium mt-0.5">
                Save GHS {(product.originalPrice! - product.price).toFixed(2)}
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            className={cn(
              "w-full h-10 text-sm font-semibold transition-all duration-200",
              isOutOfStock 
                ? "bg-gray-100 text-gray-400 hover:bg-gray-100" 
                : "shadow-sm hover:shadow-md"
            )}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? 'Notify Me' : 'Add to Cart'}
          </Button>

          {/* Free Shipping or Delivery Info */}
          {!isOutOfStock && (
            <p className="text-xs text-green-600 text-center mt-2 font-medium">
              ✓ Free shipping on orders over GHS 100
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}