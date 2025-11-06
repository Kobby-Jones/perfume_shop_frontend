// app/account/(protected)/orders/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Truck, Calendar, DollarSign, Frown } from 'lucide-react';

import { AccountLayout } from '@/components/account/AccountLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api/httpClient';
import { cn } from '@/lib/utils';

// Define the Order Detail type expected from the backend
interface OrderDetail {
    id: number;
    date: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    items: { product: { name: string, price: number }, quantity: number, subtotal: number }[];
    shippingAddress: { street: string, city: string, zip: string, country: string };
    shippingCost: number;
    tax: number;
    total: number;
}

/**
 * Renders the detailed view of a single order.
 */
export default function OrderDetailPage() {
    const params = useParams();
    const orderId = parseInt(params.id as string);

    // CRITICAL: Format Currency to GHS
    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    // Fetch order details
    const { data: order, isLoading, isError } = useQuery<OrderDetail>({
        queryKey: ['order', orderId],
        queryFn: () => apiFetch(`/account/orders/${orderId}`), // GET /api/account/orders/:id
        enabled: !isNaN(orderId),
    });

    if (isLoading) {
        return <AccountLayout><div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div></AccountLayout>;
    }
    
    if (isError || !order) {
        return (
            <AccountLayout>
                <div className="text-center py-10 text-red-600">
                    <Frown className="w-8 h-8 mx-auto mb-3" />
                    <p className="text-xl font-semibold">Order #{orderId} Not Found</p>
                    <p className="text-foreground/70">The order ID is invalid or access is denied.</p>
                </div>
            </AccountLayout>
        );
    }
    
    // --- Render Logic ---
    const statusColor = order.status === 'Delivered' ? 'text-green-600' : order.status === 'Cancelled' ? 'text-red-600' : 'text-accent';

    return (
        <AccountLayout>
            <h2 className="text-3xl font-bold mb-6">Order #{order.id} Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Order Status Card */}
                <Card className="md:col-span-1 border-l-4 border-primary">
                    <CardHeader>
                        <CardTitle className={cn("text-2xl font-extrabold", statusColor)}>
                            {order.status}
                        </CardTitle>
                        <CardDescription className="text-sm">Current Order Status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-2" /> Placed: {new Date(order.date).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>

                {/* Shipping Address Card */}
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle className="text-lg">Shipping Address</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                        <p>{order.shippingAddress.country}</p>
                    </CardContent>
                </Card>

                {/* Financial Summary Card */}
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle className="text-lg">Order Total</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p>Subtotal: {formatGHS(order.total - order.shippingCost - order.tax)}</p>
                        <p>Shipping: {formatGHS(order.shippingCost)}</p>
                        <p>Tax: {formatGHS(order.tax)}</p>
                        <Separator className="my-2" />
                        <p className="text-xl font-bold text-primary">Total: {formatGHS(order.total)}</p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Itemized List */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Items Ordered ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center border-b pb-3">
                                <div className="flex flex-col">
                                    <span className="font-semibold">{item.product.name}</span>
                                    <span className="text-sm text-foreground/70">{formatGHS(item.product.price)} x {item.quantity}</span>
                                </div>
                                <span className="font-bold">{formatGHS(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end mt-6 space-x-3">
                <Button variant="outline">Print Invoice</Button>
                {order.status === 'Delivered' && (
                    <Button>Leave Feedback</Button>
                )}
            </div>
        </AccountLayout>
    );
}