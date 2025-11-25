// app/checkout/verify/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/httpClient';

export default function VerifyPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [orderId, setOrderId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            const reference = searchParams.get('reference');
            const orderIdFromStorage = localStorage.getItem('currentOrderId');

            if (!reference || !orderIdFromStorage) {
                setStatus('error');
                setErrorMessage('Missing payment reference or order ID.');
                return;
            }

            try {
                const response = await apiFetch('/checkout/paystack-verify', {
                    method: 'POST',
                    body: JSON.stringify({
                        reference,
                        orderId: parseInt(orderIdFromStorage),
                    }),
                });

                setOrderId(response.order.id);
                setStatus('success');
                localStorage.removeItem('currentOrderId'); // Clean up

                // Redirect to order details after 3 seconds
                setTimeout(() => {
                    router.push(`/account/orders/${response.order.id}`);
                }, 3000);

            } catch (error: any) {
                setStatus('error');
                setErrorMessage(error.message || 'Payment verification failed.');
            }
        };

        verifyPayment();
    }, [searchParams, router]);

    if (status === 'verifying') {
        return (
            <div className="container min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                    <h1 className="text-2xl font-bold">Verifying Payment...</h1>
                    <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="container min-h-screen flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
                    <p className="text-muted-foreground">
                        Your order has been confirmed and is being processed.
                    </p>
                    {orderId && (
                        <p className="text-sm text-muted-foreground">
                            Order ID: <strong>#{orderId}</strong>
                        </p>
                    )}
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Redirecting to order details...
                        </p>
                        <Button asChild className="w-full">
                            <Link href={`/account/orders/${orderId}`}>
                                View Order Details
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container min-h-screen flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-red-600">Payment Verification Failed</h1>
                <p className="text-muted-foreground">{errorMessage}</p>
                <div className="space-y-2">
                    <Button asChild className="w-full">
                        <Link href="/account/orders">View Orders</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}