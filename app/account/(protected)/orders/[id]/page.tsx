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

// Define the Order Detail type to match actual backend response
interface OrderItem {
    product: {
        name: string;
        price: number;
    };
    quantity: number;
    subtotal: number;
}

interface ShippingAddress {
    street: string;
    city: string;
    zip: string;
    country: string;
    firstName: string;
    lastName: string;
}

interface OrderDetail {
    id: number;
    date: string; // Backend uses 'date' not 'createdAt'
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending';
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    shippingCost: number;
    tax: number; // Backend uses 'tax' not 'taxAmount'
    total: number; // Backend uses 'total' not 'orderTotal'
    paymentStatus?: 'pending' | 'success' | 'failed'; // Optional since backend might not return it
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

    const formatGHS = (amount: number) => {
        if (isNaN(amount) || amount === null || amount === undefined) {
            return 'GH₵0.00';
        }
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
    };

    // Fetch order details
    const { data: order, isLoading, isError } = useQuery<OrderDetail>({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const data = await apiFetch(`/account/orders/${orderId}`);
            console.log('Fetched order data:', data);
            return data;
        },
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
    
    // --- Data Processing ---
    const { icon: StatusIcon, color: statusColorClass, badgeColor } = getStatusProps(order.status);

    // Use the correct field names from backend
    const orderTotal = order.total || 0;
    const shippingCost = order.shippingCost || 0;
    const taxAmount = order.tax || 0;
    const subtotal = orderTotal - shippingCost - taxAmount;
    
    const shippingAddress = order.shippingAddress;
    
    // Payment status might not be in the response, default to pending
    const isPaymentSuccess = order.paymentStatus === 'success';

    // Safe date formatting
    const formatDate = (date: string): string => {
        try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                return 'Date unavailable';
            }
            return dateObj.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'Date unavailable';
        }
    };

    // Calculate tax percentage safely
    const taxPercentage = (subtotal + shippingCost) > 0 
        ? ((taxAmount / (subtotal + shippingCost)) * 100).toFixed(1)
        : '0';

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
                        {order.paymentStatus && (
                            <CardDescription className="text-sm">
                                Payment: 
                                <span className={cn(
                                    "font-semibold ml-1",
                                    isPaymentSuccess ? "text-green-700" : "text-red-700"
                                )}>
                                    {isPaymentSuccess ? 'Confirmed' : 'Pending/Failed'}
                                </span>
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-2" /> Placed: {formatDate(order.date)}
                        </p>
                    </CardContent>
                </Card>

                {/* Shipping Address Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="w-4 h-4"/>Shipping Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p className="font-semibold">
                            {shippingAddress.firstName} {shippingAddress.lastName}
                        </p>
                        <p>{shippingAddress.street}</p>
                        <p>{shippingAddress.city}{shippingAddress.zip ? `, ${shippingAddress.zip}` : ''}</p>
                        <p>{shippingAddress.country}</p>
                    </CardContent>
                </Card>

                {/* Financial Summary Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="w-4 h-4"/>Order Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <p>Subtotal:</p>
                            <p>{formatGHS(subtotal)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Shipping:</p>
                            <p>{formatGHS(shippingCost)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Tax ({taxPercentage}%):</p>
                            <p>{formatGHS(taxAmount)}</p>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-xl font-bold text-primary">
                            <p>Total:</p>
                            <p>{formatGHS(orderTotal)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Itemized List */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Items Ordered ({order.items?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.items && order.items.length > 0 ? (
                        <div className="space-y-4">
                            {order.items.map((item, index) => {
                                const itemPrice = item.product.price || 0;
                                const itemQuantity = item.quantity || 0;
                                const itemTotal = item.subtotal || (itemPrice * itemQuantity);
                                
                                return (
                                    <div key={index} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{item.product.name || 'Unnamed Item'}</span>
                                            <span className="text-sm text-foreground/70">
                                                {formatGHS(itemPrice)} x {itemQuantity}
                                            </span>
                                        </div>
                                        <span className="font-bold">{formatGHS(itemTotal)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-foreground/70 py-4">No items found</p>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end mt-6 space-x-3">
                <Button variant="outline">Print Invoice</Button>
                {order.status === 'Delivered' && order.items && order.items.length > 0 && (
                    <Link href={`/product/${order.items[0].product.name}`}>
                        <Button>Leave Feedback</Button>
                    </Link>
                )}
            </div>
        </>
    );
}