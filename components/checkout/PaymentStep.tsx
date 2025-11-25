// components/checkout/PaymentStep.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { PaystackForm } from './PaystackForm';

interface PaymentStepProps {
    prevStep: () => void;
    data: any;
    // Updated Interface to match backend response
    orderInfo: {
        orderId: number;
        orderTotalCents: number;
        userEmail: string;
        paymentReference?: string;
        accessCode?: string; // NEW
        authorizationUrl?: string; // NEW
    } | null;
    isCreatingOrder: boolean;
    onInitiatePayment: () => void;
    onPaymentSuccess: (reference: string) => void;
    orderTotalCents: number; 
}

export function PaymentStep({ 
    prevStep, 
    data, 
    orderInfo, 
    isCreatingOrder,
    onInitiatePayment,
    onPaymentSuccess,
    orderTotalCents 
}: PaymentStepProps) {
    const { user, isLoggedIn } = useAuth();
    const userEmail = user?.email || 'guest@scentia.com';
    
    // Check if we have successfully created an order on the backend
    const hasValidOrder = orderInfo && orderInfo.orderId && orderInfo.accessCode;
    const canInitiatePayment = isLoggedIn && data.address && !isCreatingOrder;

    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" /> Payment
                </h3>
                <p className="text-sm text-muted-foreground">Secure SSL Encrypted Transaction</p>
            </div>

            {/* Step 1: Create Order Button */}
            {!hasValidOrder && (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                        <AlertCircle className="text-blue-600 h-5 w-5 shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold">Review Order</p>
                            <p>Click below to confirm your order and generate a secure payment link.</p>
                        </div>
                    </div>
                    
                    <Button 
                        className="w-full h-12 text-lg" 
                        onClick={onInitiatePayment}
                        disabled={!canInitiatePayment || isCreatingOrder}
                    >
                        {isCreatingOrder ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Link...</>
                        ) : (
                            "Confirm Order & Pay"
                        )}
                    </Button>
                </div>
            )}

            {/* Step 2: Paystack Form (Only shows after order created) */}
            {hasValidOrder && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex gap-3">
                        <CheckCircle2 className="text-green-600 h-5 w-5 shrink-0" />
                        <div className="text-sm text-green-800">
                            <p className="font-semibold">Order #{orderInfo.orderId} Created</p>
                            <p>Please complete payment within 15 minutes to reserve your items.</p>
                        </div>
                    </div>

                    <div className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-xl text-primary">
                                GHS {(orderInfo.orderTotalCents / 100).toFixed(2)}
                            </span>
                        </div>
                        
                        <PaystackForm 
                        amount={orderInfo.orderTotalCents}
                        email={orderInfo.userEmail}
                        reference={orderInfo.paymentReference!}
                        accessCode={orderInfo.accessCode}
                        authorizationUrl={orderInfo.authorizationUrl} // Add this
                        onSuccess={onPaymentSuccess}
                    />
                                            
                        <div className="flex justify-center gap-2 text-xs text-muted-foreground mt-4">
                            <Shield className="h-3 w-3" /> Secured by Paystack
                        </div>
                    </div>
                </div>
            )}

            {!hasValidOrder && (
                <Button variant="ghost" onClick={prevStep} disabled={isCreatingOrder}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            )}
        </div>
    );
}