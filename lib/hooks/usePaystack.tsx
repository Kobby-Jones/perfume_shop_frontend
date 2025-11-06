// lib/hooks/usePaystack.ts

import { useEffect, useState } from 'react';

interface PaystackConfig {
    publicKey: string;
    email: string;
    amount: number;
    reference: string;
    currency?: string; // Add currency support
    onSuccess: (reference: any) => void;
    onClose: () => void;
    metadata?: any;
}

declare global {
    interface Window {
        PaystackPop: {
            setup: (config: any) => {
                openIframe: () => void;
            };
        };
    }
}

export function usePaystack() {
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Check if Paystack script is already loaded
        if (window.PaystackPop) {
            setScriptLoaded(true);
            return;
        }

        // Load Paystack inline script
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        
        script.onload = () => {
            console.log('Paystack script loaded successfully');
            setScriptLoaded(true);
        };
        
        script.onerror = () => {
            console.error('Failed to load Paystack script');
            setScriptLoaded(false);
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup: remove script when component unmounts
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    const initializePayment = (config: PaystackConfig) => {
        if (!window.PaystackPop) {
            console.error('Paystack script not loaded');
            return;
        }

        if (!config.publicKey) {
            console.error('Paystack public key is missing');
            return;
        }

        console.log('Initializing Paystack payment:', {
            email: config.email,
            amount: config.amount,
            reference: config.reference,
        });

        try {
            const handler = window.PaystackPop.setup({
                key: config.publicKey,
                email: config.email,
                amount: config.amount,
                currency: config.currency || 'GHS',
                ref: config.reference,
                metadata: config.metadata || {},
                callback: function(response: any) {
                    console.log('Paystack payment successful:', response);
                    config.onSuccess(response);
                },
                onClose: function() {
                    console.log('Paystack popup closed');
                    config.onClose();
                },
            });
            

            handler.openIframe();
        } catch (error) {
            console.error('Error initializing Paystack:', error);
        }
    };

    return {
        scriptLoaded,
        initializePayment,
    };
}