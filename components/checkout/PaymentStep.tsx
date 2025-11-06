// components/checkout/PaymentStep.tsx

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Zap, CreditCard, Lock, Loader2 } from 'lucide-react';
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
    currency: string;
}

export function PaymentStep({ 
    prevStep, 
    data, 
    orderInfo, 
    isCreatingOrder,
    onInitiatePayment,
    onPaymentSuccess 
}: PaymentStepProps) {
    const { user, isLoggedIn } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');

    const userEmail = user?.email || 'guest@scentia.com';
    
    // Check if we have valid order info
    const hasValidOrder = orderInfo && orderInfo.orderId && orderInfo.orderTotalCents > 0;
    
    // Disable payment if not logged in or no valid data
    const canInitiatePayment = isLoggedIn && data.address && !isCreatingOrder;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-semibold">Payment Details</h3>
                <p className="text-xs text-green-600 flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Secured by SSL
                </p>
            </div>

            {/* Order Summary */}
            {!hasValidOrder && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        Click "Create Order & Pay" below to finalize your order and proceed to secure payment.
                    </p>
                </div>
            )}

            {hasValidOrder && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                        Order #{orderInfo.orderId} created successfully!
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                        Amount: GHS{(orderInfo.orderTotalCents / 100).toFixed(2)}
                    </p>
                </div>
            )}

            <p className="text-sm text-foreground/70">
                You will be redirected to the secure Paystack gateway to complete your payment 
                with card or mobile money.
            </p>

            <div className="border-2 border-primary/50 rounded-lg p-6 space-y-4 bg-primary/5 shadow-lg">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-lg text-foreground flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" /> 
                        Pay with Card or Mobile Money
                    </h4>
                    <Zap className="w-6 h-6 text-green-600" />
                </div>
                
                <Separator />
                
                <p className="font-semibold">
                    Paying as: <span className="text-primary">{userEmail}</span>
                </p>

                <div className="space-y-3">
                    <Input 
                        type="tel" 
                        placeholder="Mobile Money Phone Number (Optional)" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full p-3"
                        disabled={isCreatingOrder}
                    />
                </div>
                
                {/* Show Create Order button if no order yet */}
                {!hasValidOrder && (
                    <Button 
                        type="button"
                        className="w-full text-lg h-12 bg-blue-600 hover:bg-blue-700" 
                        onClick={onInitiatePayment}
                        disabled={!canInitiatePayment || isCreatingOrder}
                    >
                        {isCreatingOrder ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                                Creating Order...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-5 w-5" /> 
                                Create Order & Pay
                            </>
                        )}
                    </Button>
                )}

                {/* Show Paystack payment button if order is created */}
                {hasValidOrder && (
                    <PaystackForm 
                        amount={orderInfo.orderTotalCents}
                        email={orderInfo.userEmail}
                        reference={orderInfo.paymentReference}
                        onSuccess={onPaymentSuccess}
                         currency="GHS"
                    />
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={isCreatingOrder}
                >
                    Back to Shipping
                </Button>
            </div>
        </div>
    );
}