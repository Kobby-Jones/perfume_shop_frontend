// ============================================================================
// components/checkout/PaymentStep.tsx
// ============================================================================

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Zap, CreditCard, Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { PaystackForm } from './PaystackForm';
import { useState } from 'react';

interface PaymentStepProps {
    prevStep: () => void;
    data: any;
    orderInfo: any | null;
    isCreatingOrder: boolean;
    onInitiatePayment: () => void;
    onPaymentSuccess: (reference: string) => void;
    orderTotalCents: number; // NEW: Final amount to pay (in cents/kobo)
}

export function PaymentStep({ 
    prevStep, 
    data, 
    orderInfo, 
    isCreatingOrder,
    onInitiatePayment,
    onPaymentSuccess,
    orderTotalCents // NEW
}: PaymentStepProps) {
    const { user, isLoggedIn } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');

    const userEmail = user?.email || 'guest@scentia.com';
    const hasValidOrder = orderInfo && orderInfo.orderId && orderInfo.orderTotalCents > 0;
    const canInitiatePayment = isLoggedIn && data.address && !isCreatingOrder;

    const displayFinalAmount = (orderTotalCents / 100).toFixed(2);
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">Payment Details</h3>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-semibold">Secure SSL</span>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    Complete your order with secure payment
                </p>
            </div>

            {/* Order Status Messages */}
            {!hasValidOrder && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-blue-900 mb-1">Ready to Create Your Order</p>
                            <p className="text-sm text-blue-800">
                                Click "Create Order & Pay" below to finalize your order details and proceed to secure payment.
                            </p>
                            <p className="text-lg font-bold text-blue-900 mt-2">
                                Final Amount: GHS {displayFinalAmount}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {hasValidOrder && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-green-900 mb-1">Order Created Successfully!</p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-green-800">
                                    Order **#{orderInfo.orderId}**
                                </p>
                                <p className="text-lg font-bold text-green-900">
                                    GHS {displayFinalAmount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Gateway Card */}
            <div className="border-2 border-primary/30 rounded-xl p-6 space-y-5 bg-gradient-to-br from-primary/5 to-transparent shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Secure Payment Gateway</h4>
                            <p className="text-sm text-muted-foreground">Powered by Paystack</p>
                        </div>
                    </div>
                    <Zap className="w-7 h-7 text-green-600" />
                </div>
                
                <Separator />

                {/* Payment Methods */}
                <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-2 bg-white border rounded-lg text-xs font-semibold flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card Payment
                    </div>
                    {/* Placeholder badges for Ghanaian mobile money options */}
                    <div className="px-3 py-2 bg-[#FFCC00] border rounded-lg text-xs font-bold flex items-center gap-2 text-black">
                        MTN MoMo
                    </div>
                    <div className="px-3 py-2 bg-[#E31E24] text-white border rounded-lg text-xs font-bold flex items-center gap-2">
                        Telecel Cash
                    </div>
                </div>
                
                {/* Email Display */}
                <div className="bg-white/50 rounded-lg p-4 border">
                    <p className="text-sm text-muted-foreground mb-1">Paying as:</p>
                    <p className="font-semibold text-primary flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {userEmail}
                    </p>
                </div>

                {/* Phone Number Input (Kept for MoMo context) */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Mobile Money Number (Optional)</label>
                    <Input 
                        type="tel" 
                        placeholder="e.g., 0241234567" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-11"
                        disabled={isCreatingOrder}
                    />
                    <p className="text-xs text-muted-foreground">
                        Required for Mobile Money payments
                    </p>
                </div>
                
                {/* Payment Buttons */}
                {!hasValidOrder && (
                    <Button 
                        type="button"
                        className="w-full text-base h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" 
                        onClick={onInitiatePayment}
                        disabled={!canInitiatePayment || isCreatingOrder || orderTotalCents <= 0}
                    >
                        {isCreatingOrder ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                                Creating Your Order...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-5 w-5" /> 
                                Create Order & Pay
                            </>
                        )}
                    </Button>
                )}

                {hasValidOrder && (
                    <PaystackForm 
                        amount={orderTotalCents} // Use the final calculated amount
                        email={orderInfo.userEmail}
                        reference={orderInfo.paymentReference}
                        onSuccess={onPaymentSuccess}
                    />
                )}

                {/* Security Info */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                    <Lock className="h-3 w-3" />
                    <span>Your payment information is encrypted and secure</span>
                </div>
            </div>

            <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={isCreatingOrder}
                className="h-11 px-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shipping
            </Button>
        </div>
    );
}