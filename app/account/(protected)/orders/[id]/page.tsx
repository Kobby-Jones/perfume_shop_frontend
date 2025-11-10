// app/account/(protected)/orders/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Truck, Calendar, DollarSign, Frown, Package, XCircle, CheckCircle, Clock, MapPin } from 'lucide-react';

import { AccountLayout } from '@/components/account/AccountLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api/httpClient';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Define the Order Detail type expected from the backend
interface OrderDetail {
    id: number;
    createdAt: string; // Use createdAt from Prisma
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending';
    paymentStatus: 'pending' | 'success' | 'failed';
    items: { productId: number; name: string; price: number; quantity: number }[];
    shippingAddress: { street: string, city: string, zip: string, country: string };
    shippingCost: number;
    taxAmount: number; // Matches the backend schema
    orderTotal: number; // Matches the backend schema
}

/**
 * Maps backend status to frontend display properties.
 */
const getStatusProps = (status: OrderDetail['status']) => {
    switch (status) {
        case 'Pending':
            return { icon: Calendar, color: 'text-yellow-600', badgeColor: 'border-yellow-200 bg-yellow-50' };
        case 'Processing':
            return { icon: Clock, color: 'text-primary', badgeColor: 'border-primary/20 bg-primary/5' };
        case 'Shipped':
            return { icon: Truck, color: 'text-blue-600', badgeColor: 'border-blue-200 bg-blue-50' };
        case 'Delivered':
            return { icon: CheckCircle, color: 'text-green-600', badgeColor: 'border-green-200 bg-green-50' };
        case 'Cancelled':
            return { icon: XCircle, color: 'text-red-600', badgeColor: 'border-red-200 bg-red-50' };
        default:
            return { icon: Frown, color: 'text-gray-600', badgeColor: 'border-gray-200 bg-gray-50' };
    }
};


/**
 * Renders the detailed view of a single order.
 */
export default function OrderDetailPage() {
    const params = useParams();
    const orderId = parseInt(params.id as string);

    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    // Fetch order details
    const { data: order, isLoading, isError } = useQuery<OrderDetail>({
        queryKey: ['order', orderId],
        queryFn: () => apiFetch(`/account/orders/${orderId}`), // GET /api/account/orders/:id
        enabled: !isNaN(orderId),
    });

    if (isLoading) {
        return (
            <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
        );
    }
    
    if (isError || !order) {
        return (
                <div className="text-center py-10 text-red-600">
                    <Frown className="w-8 h-8 mx-auto mb-3" />
                    <p className="text-xl font-semibold">Order #{orderId} Not Found</p>
                    <p className="text-foreground/70">The order ID is invalid or access is denied.</p>
                </div>
        );
    }
    
    // --- Render Logic ---
    const { icon: StatusIcon, color: statusColorClass, badgeColor } = getStatusProps(order.status);

    const subtotal = order.orderTotal - order.shippingCost - order.taxAmount;
    
    // Convert JSON shipping address back to object structure
    const shippingAddress = order.shippingAddress as { 
        street: string; 
        city: string; 
        zip: string; 
        country: string;
        firstName: string;
        lastName: string;
    };
    
    const isPaymentSuccess = order.paymentStatus === 'success';

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Order #{order.id} Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Order Status Card */}
                <Card className={cn("md:col-span-1 border-l-4 border-primary", badgeColor)}>
                    <CardHeader>
                        <CardTitle className={cn("text-2xl font-extrabold", statusColorClass)}>
                            <StatusIcon className="w-6 h-6 inline mr-2"/>
                            {order.status}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Payment: 
                            <span className={cn(
                                "font-semibold ml-1",
                                isPaymentSuccess ? "text-green-700" : "text-red-700"
                            )}>
                                {isPaymentSuccess ? 'Confirmed' : 'Pending/Failed'}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-2" /> Placed: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>

                {/* Shipping Address Card */}
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-4 h-4"/>Shipping Address</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p className="font-semibold">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                        <p>{shippingAddress.street}</p>
                        <p>{shippingAddress.city}, {shippingAddress.zip}</p>
                        <p>{shippingAddress.country}</p>
                    </CardContent>
                </Card>

                {/* Financial Summary Card */}
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-4 h-4"/>Order Total</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <p>Subtotal:</p>
                            <p>{formatGHS(subtotal)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Shipping:</p>
                            <p>{formatGHS(order.shippingCost)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Tax ({order.taxAmount / (subtotal + order.shippingCost) * 100}%):</p>
                            <p>{formatGHS(order.taxAmount)}</p>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-xl font-bold text-primary">
                            <p>Total:</p>
                            <p>{formatGHS(order.orderTotal)}</p>
                        </div>
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
                            // The backend returns an array of OrderItem, which includes name, price, quantity
                            <div key={index} className="flex justify-between items-center border-b pb-3">
                                <div className="flex flex-col">
                                    <span className="font-semibold">{item.name}</span>
                                    <span className="text-sm text-foreground/70">{formatGHS(item.price)} x {item.quantity}</span>
                                </div>
                                <span className="font-bold">{formatGHS(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end mt-6 space-x-3">
                <Button variant="outline">Print Invoice</Button>
                {order.status === 'Delivered' && (
                    <Link href={`/product/${order.items[0].productId}`}><Button>Leave Feedback</Button></Link>
                )}
            </div>
        </>
    );
}