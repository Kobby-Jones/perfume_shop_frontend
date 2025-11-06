// app/checkout/page.tsx

'use client';

import { useState } from 'react';
import {
  Truck,
  MapPin,
  CreditCard,
  CheckCircle,
  Frown,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
}

interface OrderCreationResponse {
  orderId: number;
  orderTotal: number;
  orderTotalCents: number;
  userEmail: string;
  paymentReference: string;
  message: string;
}

function CheckoutPageContent() {
  const { cartDetails, totals, isLoading } = useCart();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    address: null,
    shippingOption: 'standard',
  });
  
  // Store order info after creation
  const [orderInfo, setOrderInfo] = useState<OrderCreationResponse | null>(null);

  const cartIsEmpty = cartDetails.length === 0;
  const grandTotal = totals?.grandTotal || 0;

  // --- Step 1: Create Order Mutation ---
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      console.log('Creating order with:', {
        shippingAddress: checkoutData.address,
        shippingOption: checkoutData.shippingOption,
      });
      
      const response = await apiFetch('/checkout/order', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: checkoutData.address,
          shippingOption: checkoutData.shippingOption,
        }),
      });
      
      console.log('Order created:', response);
      return response as OrderCreationResponse;
    },
    onSuccess: (data) => {
      console.log('Order creation successful:', data);
      setOrderInfo(data);
      toast.success('Order created! You can now proceed to payment.');
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to create order. Please try again.');
    },
  });

  // --- Step 2: Verify Payment Mutation ---
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
      // Invalidate cart query to refresh the empty cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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

  if (isLoading) {
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

  if (currentStep === 4) {
    return (
      <div className="container py-20 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-lg text-foreground/70 mb-6">
          Your payment was verified and your order is being processed.
        </p>
        {orderInfo && (
          <p className="text-sm text-foreground/60 mb-6">
            Order #{orderInfo.orderId}
          </p>
        )}
        <Link href="/account/orders">
          <Button size="lg">View Order History</Button>
        </Link>
      </div>
    );
  }

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
  } : {};

  const ComponentToRender: any = CurrentStepComponent;

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          {ComponentToRender && (
            <ComponentToRender {...baseStepProps} {...paymentProps} />
          )}
        </Card>

        <CheckoutSummaryCard
          cartTotal={grandTotal}
          shippingOption={checkoutData.shippingOption}
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