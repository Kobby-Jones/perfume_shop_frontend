// ============================================================================
// components/checkout/CheckoutSummaryCard.tsx
// ============================================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, TrendingUp, Sparkles } from 'lucide-react';

interface CheckoutSummaryCardProps {
    cartTotal: number;
    shippingOption: 'standard' | 'express';
}

export function CheckoutSummaryCard({ cartTotal, shippingOption }: CheckoutSummaryCardProps) {
    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(amount);

    const shippingCost = shippingOption === 'express' ? 25.00 : cartTotal >= 100 ? 0 : 15.00;
    const taxRate = 0.08;
    const tax = (cartTotal + shippingCost) * taxRate;
    const grandTotal = cartTotal + shippingCost + tax;
    const savings = shippingCost === 0 ? 15.00 : 0;

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
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-semibold text-base">{formatCurrency(cartTotal)}</span>
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
                </div>

                <Separator className="bg-primary/20" />
                
                {/* Grand Total */}
                <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-base font-semibold">Total:</span>
                        <span className="text-3xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
                
                {/* Savings Badge */}
                {savings > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-green-800 font-semibold">
                            You're saving {formatCurrency(savings)} on shipping!
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