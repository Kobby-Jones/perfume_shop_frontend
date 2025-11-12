// app/checkout/page.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  MapPin,
  CreditCard,
  CheckCircle,
  Frown,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'; // Added useQuery
import { toast } from 'sonner';
import { useCart } from '@/lib/hooks/useCart';
import { apiFetch } from '@/lib/api/httpClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckoutSummaryCard } from '@/components/checkout/CheckoutSummaryCard';
import { AddressStep } from '@/components/checkout/AddressStep';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGuard } from '@/components/layout/AuthGuard';

const checkoutSteps = [
  { id: 1, name: 'Shipping Address', icon: MapPin, component: AddressStep },
  { id: 2, name: 'Shipping Options', icon: Truck, component: ShippingStep },
  { id: 3, name: 'Payment & Review', icon: CreditCard, component: PaymentStep },
];

interface CheckoutData {
  address: any | null;
  shippingOption: 'standard' | 'express';
  discountCode: string | null;
  discountAmount: number; // Stored from the secure calculation response
}

interface OrderCreationResponse {
  orderId: number;
  orderTotal: number;
  orderTotalCents: number;
  userEmail: string;
  paymentReference: string;
}

// Interface for the secure totals fetched from the backend
interface SecureTotals {
  subtotal: number; // Original raw subtotal
  shipping: number;
  tax: number;
  discountAmount: number;
  grandTotal: number;
  discountCode?: string;
}


function CheckoutPageContent() {
  const { cartDetails, rawCartSubtotal, totals: initialTotals, isLoading: isCartLoading, refetchCart } = useCart();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    address: null,
    shippingOption: 'standard',
    discountCode: null,
    discountAmount: 0,
  });
  
  // --- 1. Fetch Secure Totals from Backend ---
  const { data: secureTotals, isLoading: isTotalsLoading } = useQuery<SecureTotals>({
      queryKey: ['checkoutTotals', checkoutData.shippingOption, checkoutData.discountCode],
      queryFn: () => apiFetch('/cart/calculate', {
          method: 'POST',
          body: JSON.stringify({
              shippingOption: checkoutData.shippingOption,
              discountCode: checkoutData.discountCode,
          }),
      }),
      // Only enabled if cart is not loading and we are authenticated (handled by AuthGuard/useCart)
      enabled: !isCartLoading && rawCartSubtotal > 0, 
      staleTime: 0, // Ensure fresh calculations
  });

  // Safely get the current, definitive totals
  const subtotal = initialTotals?.subtotal ?? 0;
  const shippingCost = secureTotals?.shipping ?? 0;
  const tax = secureTotals?.tax ?? 0;
  const grandTotal = secureTotals?.grandTotal ?? subtotal + shippingCost + tax;
  const discountAmount = secureTotals?.discountAmount ?? 0;
  
  // Set the secure discount amount to local state whenever the query finishes
  useEffect(() => {
    if (secureTotals) {
        setCheckoutData(prev => ({
            ...prev,
            discountAmount: secureTotals.discountAmount,
            discountCode: secureTotals.discountCode || null
        }));
    }
  }, [secureTotals]);


  // Handle discount application from summary card
  const handleDiscountApplied = (discount: any | null) => {
    // This action only sets the CODE on the client; the secureTotals query handles the calculation.
    setCheckoutData(prev => ({
        ...prev,
        discountCode: discount ? discount.code : null,
        // discountAmount will be updated by the successful secureTotals query
    }));
  };

  
  // Store order info after creation
  const [orderInfo, setOrderInfo] = useState<OrderCreationResponse | null>(null);

  const cartIsEmpty = cartDetails.length === 0;

  // --- 2. Create Order Mutation (Live) ---
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!checkoutData.address || !checkoutData.shippingOption || grandTotal <= 0) {
          throw new Error('Missing details or zero order total.');
      }
      
      const payload = {
        shippingAddress: checkoutData.address,
        shippingOption: checkoutData.shippingOption,
        discountCode: checkoutData.discountCode, // Server re-validates and applies this
      };
      
      const response = await apiFetch('/checkout/order', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      return response as OrderCreationResponse;
    },
    onSuccess: (data) => {
      setOrderInfo(data);
      toast.success('Order created! You can now proceed to payment.');
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to create order. Please try again.');
    },
  });

  // --- 3. Verify Payment Mutation (Live) ---
  const verifyPaymentMutation = useMutation({
    mutationFn: async (reference: string) => {
      if (!orderInfo) throw new Error('No order information available');
      
      return apiFetch('/checkout/paystack-verify', {
        method: 'POST',
        body: JSON.stringify({
          reference,
          orderId: orderInfo.orderId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkoutTotals'] });
      queryClient.invalidateQueries({ queryKey: ['userAddresses'] }); 
      refetchCart();
      
      toast.success('Payment verified! Your order is confirmed.');
      setCurrentStep(4); // Move to success step
    },
    onError: (error: any) => {
      toast.error(error.message || 'Payment verification failed. Please contact support.');
    },
  });

  // Handler for payment step to call
  const handlePaymentInitiation = () => {
    createOrderMutation.mutate();
  };

  // Handler for successful Paystack payment
  const handlePaymentSuccess = (reference: string) => {
    verifyPaymentMutation.mutate(reference);
  };

  const CurrentStepComponent = checkoutSteps.find(
    (step) => step.id === currentStep
  )?.component;

  const nextStepHandler = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStepHandler = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const isGloballyLoading = isCartLoading || isTotalsLoading;

  if (isGloballyLoading) {
    return (
      <div className="container py-20 text-center">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (cartIsEmpty && currentStep !== 4) {
    return (
      <div className="container py-20 text-center">
        <Frown className="w-16 h-16 text-primary/80 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-lg text-foreground/70 mb-6">
          Time to find your next signature scent.
        </p>
        <Link href="/shop">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate total AFTER discount for the final order creation
  const finalOrderTotal = grandTotal; // Now this comes from secureTotals

  // Base props for all steps
  const baseStepProps = {
    data: checkoutData,
    setData: setCheckoutData,
    nextStep: nextStepHandler,
    prevStep: prevStepHandler,
  };

  // Payment-specific props
  const paymentProps = currentStep === 3 ? {
    orderInfo: orderInfo,
    isCreatingOrder: createOrderMutation.isPending,
    onInitiatePayment: handlePaymentInitiation,
    onPaymentSuccess: handlePaymentSuccess,
    // Pass the final total after discount to the Paystack button
    orderTotalCents: Math.round(finalOrderTotal * 100), 
  } : {};

  const ComponentToRender: any = CurrentStepComponent;

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          {CurrentStepComponent && (
            <ComponentToRender {...baseStepProps} {...paymentProps} />
          )}
        </Card>

        <CheckoutSummaryCard
          cartSubtotal={subtotal} // Use raw subtotal
          shippingCost={shippingCost}
          tax={tax}
          grandTotal={grandTotal}
          discountAmount={discountAmount} // Pass calculated discount amount
          shippingOption={checkoutData.shippingOption}
          onDiscountApplied={handleDiscountApplied}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageContent />
    </AuthGuard>
  );
}