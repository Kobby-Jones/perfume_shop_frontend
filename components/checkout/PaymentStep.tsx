// components/checkout/PaymentStep.tsx

import Image from 'next/image';
import { CreditCard, Lock, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * Checkout Step 3: Payment Selection and Mock Paystack UI.
 * This provides a production-ready UI for payment integration.
 */
export function PaymentStep({ prevStep }: { prevStep: () => void }) {
  
  // NOTE: In a real integration, clicking the final "Place Order" button 
  // (located in the main page.tsx) would trigger the Paystack initialization.

  return (
    <div className="space-y-8">
      
      {/* Payment Gateway Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-xl font-semibold">Select Payment Method</h3>
        <p className="text-xs text-green-600 flex items-center">
            <Lock className="w-3 h-3 mr-1" /> Secured by SSL
        </p>
      </div>

      {/* Mock Paystack Payment Form UI */}
      <div className="border-2 border-primary/50 rounded-lg p-6 space-y-4 bg-primary/5 shadow-lg">
        <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg text-foreground">Pay with Card or Bank Transfer</h4>
            {/* Mock Paystack Logo - Assume logo is in /public/images/paystack.png */}
            <Zap className="w-6 h-6 text-green-500" />
        </div>
        
        <Separator />
        
        <p className="text-sm text-foreground/70 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Your payment will be processed securely via **Paystack**.
        </p>

        {/* Input Fields Placeholder (Not functional, just UI) */}
        <div className="space-y-3">
            <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary transition-colors"
                defaultValue="test@example.com"
            />
            <input 
                type="tel" 
                placeholder="Phone Number" 
                className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary transition-colors"
                defaultValue="0244556677"
            />
            
            <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="saveCard" className="text-primary focus:ring-primary" />
                <label htmlFor="saveCard" className="text-sm text-foreground/70">Save card for future payments</label>
            </div>
        </div>
      </div>
      
      {/* Other Payment Options (Stripe/Paypal mock) */}
      <div className="space-y-4">
        <div className="border p-4 rounded-lg text-foreground/50">
            <p className="font-semibold">PayPal / Stripe (Integration Ready)</p>
            <p className="text-xs">These options are available for future backend integration.</p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          Back to Shipping
        </Button>
        {/* The "Place Order" button is in the main CheckoutPage component */}
      </div>
    </div>
  );
}