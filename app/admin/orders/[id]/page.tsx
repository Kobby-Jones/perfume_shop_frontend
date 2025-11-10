// app/admin/orders/[id]/page.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Package, 
    User, 
    MapPin, 
    CreditCard, 
    Calendar,
    Loader2,
    Edit2,
    Check,
    X
} from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlert } from '@/components/shared/ModalAlert';
import { useState } from 'react';
import Link from 'next/link';

interface OrderItem {
    id: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
}

interface OrderDetails {
    id: number;
    userId: number;
    status: string;
    paymentStatus: string;
    paymentRef: string | null;
    orderTotal: number;
    shippingCost: number;
    taxAmount: number;
    discountCode: string | null;
    discountAmount: number | null;
    shippingAddress: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        zip: string;
        country: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { alert } = useAlert();
    const orderId = parseInt(params.id as string);

    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    // Fetch order details
    const { data: order, isLoading, isError } = useQuery<OrderDetails>({
        queryKey: ['adminOrderDetail', orderId],
        queryFn: () => apiFetch(`/admin/orders/${orderId}`),
        enabled: !isNaN(orderId),
    });

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => 
            apiFetch(`/admin/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrderDetail', orderId] });
            queryClient.invalidateQueries({ queryKey: ['adminAllOrders'] });
            setIsEditingStatus(false);
            alert({ 
                title: 'Status Updated', 
                message: 'Order status has been successfully updated.', 
                variant: 'success' 
            });
        },
        onError: (error: any) => {
            alert({ 
                title: 'Update Failed', 
                message: error.message || 'Failed to update order status.', 
                variant: 'error' 
            });
        }
    });

    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-200 text-yellow-800';
            case 'Processing': return 'bg-purple-200 text-purple-800';
            case 'Shipped': return 'bg-blue-200 text-blue-800';
            case 'Delivered': return 'bg-green-200 text-green-800';
            case 'Cancelled': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusUpdate = () => {
        if (newStatus) {
            updateStatusMutation.mutate(newStatus);
        }
    };

    const startEditingStatus = () => {
        setNewStatus(order?.status || '');
        setIsEditingStatus(true);
    };

    const cancelEditingStatus = () => {
        setIsEditingStatus(false);
        setNewStatus('');
    };

    if (isNaN(orderId)) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Invalid Order ID</p>
                <Link href="/admin/orders">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Button>
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">Failed to load order details</p>
                <Link href="/admin/orders">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Button>
                </Link>
            </div>
        );
    }

    const subtotal = order.orderTotal - order.shippingCost - order.taxAmount + (order.discountAmount || 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Order #{order.id}</h1>
                        <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditingStatus ? (
                            <div className="space-y-2">
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ORDER_STATUSES.map(status => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        onClick={handleStatusUpdate}
                                        disabled={updateStatusMutation.isPending}
                                        className="flex-1"
                                    >
                                        {updateStatusMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-1" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={cancelEditingStatus}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                </Badge>
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={startEditingStatus}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500">Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                        </Badge>
                        {order.paymentRef && (
                            <p className="text-xs text-gray-500 mt-2">
                                Ref: {order.paymentRef}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500">Order Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-primary">
                            {formatGHS(order.orderTotal)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Order Items ({order.items.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex-1">
                                            <Link href={`/products/${item.productId}`}>
                                                <h4 className="font-medium hover:text-primary cursor-pointer">
                                                    {item.name}
                                                </h4>
                                            </Link>
                                            <p className="text-sm text-gray-500">
                                                {formatGHS(item.price)} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">
                                                {formatGHS(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatGHS(subtotal)}</span>
                                </div>
                                {order.discountCode && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount ({order.discountCode})</span>
                                        <span>-{formatGHS(order.discountAmount || 0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">{formatGHS(order.shippingCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{formatGHS(order.taxAmount)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span className="text-primary">{formatGHS(order.orderTotal)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Right Side */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="font-medium">{order.user.name}</p>
                                <p className="text-sm text-gray-500">{order.user.email}</p>
                            </div>
                            <Link href={`/admin/users?search=${order.userId}`}>
                                <Button variant="outline" size="sm" className="w-full mt-2">
                                    View Customer Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">
                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                </p>
                                <p className="text-gray-600">{order.shippingAddress.street}</p>
                                <p className="text-gray-600">
                                    {order.shippingAddress.city}, {order.shippingAddress.zip}
                                </p>
                                <p className="text-gray-600">{order.shippingAddress.country}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm">
                                <p className="font-medium text-gray-700">Order Placed</p>
                                <p className="text-gray-500">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-gray-700">Last Updated</p>
                                <p className="text-gray-500">
                                    {new Date(order.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}