'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Loader2, ArrowRight, Frown, Filter } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the Order Summary data expected from the backend
interface AdminOrderSummary {
    id: number;
    date: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    total: number;
    itemCount: number;
    userId: number;
}

// Define the RAW data type received directly from the API (TQueryFnData)
interface AdminOrdersRawResponse {
    orders: AdminOrderSummary[];
}

// Define the FINAL transformed data type used by the component (TData)
type AdminOrdersFinalData = AdminOrderSummary[];


const ALL_STATUSES = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

/**
 * Admin Order Management Page.
 * Displays all orders from all users.
 */
export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    // Fetch all orders from the admin endpoint
    const { data: allOrders = [], isLoading, isError } = useQuery<
        AdminOrdersRawResponse, // TQueryFnData: The type received from apiFetch
        Error,                   // TError: Standard error type
        AdminOrdersFinalData     // TData: The final type after the select function runs
    >({
        queryKey: ['adminAllOrders'],
        queryFn: () => apiFetch('/admin/orders'), 
        // CRITICAL FIX: The select function transforms the RawResponse into the FinalData type.
        select: (data) => data.orders,
    });

    // Apply filtering logic for search term and status
    const filteredOrders = useMemo(() => {
        let results = allOrders;
        const term = searchTerm.toLowerCase();

        // 1. Status Filter
        if (statusFilter !== 'All') {
            results = results.filter(o => o.status === statusFilter);
        }

        // 2. Search Filter (ID, UserID, or Status)
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
            case 'Processing': return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300';
            case 'Shipped': return 'bg-blue-200 text-blue-800 hover:bg-blue-300';
            case 'Delivered': return 'bg-green-200 text-green-800 hover:bg-green-300';
            case 'Cancelled': return 'bg-red-200 text-red-800 hover:bg-red-300';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    if (isLoading) return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
    if (isError) return <div className="text-red-500">Failed to load order data.</div>;
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold flex items-center">
                <ShoppingBag className="w-8 h-8 mr-3" /> Order Management ({filteredOrders.length})
            </h1>

            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex space-x-4 items-center">
                    <Input 
                        placeholder="Search by Order ID or User ID..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
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
                <Button variant="outline">Export Orders</Button>
            </div>

            {/* Order Table */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
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
