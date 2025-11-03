// components/checkout/CheckoutSummaryCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Props for the summary card.
 */
interface CheckoutSummaryCardProps {
    cartTotal: number;
    shippingOption: 'standard' | 'express';
}

/**
 * Reusable component for displaying the dynamic order summary during checkout.
 */
export function CheckoutSummaryCard({ cartTotal, shippingOption }: CheckoutSummaryCardProps) {
    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    // Dynamic Costs
    const shippingCost = shippingOption === 'express' ? 25.00 : cartTotal >= 100 ? 0 : 15.00;
    const taxRate = 0.08;
    const tax = (cartTotal + shippingCost) * taxRate;
    const grandTotal = cartTotal + shippingCost + tax;

    return (
        <Card className="lg:sticky lg:top-24 h-fit border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="text-xl text-primary">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                
                {/* Subtotals */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <p>Subtotal:</p>
                        <p className="font-medium">{formatCurrency(cartTotal)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>Shipping ({shippingOption === 'express' ? 'Express' : 'Standard'}):</p>
                        <p className="font-medium">{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>Tax (8%):</p>
                        <p className="font-medium">{formatCurrency(tax)}</p>
                    </div>
                </div>

                <Separator />
                
                {/* Grand Total */}
                <div className="flex justify-between text-lg font-bold">
                    <p>Grand Total:</p>
                    <p className="text-primary text-2xl">{formatCurrency(grandTotal)}</p>
                </div>
                
                <p className="text-xs text-center text-foreground/60 pt-2">
                    You are saving {shippingCost === 0 ? formatCurrency(15) : formatCurrency(0)} on shipping!
                </p>

            </CardContent>
        </Card>
    );
}