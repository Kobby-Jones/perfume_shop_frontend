// components/checkout/PaystackForm.tsx

'use client';

import { usePaystack } from '@/lib/hooks/usePaystack';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface PaystackFormProps {
    amount: number; // Amount in kobo/cents
    email: string;
    reference: string; // Use the reference from backend
    onSuccess: (reference: string) => void;
    currency?: string;
}

export function PaystackForm({ amount, email, reference, onSuccess }: PaystackFormProps) {
    const { initializePayment, scriptLoaded } = usePaystack();
    const [isProcessing, setIsProcessing] = useState(false);

    const displayAmount = (Number(amount) / 100).toFixed(2);

    const handleSuccess = (paystackReference: any) => {
        setIsProcessing(false);
        // Pass the reference back to verify
        onSuccess(paystackReference.reference || reference);
    };

    const handleClose = () => {
        setIsProcessing(false);
        toast.info('Payment cancelled. You can try again when ready.');
    };

    const startPayment = () => {
        console.log('Starting payment with:', { amount, email, reference, scriptLoaded });

        if (!scriptLoaded) {
            toast.error("Payment system is loading. Please wait a moment.");
            return;
        }

        if (amount <= 0) {
            toast.error("Invalid payment amount.");
            console.error('Invalid amount:', amount);
            return;
        }
        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        if (!publicKey) {
            toast.error("Payment configuration error. Please contact support.");
            console.error('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set');
            return;
        }
        
        setIsProcessing(true);
        toast.info("Opening secure payment gateway...");
        
        const config = {
            publicKey,
            email,
            amount,
            reference,
            onSuccess: handleSuccess,
            onClose: handleClose,
            currency: 'GHS',
        };

        console.log('Initializing payment with config:', config);
        initializePayment(config);
    };

    const buttonDisabled = isProcessing || !scriptLoaded || amount <= 0;

    return (
        <Button 
            type="button"
            className="w-full text-lg h-12 bg-green-600 hover:bg-green-700" 
            onClick={startPayment}
            disabled={buttonDisabled}
        >
            {isProcessing ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                    Opening Payment Gateway...
                </>
            ) : (
                <>
                    <Zap className="mr-2 h-5 w-5" /> 
                    Pay GHS{displayAmount} Now
                </>
            )}
        </Button>
    );
}