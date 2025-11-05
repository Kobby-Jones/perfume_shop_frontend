// app/checkout/page.tsx

'use client';

import { useState } from 'react';
import {
  Truck,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
  Frown,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useCart } from '@/lib/hooks/useCart';
import { apiFetch } from '@/lib/api/httpClient';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardTitle } from '@/components/ui/card';
import { CheckoutSummaryCard } from '@/components/checkout/CheckoutSummaryCard';
import { AddressStep } from '@/components/checkout/AddressStep';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGuard } from '@/components/layout/AuthGuard'; // ✅ Import AuthGuard

// Define checkout steps
const checkoutSteps = [
  { id: 1, name: 'Shipping Address', icon: MapPin, component: AddressStep },
  { id: 2, name: 'Shipping Options', icon: Truck, component: ShippingStep },
  { id: 3, name: 'Payment & Review', icon: CreditCard, component: PaymentStep },
];

interface CheckoutData {
  address: any | null;
  shippingOption: 'standard' | 'express';
}

/**
 * Protected Checkout Page
 * Wrapped with AuthGuard to restrict access to logged-in users.
 */
function CheckoutPageContent() {
  const { cartDetails, cartTotal, isLoading } = useCart();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    address: null,
    shippingOption: 'standard',
  });

  const cartIsEmpty = cartDetails.length === 0;

  // --- Mutation Hook for Placing Order ---
  const placeOrderMutation = useMutation({
    mutationFn: (data: { shippingAddress: any; shippingOption: 'standard' | 'express' }) =>
      apiFetch('/checkout/order', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: data.shippingAddress,
          shippingOption: data.shippingOption,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`Order #${data.orderId} placed successfully! Redirecting to payment...`);
      setCurrentStep(4);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Checkout failed. Please try again.');
    },
  });

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <Skeleton />
      </div>
    );
  }

  // --- Empty Cart State ---
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

  // --- Order Confirmation Step ---
  if (currentStep === 4) {
    return (
      <div className="container py-20 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-lg text-foreground/70 mb-6">
          Your payment was successful and your order is being processed.
        </p>
        <Link href="/account/orders">
          <Button size="lg">View Order History</Button>
        </Link>
      </div>
    );
  }

  const CurrentStepComponent = checkoutSteps.find(
    (step) => step.id === currentStep
  )?.component;

  const handlePlaceOrder = () => {
    if (!checkoutData.address) {
      toast.error('Please complete your shipping address before placing an order.');
      return;
    }

    placeOrderMutation.mutate({
      shippingAddress: checkoutData.address,
      shippingOption: checkoutData.shippingOption,
    });
  };

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

      {/* Step Progress Tracker */}
      <div className="flex justify-between items-center mb-10 text-sm md:text-base overflow-x-auto whitespace-nowrap">
        {checkoutSteps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors duration-300 ${
                    isComplete
                      ? 'bg-primary text-primary-foreground'
                      : isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-foreground/70 border border-border'
                  }`}
                >
                  {isComplete ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={`mt-1 text-xs md:text-sm ${
                    isActive ? 'text-primary font-medium' : 'text-foreground/70'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < checkoutSteps.length - 1 && (
                <div
                  className={`h-0.5 w-12 mx-2 transition-colors duration-300 ${
                    isComplete ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Steps */}
        <Card className="lg:col-span-2 p-6">
          <CardTitle className="text-2xl mb-4">
            {checkoutSteps.find((step) => step.id === currentStep)?.name}
          </CardTitle>
          <Separator className="mb-6" />

          {CurrentStepComponent && (
            <CurrentStepComponent
              data={checkoutData}
              setData={setCheckoutData}
              nextStep={() => setCurrentStep((prev) => Math.min(prev + 1, 3))}
              prevStep={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            />
          )}

          {/* Step 3: Review and Place Order */}
          {currentStep === 3 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Review and Place Order</h3>
              <p className="mb-6 text-foreground/70">
                By clicking “Place Order,” you agree to our Terms & Conditions.
              </p>

              <Button
                size="lg"
                className="w-full text-lg h-12"
                onClick={handlePlaceOrder}
                disabled={placeOrderMutation.isPending}
              >
                {placeOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order (Mock Payment)'
                )}
              </Button>
            </div>
          )}
        </Card>

        {/* Right Column: Summary */}
        <CheckoutSummaryCard
          cartTotal={cartTotal}
          shippingOption={checkoutData.shippingOption}
        />
      </div>
    </div>
  );
}

// Wrap checkout content with AuthGuard
export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageContent />
    </AuthGuard>
  );
}
