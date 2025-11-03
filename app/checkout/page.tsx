// app/checkout/page.tsx

'use client';

import { useState } from 'react';
import { Truck, MapPin, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { useCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckoutSummaryCard } from '@/components/checkout/CheckoutSummaryCard';
import { AddressStep } from '@/components/checkout/AddressStep'; 
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';

// Define the structure of the overall checkout state for type safety
interface CheckoutData {
    address: any | null; // Placeholder for the validated address object
    shippingOption: 'standard' | 'express'; // Crucial: use the literal union type
}

// Define the steps of the checkout process
const checkoutSteps = [
  { id: 1, name: 'Shipping Address', icon: MapPin, component: AddressStep },
  { id: 2, name: 'Shipping Options', icon: Truck, component: ShippingStep },
  { id: 3, name: 'Payment & Review', icon: CreditCard, component: PaymentStep },
];

/**
 * Renders the main multi-step Checkout Page.
 * Manages the step state and displays the order summary card.
 */
export default function CheckoutPage() {
  const { cartDetails, cartTotal, isLoading } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the explicit CheckoutData interface for the state.
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    address: null, 
    // Ensure the initial value is explicitly one of the union members
    shippingOption: 'standard', 
});

  const cartIsEmpty = cartDetails.length === 0;

  // Render a simple loading/empty state
  if (isLoading) return <div className="container py-20 text-center"><p>Loading cart...</p></div>;
  if (cartIsEmpty) {
    return (
      <div className="container py-20 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Checkout Complete! (Mock)</h1>
        <p className="text-lg text-foreground/70 mb-6">Your cart is empty. You can now visit your order history.</p>
        <Link href="/shop">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  // Find the current component to render
  const CurrentStepComponent = checkoutSteps.find(step => step.id === currentStep)?.component;

  /**
   * Mock function to simulate the final order submission.
   * In a real app, this would call a server-side endpoint.
   */
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate network delay and payment processing
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    setIsProcessing(false);
    
    // NOTE: On success, you would clear the cart and redirect to the confirmation page.
    console.log("Order Placed:", checkoutData);

    // Transition to a success state/page (for now, just empties cart and shows message)
    setCurrentStep(4); 
  };


  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

      {/* Progress Tracker (Mobile-first, horizontal) */}
      <div className="flex justify-between items-center mb-10 text-sm md:text-base overflow-x-auto whitespace-nowrap">
        {checkoutSteps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors duration-300 ${
                  isComplete ? 'bg-primary text-primary-foreground' : 
                  isActive ? 'bg-accent text-accent-foreground' : 
                  'bg-secondary text-foreground/70 border border-border'
                }`}>
                  {isComplete ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <span className={`mt-1 text-xs md:text-sm ${isActive ? 'text-primary font-medium' : 'text-foreground/70'}`}>
                  {step.name}
                </span>
              </div>
              {/* Separator Line */}
              {index < checkoutSteps.length - 1 && (
                <div className={`h-0.5 w-12 mx-2 transition-colors duration-300 ${isComplete ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Steps */}
        <Card className="lg:col-span-2 p-6">
          <CardTitle className="text-2xl mb-4">{checkoutSteps.find(step => step.id === currentStep)?.name}</CardTitle>
          <Separator className="mb-6" />

          {/* Render the current step component */}
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={checkoutData}
              setData={setCheckoutData}
              nextStep={() => setCurrentStep(prev => Math.min(prev + 1, 3))}
              prevStep={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            />
          )}

          {/* Step 4 (Order Review/Final Submission) */}
          {currentStep === 3 && (
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Review and Place Order</h3>
                <p className="mb-6 text-foreground/70">By clicking "Place Order," you agree to our Terms & Conditions.</p>

                <Button 
                    size="lg" 
                    className="w-full text-lg h-12" 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing Payment...
                        </>
                    ) : (
                        'Place Order (Mock)'
                    )}
                </Button>
            </div>
          )}

        </Card>

        {/* Right Column: Order Summary */}
        <CheckoutSummaryCard 
            cartTotal={cartTotal} 
            shippingOption={checkoutData.shippingOption}
        />
      </div>
    </div>
  );
}