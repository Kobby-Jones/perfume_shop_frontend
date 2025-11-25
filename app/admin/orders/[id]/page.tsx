// app/admin/orders/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, User, MapPin, Truck, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';
import { Loader2 } from 'lucide-react';

interface OrderDetail {
    id: number;
    createdAt: string;
    status: string;
    paymentStatus: string;
    orderTotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number | null;
    shippingAddress: any;
    user: {
        name: string;
        email: string;
    };
    items: Array<{
        id: number;
        name: string;
        price: number;
        quantity: number;
    }>;
}

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { alert } = useAlert();

    // Fetch Order Details
    const { data: order, isLoading, isError } = useQuery<OrderDetail>({
        queryKey: ['adminOrder', id],
        queryFn: () => apiFetch(`/admin/orders/${id}`),
    });

    // Update Status Mutation
    const statusMutation = useMutation({
        mutationFn: (newStatus: string) => 
            apiFetch(`/admin/orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminOrder', id] });
            queryClient.invalidateQueries({ queryKey: ['adminAllOrders'] }); // Refresh list too
            alert({ title: "Status Updated", message: `Order is now ${data.order.status}`, variant: 'success' });
        },
        onError: (err: any) => {
            alert({ title: "Update Failed", message: err.message, variant: 'error' });
        }
    });

    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (isError || !order) return <div className="p-8 text-red-500">Order not found or failed to load.</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Order #{order.id}
                            <Badge variant="outline" className="ml-2">{order.paymentStatus.toUpperCase()}</Badge>
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Status Control */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
                    <span className="text-sm font-medium text-gray-600 pl-2">Status:</span>
                    <Select 
                        defaultValue={order.status} 
                        onValueChange={(val) => statusMutation.mutate(val)}
                        disabled={statusMutation.isPending}
                    >
                        <SelectTrigger className="w-[180px] h-9 border-none bg-gray-50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    {statusMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" /> Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center border-b last:border-0 pb-4 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                                                Img
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatGHS(item.price)}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold">{formatGHS(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{formatGHS(order.orderTotal - order.shippingCost - order.taxAmount + (order.discountAmount || 0))}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Shipping</span>
                                    <span>{formatGHS(order.shippingCost)}</span>
                                </div>
                                {order.discountAmount && order.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatGHS(order.discountAmount)}</span>
                                    </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatGHS(order.orderTotal)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Customer & Shipping */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="w-4 h-4" /> Customer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p className="font-medium">{order.user.name}</p>
                            <p className="text-gray-500">{order.user.email}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="w-4 h-4" /> Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1 text-gray-600">
                            <p className="font-medium text-gray-900">
                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                            </p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.zip}</p>
                            <p>{order.shippingAddress?.country}</p>
                            <p className="mt-2 flex items-center gap-1 text-primary">
                                <Truck className="w-3 h-3" /> {order.shippingCost > 0 ? 'Standard Delivery' : 'Free Delivery'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}