// app/checkout/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/httpClient';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AddressStep } from '@/components/checkout/AddressStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { CheckoutSummaryCard } from '@/components/checkout/CheckoutSummaryCard';

// Define the steps
const STEPS = ['Address', 'Payment'];

export default function CheckoutPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [discountCode, setDiscountCode] = useState<string | null>(null);
    const [checkoutData, setCheckoutData] = useState<any>({}); // Store address here

    // Order Info State - Populated after backend creates the order
    const [orderInfo, setOrderInfo] = useState<{
        orderId: number;
        orderTotalCents: number;
        userEmail: string;
        paymentReference?: string;
        accessCode?: string;
        authorizationUrl?: string;
    } | null>(null);

    // --- 1. Fetch Cart & Totals (Server-Side Calculation) ---
    const { data: totalsData, isLoading: isTotalsLoading } = useQuery({
        queryKey: ['checkoutTotals', discountCode],
        queryFn: () => apiFetch('/cart/calculate', { 
            method: 'POST', 
            body: JSON.stringify({ discountCode })
        }),
    });

    const { data: addressData } = useQuery({
        queryKey: ['addresses'],
        queryFn: () => apiFetch('/account/addresses'),
    });

    // --- 2. Create Order Mutation ---
    const createOrderMutation = useMutation({
        mutationFn: async () => {
            // Use the address from checkoutData if available, otherwise use default
            const addressToUse = checkoutData.address || addressData?.find((a: any) => a.isDefault) || addressData?.[0];
            
            if (!addressToUse) throw new Error("Please add a shipping address first.");

            return apiFetch('/checkout/order', {
                method: 'POST',
                body: JSON.stringify({
                    shippingAddress: addressToUse,
                    discountCode,
                }),
            });
        },
       onSuccess: (data) => {
            console.log('Order Response:', data);
            toast.success('Order created successfully!');
            
            // Store order ID for verification page
            localStorage.setItem('currentOrderId', data.orderId.toString());
            
            setOrderInfo({
                orderId: data.orderId,
                orderTotalCents: Math.round(data.paystack.amount || 0),
                userEmail: data.userEmail || '',
                paymentReference: data.paystack.reference,
                accessCode: data.paystack.accessCode,
                authorizationUrl: data.paystack.authorizationUrl,
            });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create order.');
        },
    });

    // --- 3. Verify Payment Mutation ---
    const verifyPaymentMutation = useMutation({
        mutationFn: (reference: string) => 
            apiFetch('/checkout/paystack-verify', {
                method: 'POST',
                body: JSON.stringify({ 
                    reference, 
                    orderId: orderInfo?.orderId 
                })
            }),
        onSuccess: (data) => {
            toast.success('Payment verified! Order confirmed.');
            router.push(`/account/orders/${data.order.id}`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Payment verification failed.');
        }
    });

    // --- Handlers ---
    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const handleCreateOrder = () => {
        createOrderMutation.mutate();
    };

    const handlePaymentSuccess = (reference: string) => {
        verifyPaymentMutation.mutate(reference);
    };

    if (isTotalsLoading) return <div className="container py-20 text-center">Loading checkout...</div>;

    return (
        <AuthGuard>
            <div className="container py-8 md:py-12">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Steps */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Bar (Visual only) */}
                        <div className="flex gap-2 mb-6">
                            {STEPS.map((step, idx) => (
                                <div key={step} className={`h-2 flex-1 rounded-full transition-all ${idx <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
                            ))}
                        </div>

                        {currentStep === 0 && (
                            <AddressStep
                                nextStep={handleNext}
                                data={checkoutData}
                                setData={setCheckoutData}
                            />
                        )}

                        {currentStep === 1 && (
                            <PaymentStep 
                                prevStep={handleBack}
                                data={checkoutData}
                                orderInfo={orderInfo}
                                isCreatingOrder={createOrderMutation.isPending}
                                onInitiatePayment={handleCreateOrder}
                                onPaymentSuccess={handlePaymentSuccess}
                                orderTotalCents={orderInfo?.orderTotalCents || 0}
                            />
                        )}
                    </div>

                    {/* Right Column: Summary */}
                    <div>
                        <CheckoutSummaryCard 
                            cartSubtotal={totalsData?.subtotal || 0}
                            shippingCost={totalsData?.shipping || 0}
                            tax={totalsData?.tax || 0}
                            grandTotal={totalsData?.grandTotal || 0}
                            discountAmount={totalsData?.discountAmount || 0}
                            onDiscountApplied={(discount) => setDiscountCode(discount?.code || null)}
                        />
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}