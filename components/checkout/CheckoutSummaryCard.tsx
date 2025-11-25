// components/checkout/CheckoutSummaryCard.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, Sparkles, Tag, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/httpClient';
import { toast } from 'sonner';

interface CheckoutSummaryCardProps {
    cartSubtotal: number;
    shippingCost: number;
    tax: number; // Will be 0 now
    grandTotal: number;
    discountAmount: number;
    onDiscountApplied: (discount: { code: string } | null) => void;
}

export function CheckoutSummaryCard({ 
    cartSubtotal, 
    shippingCost, 
    grandTotal, 
    discountAmount, 
    onDiscountApplied 
}: CheckoutSummaryCardProps) {
    const queryClient = useQueryClient();
    const [couponCode, setCouponCode] = useState('');
    const [discountError, setDiscountError] = useState<string | null>(null);

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    const discountMutation = useMutation({
        mutationFn: (code: string) =>
            apiFetch('/discounts/validate', { 
                method: 'POST', 
                body: JSON.stringify({ code }) 
            }),
        onSuccess: (data: any) => {
            setDiscountError(null);
            onDiscountApplied({ code: data.discount.code });
            queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
            toast.success('Coupon applied!');
        },
        onError: (error: any) => {
            onDiscountApplied(null);
            setDiscountError(error.message || 'Invalid coupon.');
            queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
        },
    });

    const handleApply = () => {
        if (!couponCode) return;
        discountMutation.mutate(couponCode);
    };

    const handleRemove = () => {
        setCouponCode('');
        setDiscountError(null);
        onDiscountApplied(null);
        queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
    };
    
    const isActiveDiscount = discountAmount > 0;

    return (
        <Card className="lg:sticky lg:top-24 shadow-lg border-muted">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" /> Order Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {/* Line Items */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(cartSubtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Truck className="h-4 w-4" /> Delivery Fee
                        </div>
                        <span>{formatCurrency(shippingCost)}</span>
                    </div>

                    {isActiveDiscount && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Discount</span>
                            <span>- {formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                </div>

                <Separator />
                
                {/* Total */}
                <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">{formatCurrency(grandTotal)}</span>
                </div>

                {/* Coupon Section */}
                <div className="pt-4 space-y-2">
                    {isActiveDiscount ? (
                        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            <span className="flex items-center gap-2"><CheckCircle className='w-4 h-4'/> {couponCode || 'Applied'}</span>
                            <button onClick={handleRemove} className="text-xs hover:underline font-semibold">Remove</button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Promo Code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={discountMutation.isPending}
                                className="h-9"
                            />
                            <Button 
                                size="sm"
                                onClick={handleApply}
                                disabled={discountMutation.isPending || !couponCode}
                            >
                                {discountMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                    )}
                    {discountError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle className='w-3 h-3'/> {discountError}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}