// app/cart/page.tsx

'use client';

import Link from 'next/link';
import { ShoppingCart, ShoppingBag, XCircle } from 'lucide-react';

import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/layout/AuthGuard';

/**
 * Main Shopping Cart Page component.
 * Displays list of items, quantity controls, subtotal, and checkout summary,
 * securely relying on server-side calculated totals.
 */
export default function CartPage() {
  // Use rawCartSubtotal for the subtotal display (before any server-side discounts)
  const { cartDetails, totalItems, rawCartSubtotal, totals, isLoading, clearCart } = useCart(); 
  const cartIsEmpty = totalItems === 0;

  // Format currency
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(amount);

  // Safely extract totals calculated by the backend (defaults to standard shipping)
  const subtotal = rawCartSubtotal;
  const shippingCost = totals?.shipping ?? 0;
  const tax = totals?.tax ?? 0;
  const grandTotal = totals?.grandTotal ?? subtotal + shippingCost + tax;

  // --- Empty Cart State ---
  if (cartIsEmpty && !isLoading) {
    return (
      <AuthGuard>
      <div className="container py-20 text-center">
        <XCircle className="w-16 h-16 text-primary/80 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-lg text-foreground/70 mb-6">Time to find your next signature scent.</p>
        <Link href="/shop">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Start Shopping
          </Button>
        </Link>
      </div>
      </AuthGuard>
    );
  }
  
  // --- Main Cart Content ---
  return (
    <div className="container py-6 md:py-10">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        Your Shopping Cart 
        <ShoppingCart className="w-7 h-7 ml-3 text-primary" />
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2">
          {cartDetails.map((item) => (
            <CartItemCard key={item.productId} item={item} />
          ))}

          <div className="mt-4 flex justify-between items-center">
            <Button variant="link" onClick={clearCart} className="text-sm text-red-500 hover:text-red-600">
                Clear Cart
            </Button>
            <p className="text-lg font-semibold">
                Total Items: <span className="text-primary">{totalItems}</span>
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <Card className="lg:sticky lg:top-24 h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Subtotals (using calculated values from the API) */}
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    {/* Display the raw cart subtotal before any taxes/shipping/discounts */}
                    <p>Merchandise Subtotal ({totalItems} items):</p> 
                    <p className="font-medium">{formatCurrency(subtotal)}</p>
                </div>
                <div className="flex justify-between">
                    <p>Shipping Estimate (Standard):</p>
                    <p className="font-medium">{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</p>
                </div>
                <div className="flex justify-between">
                    <p>Tax Estimate (8%):</p>
                    <p className="font-medium">{formatCurrency(tax)}</p>
                </div>
            </div>

            <Separator />
            
            {/* Grand Total */}
            <div className="flex justify-between text-lg font-bold">
              <p>Order Total:</p>
              <p className="text-primary">{formatCurrency(grandTotal)}</p>
            </div>

            {/* Checkout CTA */}
            <Link href="/checkout">
              <Button size="lg" className="w-full text-base font-bold mt-4">
                Proceed to Checkout
              </Button>
            </Link>
            
            <p className="text-xs text-center text-foreground/60 pt-2">
                Discount calculated and final totals confirmed at checkout.
            </p>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}