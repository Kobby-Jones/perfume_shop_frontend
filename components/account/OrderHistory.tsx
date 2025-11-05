// components/account/OrderHistory.tsx

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, Clock, Loader2, Frown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/api/httpClient'; // Import API client
import { ProductGridSkeleton } from '../product/ProductListingSkeletons'; // Reusing skeleton

/**
 * Interface for the Order Summary data expected from the backend
 */
interface OrderSummary {
    id: number;
    date: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    total: number;
    itemCount: number;
}

/**
 * Maps backend status to frontend display properties.
 */
const getStatusProps = (status: OrderSummary['status']) => {
    switch (status) {
        case 'Processing':
            return { icon: Clock, color: 'bg-accent/20 text-accent-foreground' };
        case 'Shipped':
            return { icon: Truck, color: 'bg-blue-100 text-blue-800' };
        case 'Delivered':
            return { icon: CheckCircle, color: 'bg-green-100 text-green-800' };
        default:
            return { icon: Frown, color: 'bg-gray-100 text-gray-800' };
    }
};

/**
 * Renders the user's list of past orders, fetched via API.
 */
export function OrderHistoryList() {
    // Fetch orders using TanStack Query
    const { data, isLoading, isError, error } = useQuery<{ orders: OrderSummary[] }>({
        queryKey: ['orders'],
        queryFn: () => apiFetch('/account/orders'), // GET /api/account/orders
        staleTime: 1000 * 60 * 5, // Orders don't change often
    });

    const orders = data?.orders || [];
    const hasOrders = orders.length > 0;
    
    if (isLoading) {
        return <ProductGridSkeleton count={3} />;
    }

    if (isError) {
        return (
            <div className="text-center py-10 text-red-600 border rounded-lg p-6">
                <p>Failed to load order history. You may need to log in again.</p>
                <p className="text-sm mt-2 text-red-400">Error: {error.message}</p>
            </div>
        );
    }
    
    if (!hasOrders) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg p-6 text-foreground/70">
                <Frown className="w-8 h-8 mx-auto mb-3" />
                <p className="text-lg font-semibold">No orders found.</p>
                <Link href="/shop"><Button variant="link">Start your first order.</Button></Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-2">Your Orders ({orders.length})</h2>
            
            {orders.map((order) => {
                const { icon: Icon, color } = getStatusProps(order.status);
                
                return (
                    <Card key={order.id} className="shadow-md transition-shadow duration-300 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                            <div className="flex flex-col">
                                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                <p className="text-sm text-foreground/70">Placed on {order.date}</p>
                            </div>
                            <Badge className={`text-sm font-semibold flex items-center ${color}`}>
                                <Icon className="w-3 h-3 mr-1" />
                                {order.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center p-4">
                            <p className="text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
                            <Link href={`/account/orders/${order.id}`}>
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}