// lib/hooks/usePaystack.tsx

import { useEffect, useState } from 'react';

interface PaystackConfig {
    accessCode?: string;
    onSuccess: (reference: any) => void;
    onClose: () => void;
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
        if (window.PaystackPop) {
            setScriptLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => setScriptLoaded(false);
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, []);

    const initializePayment = (config: PaystackConfig) => {
        if (!window.PaystackPop) {
            console.error('Paystack script not loaded');
            return;
        }

        if (!config.accessCode) {
            console.error('Missing accessCode');
            return;
        }

        console.log('🎫 Initializing Paystack with accessCode:', config.accessCode);

        const paystackConfig = {
            access_code: config.accessCode,
            onClose: config.onClose,
            callback: (response: any) => {
                console.log('✅ Payment successful:', response);
                config.onSuccess(response);
            },
        };

        console.log('📤 Paystack config:', paystackConfig);

        try {
            const handler = window.PaystackPop.setup(paystackConfig);
            handler.openIframe();
        } catch (error) {
            console.error('❌ Paystack initialization error:', error);
        }
    };

    return { scriptLoaded, initializePayment };
}