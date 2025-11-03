// components/cart/CartItemCard.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * Props passed to the CartItemCard component.
 * @property item - The detailed cart item object containing product data.
 */
interface CartItemCardProps {
  item: ReturnType<typeof useCart>['cartDetails'][number];
}

/**
 * Renders a single, interactive item card within the shopping cart.
 * Allows quantity adjustment and item removal.
 */
export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity, subtotal } = item;
  
  // Guard check (shouldn't happen if filtered in useCart, but safe practice)
  if (!product) return null; 

  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(product.price);
  const formattedSubtotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(subtotal);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-border">
      
      {/* 1. Image and Name (Left Side) */}
      <Link href={`/product/${product.id}`} className="flex items-center w-full sm:w-1/2">
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border border-border">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="ml-4 space-y-1">
          <h3 className="font-semibold hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-sm text-foreground/70">{product.brand}</p>
        </div>
      </Link>
      
      {/* 2. Controls and Price (Right Side) - Stacks vertically on mobile */}
      <div className="flex w-full sm:w-1/2 justify-between items-center mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-border sm:border-t-0">
        
        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => updateQuantity(product.id, quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => updateQuantity(product.id, quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Subtotal Price */}
        <div className="text-right flex items-center space-x-4">
            <p className="font-semibold text-lg text-primary min-w-[80px]">{formattedSubtotal}</p>
            
            {/* Remove Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground/50 hover:text-red-500"
                onClick={() => removeFromCart(product.id)}
                aria-label="Remove item"
            >
                <Trash2 className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}