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
import { useRouter } from 'next/navigation';

// Define the precise structure expected from the backend
interface AdminOrderSummary {
    id: number;
    createdAt: string; // From Prisma
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    orderTotal: number;
    itemCount: number;
    user?: { 
        id: number; 
        email: string; 
        name: string; 
    };
}

interface AdminOrdersRawResponse {
    orders: AdminOrderSummary[];
}

type AdminOrdersFinalData = AdminOrderSummary[];

const ALL_STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Fetch Orders (GET /api/admin/orders)
    const { data: allOrders = [], isLoading, isError } = useQuery<
        AdminOrdersRawResponse,
        Error,
        AdminOrdersFinalData
    >({
        queryKey: ['adminAllOrders'],
        queryFn: async () => {
            try {
                const response = await apiFetch('/admin/orders');
                
                // Validate response structure
                if (!response || !response.orders) {
                    console.error('Invalid API response:', response);
                    return { orders: [] };
                }
                
                return response;
            } catch (error) {
                console.error('Failed to fetch orders:', error);
                return { orders: [] };
            }
        },
        select: (data) => data.orders || [],
        staleTime: 1000 * 30, // Frequent checks for new orders
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
                o.user?.email?.toLowerCase().includes(term) ||
                o.user?.name?.toLowerCase().includes(term)
            );
        }
        return results;
    }, [allOrders, searchTerm, statusFilter]);

    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    const getStatusColor = (status: AdminOrderSummary['status']) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-200 text-yellow-800';
            case 'Processing': return 'bg-purple-200 text-purple-800';
            case 'Shipped': return 'bg-blue-200 text-blue-800';
            case 'Delivered': return 'bg-green-200 text-green-800';
            case 'Cancelled': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    const handleViewOrder = (orderId: number) => {
        router.push(`/admin/orders/${orderId}`);
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
                    placeholder="Search by Order ID, User Name, or Email..." 
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

            {/* Desktop Table View */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Order ID', 'Customer', 'Date', 'Total (GHS)', 'Items', 'Status', 'Actions'].map(header => (
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{o.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <p className='font-medium text-gray-900'>{o.user?.name || 'Unknown User'}</p>
                                    <p className='text-xs text-gray-500'>{o.user?.email || 'No email'}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{formatGHS(o.orderTotal)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.itemCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge className={getStatusColor(o.status)}>{o.status}</Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {/* <Button variant="ghost" size="sm" className="text-blue-500">
                                        View <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button> */}
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-blue-500"
                                        onClick={() => handleViewOrder(o.id)}
                                    >
                                        View <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                    {/* TODO: Add logic to update order status here */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}