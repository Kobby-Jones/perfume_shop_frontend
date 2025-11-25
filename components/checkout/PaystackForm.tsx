// components/checkout/PaystackForm.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Zap, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface PaystackFormProps {
    amount: number; 
    email: string;
    accessCode?: string;
    reference?: string;
    authorizationUrl?: string;
    onSuccess: (reference: string) => void;
}

export function PaystackForm({ amount, email, accessCode, reference, authorizationUrl, onSuccess }: PaystackFormProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const startPayment = () => {
        if (!authorizationUrl) {
            toast.error('Payment link not ready. Please try again.');
            return;
        }

        console.log('🚀 Redirecting to Paystack:', authorizationUrl);
        
        // Redirect to Paystack checkout page
        window.location.href = authorizationUrl;
    };

    return (
        <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                <strong>Action Required:</strong> Click the button below to complete your secure payment.
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
                <p>You will be redirected to Paystack's secure payment page.</p>
            </div>

            <Button 
                type="button"
                className="w-full text-lg h-12 bg-green-600 hover:bg-green-700 shadow-md transition-all" 
                onClick={startPayment}
                disabled={isProcessing || !authorizationUrl}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                        Processing...
                    </>
                ) : (
                    <>
                        <Zap className="mr-2 h-5 w-5" /> 
                        Pay GHS {(amount / 100).toFixed(2)} Now
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
                Order #{reference} • Secured by Paystack
            </p>
        </div>
    );
}