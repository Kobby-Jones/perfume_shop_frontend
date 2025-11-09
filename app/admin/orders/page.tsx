// app/admin/orders/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Loader2, ArrowRight, Filter, Download } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminOrderSummary {
    id: number;
    date: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    total: number;
    itemCount: number;
    userId: number;
}

interface AdminOrdersRawResponse {
    orders: AdminOrderSummary[];
}

type AdminOrdersFinalData = AdminOrderSummary[];

const ALL_STATUSES = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const { data: allOrders = [], isLoading, isError } = useQuery<
        AdminOrdersRawResponse,
        Error,
        AdminOrdersFinalData
    >({
        queryKey: ['adminAllOrders'],
        queryFn: () => apiFetch('/admin/orders'),
        select: (data) => data.orders,
    });

    const filteredOrders = useMemo(() => {
        let results = allOrders;
        const term = searchTerm.toLowerCase();

        if (statusFilter !== 'All') {
            results = results.filter(o => o.status === statusFilter);
        }

        if (searchTerm) {
            results = results.filter(o => 
                o.id.toString().includes(term) ||
                o.userId.toString().includes(term) ||
                o.status.toLowerCase().includes(term)
            );
        }
        return results;
    }, [allOrders, searchTerm, statusFilter]);

    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    const getStatusColor = (status: AdminOrderSummary['status']) => {
        switch (status) {
            case 'Processing': return 'bg-yellow-200 text-yellow-800';
            case 'Shipped': return 'bg-blue-200 text-blue-800';
            case 'Delivered': return 'bg-green-200 text-green-800';
            case 'Cancelled': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
    
    if (isError) return <div className="text-red-500 p-4">Failed to load order data.</div>;
    
    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
                    <span>Orders <span className="text-base md:text-xl">({filteredOrders.length})</span></span>
                </h1>
                <Button variant="outline" size="sm" className="self-start sm:self-auto">
                    <Download className="w-4 h-4 mr-2" />Export
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
                <Input 
                    placeholder="Search by Order ID or User ID..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {ALL_STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s} Orders</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                        No orders found matching filters.
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg">Order #{order.id}</p>
                                    <p className="text-sm text-gray-500">User ID: {order.userId}</p>
                                </div>
                                <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Date</p>
                                    <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Items</p>
                                    <p className="font-medium">{order.itemCount}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2 border-t">
                                <p className="text-lg font-bold text-primary">{formatGHS(order.total)}</p>
                                <Button variant="ghost" size="sm" className="text-blue-500">
                                    View <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Order ID', 'User ID', 'Date', 'Total (GHS)', 'Items', 'Status', 'Actions'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-6 text-gray-500">No orders found matching filters.</td></tr>
                        )}
                        {filteredOrders.map((o) => (
                            <tr key={o.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.userId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{formatGHS(o.total)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.itemCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge className={getStatusColor(o.status)}>{o.status}</Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Button variant="ghost" size="sm" className="text-blue-500">
                                        View <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}