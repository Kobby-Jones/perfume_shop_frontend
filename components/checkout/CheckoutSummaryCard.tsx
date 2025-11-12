// ============================================================================
// components/checkout/CheckoutSummaryCard.tsx
// ============================================================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, TrendingUp, Sparkles, Tag, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Added useQueryClient
import { apiFetch } from '@/lib/api/httpClient';
import { toast } from 'sonner';

interface DiscountDetails {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minPurchase: number;
}

interface CheckoutSummaryCardProps {
    cartSubtotal: number; // Raw cart subtotal
    shippingCost: number;
    tax: number;
    grandTotal: number; // Final calculated total
    discountAmount: number; // Discount amount applied by the backend
    shippingOption: 'standard' | 'express';
    onDiscountApplied: (discount: { code: string } | null) => void;
}

export function CheckoutSummaryCard({ 
    cartSubtotal, 
    shippingCost, 
    tax, 
    grandTotal, // Final total comes directly from prop
    discountAmount, // Discount value comes directly from prop
    shippingOption,
    onDiscountApplied 
}: CheckoutSummaryCardProps) {
    const queryClient = useQueryClient();
    const [couponCode, setCouponCode] = useState('');
    const [discountError, setDiscountError] = useState<string | null>(null);

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    // --- Discount Application Logic ---
    const discountMutation = useMutation({
        // Mutation now only validates and returns the discount metadata for display/state updates
        mutationFn: (code: string) =>
            apiFetch('/discounts/validate', { 
                method: 'POST', 
                body: JSON.stringify({ code, subtotal: cartSubtotal }) 
            }),
        onSuccess: (data: any) => {
            // Success means the code is valid. Notify parent and let parent re-fetch secure totals.
            setDiscountError(null);
            onDiscountApplied({ code: data.discount.code });
            // Invalidate checkout totals immediately to trigger server-side recalculation
            queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
            toast.success('Coupon code accepted! Totals recalculating.');
        },
        onError: (error: any) => {
            onDiscountApplied(null); // Clear code from parent state
            setDiscountError(error.message || 'Invalid or ineligible coupon.');
            // Invalidate checkout totals to force recalculation without a discount
            queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
        },
    });

    const handleApplyDiscount = () => {
        if (!couponCode) return;
        discountMutation.mutate(couponCode);
    };

    const handleRemoveDiscount = () => {
        setCouponCode('');
        setDiscountError(null);
        onDiscountApplied(null); // Clear code from parent state
        // Invalidate checkout totals to force recalculation without a discount
        queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
    };
    
    // Check if discount is currently active (discountAmount > 0 implies a code was successfully applied)
    const isActiveDiscount = discountAmount > 0;
    // Attempt to get the current code from the input state if active
    const activeDiscountCode = isActiveDiscount ? couponCode : undefined;


    return (
        <Card className="lg:sticky lg:top-24 h-fit border-2 border-primary/20 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            
            <CardHeader className="relative">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order Summary
                </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-5">
                {/* Line Items */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Merchandise Subtotal:</span>
                        <span className="font-semibold text-base">{formatCurrency(cartSubtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Shipping ({shippingOption === 'express' ? 'Express' : 'Standard'}):
                            </span>
                        </div>
                        <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                            {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tax (8%):</span>
                        <span className="font-semibold">{formatCurrency(tax)}</span>
                    </div>
                    
                    {/* Discount Line */}
                    {isActiveDiscount && (
                        <div className="flex justify-between items-center text-red-600 font-semibold pt-1 border-t border-dashed mt-2">
                            <span>Coupon ({activeDiscountCode}):</span>
                            <span>- {formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                </div>

                <Separator className="bg-primary/20" />
                
                {/* Discount Input */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4"/> Have a Coupon?
                    </h4>
                    
                    {isActiveDiscount ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-sm font-semibold text-green-800 flex items-center gap-2">
                                <CheckCircle className='w-4 h-4'/> {activeDiscountCode} Applied
                            </span>
                            <Button variant="ghost" size="sm" onClick={handleRemoveDiscount}>Remove</Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter code"
                                className="flex-1 h-10"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={discountMutation.isPending}
                            />
                            <Button 
                                type="button" 
                                className="h-10 px-4 flex-shrink-0" 
                                onClick={handleApplyDiscount}
                                disabled={discountMutation.isPending || !couponCode}
                            >
                                {discountMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                    )}
                    
                    {discountError && (
                        <div className="flex items-center gap-1 text-xs text-red-500">
                            <AlertTriangle className='w-3 h-3'/> {discountError}
                        </div>
                    )}
                </div>


                {/* Grand Total */}
                <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-base font-semibold">Total to Pay:</span>
                        <span className="text-3xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
                
                {/* Savings Badge */}
                {discountAmount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-green-800 font-semibold">
                            You saved {formatCurrency(discountAmount)}!
                        </p>
                    </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                    <TrendingUp className="h-3 w-3" />
                    <span>Prices in GHS (Ghana Cedis)</span>
                </div>
            </CardContent>
        </Card>
    );
}