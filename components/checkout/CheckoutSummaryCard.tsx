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
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/httpClient';

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
    grandTotal: number;
    shippingOption: 'standard' | 'express';
    onDiscountApplied: (discount: DiscountDetails | null) => void;
}

export function CheckoutSummaryCard({ 
    cartSubtotal, 
    shippingCost, 
    tax, 
    grandTotal: initialGrandTotal,
    shippingOption,
    onDiscountApplied 
}: CheckoutSummaryCardProps) {
    const [couponCode, setCouponCode] = useState('');
    const [activeDiscount, setActiveDiscount] = useState<DiscountDetails | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    const discountMutation = useMutation({
        mutationFn: (code: string) =>
            apiFetch('/discounts/validate', { 
                method: 'POST', 
                body: JSON.stringify({ code, subtotal: cartSubtotal }) 
            }),
        onSuccess: (data: DiscountDetails) => {
            setActiveDiscount(data);
            setDiscountError(null);
            onDiscountApplied(data);
        },
        onError: (error: any) => {
            setActiveDiscount(null);
            onDiscountApplied(null);
            setDiscountError(error.message || 'Invalid or ineligible coupon.');
        },
    });

    const handleApplyDiscount = () => {
        if (!couponCode) return;
        discountMutation.mutate(couponCode);
    };

    const handleRemoveDiscount = () => {
        setActiveDiscount(null);
        setCouponCode('');
        setDiscountError(null);
        onDiscountApplied(null);
    };

    // Calculate applied discount value and final total
    const { finalTotal, discountValue } = useMemo(() => {
        let finalTotal = initialGrandTotal;
        let discountValue = 0;

        if (activeDiscount) {
            if (activeDiscount.type === 'percentage') {
                discountValue = (cartSubtotal * activeDiscount.value) / 100;
            } else if (activeDiscount.type === 'fixed') {
                discountValue = activeDiscount.value;
            }
            // Discount only applies to subtotal, not shipping or tax
            finalTotal = initialGrandTotal - discountValue;
            if (finalTotal < 0) finalTotal = 0; // Prevent negative totals
        }
        return { finalTotal, discountValue: Math.max(0, discountValue) };
    }, [activeDiscount, cartSubtotal, initialGrandTotal]);


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
                    {activeDiscount && (
                        <div className="flex justify-between items-center text-red-600 font-semibold pt-1 border-t border-dashed mt-2">
                            <span>Coupon ({activeDiscount.code}):</span>
                            <span>- {formatCurrency(discountValue)}</span>
                        </div>
                    )}
                </div>

                <Separator className="bg-primary/20" />
                
                {/* Discount Input */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4"/> Have a Coupon?
                    </h4>
                    
                    {activeDiscount ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-sm font-semibold text-green-800 flex items-center gap-2">
                                <CheckCircle className='w-4 h-4'/> {activeDiscount.code} Applied
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
                        <span className="text-3xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                    </div>
                </div>
                
                {/* Savings Badge */}
                {discountValue > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-green-800 font-semibold">
                            You saved {formatCurrency(discountValue)}!
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