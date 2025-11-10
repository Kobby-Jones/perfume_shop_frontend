// app/admin/page.tsx

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { DollarSign, ShoppingBag, AlertTriangle, Users, Loader2, Package, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import Link from 'next/link';

interface DashboardStats {
    totalRevenue: number;
    newOrdersLast7D: number;
    lowStockItems: number;
    totalCustomers: number;
    totalInventoryValue: number;
}

interface RecentOrder {
    id: number;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

interface TopProduct {
    id: number;
    name: string;
    totalRevenue: number;
    totalQuantitySold: number;
    averagePrice: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const data = await apiFetch('/admin/dashboard-stats');
        
        if (data?.totalRevenue !== undefined) {
            return {
                totalRevenue: data.totalRevenue ?? 0,
                newOrdersLast7D: data.newOrdersLast7D ?? 0,
                lowStockItems: data.lowStockItems ?? 0,
                totalCustomers: data.totalCustomers ?? 0,
                totalInventoryValue: data.totalInventoryValue ?? 0,
            };
        }
        
        console.warn('Dashboard stats API returned unexpected structure:', data);
        return {
            totalRevenue: 0,
            newOrdersLast7D: 0,
            lowStockItems: 0,
            totalCustomers: 0,
            totalInventoryValue: 0,
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return {
            totalRevenue: 0,
            newOrdersLast7D: 0,
            lowStockItems: 0,
            totalCustomers: 0,
            totalInventoryValue: 0,
        };
    }
};

const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
    try {
        const data = await apiFetch('/admin/orders/recent?limit=5');
        return data?.orders || [];
    } catch (error) {
        console.error('Failed to fetch recent orders:', error);
        return [];
    }
};

const fetchTopProducts = async (): Promise<TopProduct[]> => {
    try {
        const data = await apiFetch('/admin/products/top-performers?limit=5');
        return data?.products || [];
    } catch (error) {
        console.error('Failed to fetch top products:', error);
        return [];
    }
};

const formatGHS = (amount: number, decimals: number = 2) => 
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GH', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'processing': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
        'shipped': 'bg-purple-100 text-purple-800',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export default function AdminDashboardOverview() {
    const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery<DashboardStats>({
        queryKey: ['adminDashboardStats'],
        queryFn: fetchDashboardStats,
        staleTime: 1000 * 60 * 5,
    });

    const { data: recentOrders, isLoading: ordersLoading } = useQuery<RecentOrder[]>({
        queryKey: ['adminRecentOrders'],
        queryFn: fetchRecentOrders,
        staleTime: 1000 * 60 * 2,
    });

    const { data: topProducts, isLoading: productsLoading } = useQuery<TopProduct[]>({
        queryKey: ['adminTopProducts'],
        queryFn: fetchTopProducts,
        staleTime: 1000 * 60 * 5,
    });

    const statCards = [
        { 
            title: 'Total Revenue', 
            value: stats?.totalRevenue != null ? formatGHS(stats.totalRevenue) : 'N/A', 
            icon: 'DollarSign', 
            color: 'text-green-600', 
            dataKey: 'totalRevenue'
        },
        { 
            title: 'Inventory Value', 
            value: stats?.totalInventoryValue != null ? formatGHS(stats.totalInventoryValue) : 'N/A', 
            icon: 'Package', 
            color: 'text-purple-600', 
            dataKey: 'totalInventoryValue'
        },
        { 
            title: 'New Orders (7D)', 
            value: stats?.newOrdersLast7D != null ? stats.newOrdersLast7D.toString() : 'N/A', 
            icon: 'ShoppingBag', 
            color: 'text-primary', 
            dataKey: 'newOrdersLast7D'
        },
        { 
            title: 'Low Stock Items', 
            value: stats?.lowStockItems != null ? stats.lowStockItems.toString() : 'N/A', 
            icon: 'AlertTriangle', 
            color: 'text-yellow-600', 
            dataKey: 'lowStockItems'
        },
        { 
            title: 'Total Customers', 
            value: stats?.totalCustomers != null ? stats.totalCustomers.toString() : 'N/A', 
            icon: 'Users', 
            color: 'text-blue-600', 
            dataKey: 'totalCustomers'
        },
    ];
    
    const IconMap: { [key: string]: React.ElementType } = { DollarSign, ShoppingBag, AlertTriangle, Users, Package };

    if (statsLoading && !stats) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (statsError || !stats) {
        return <div className="text-red-500 p-4">Failed to load dashboard data. Please check your API connection.</div>;
    }

    return (
        <div className="space-y-6 md:space-y-10">
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {statCards.map((stat) => {
                    const Icon = IconMap[stat.icon];
                    
                    return (
                        <div key={stat.title} className="bg-white p-4 md:p-6 rounded-xl shadow-md border-t-4 border-primary/50">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs md:text-sm font-medium text-gray-500">{stat.title}</p>
                                {Icon && <Icon className={cn("w-5 h-5 md:w-6 md:h-6 flex-shrink-0", stat.color)} />}
                            </div>
                            <p className="text-xl md:text-2xl lg:text-3xl font-extrabold break-words">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-bold">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                
                {ordersLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : recentOrders && recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b">
                                <tr className="text-left text-gray-500">
                                    <th className="pb-3 font-medium">Order #</th>
                                    <th className="pb-3 font-medium">Customer</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 font-medium text-primary">#{order.orderNumber}</td>
                                        <td className="py-3">{order.customerName}</td>
                                        <td className="py-3 font-semibold">{formatGHS(order.totalAmount)}</td>
                                        <td className="py-3">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(order.status))}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-500">
                        No recent orders found
                    </div>
                )}
            </div>
            
            {/* Top Products Performance */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-bold">Top Performing Products</h2>
                    <Link href="/admin/reports" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1">
                        View Reports <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                
                {productsLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : topProducts && topProducts.length > 0 ? (
                    <div className="space-y-3">
                        {topProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0",
                                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                                        index === 1 ? "bg-gray-100 text-gray-700" :
                                        index === 2 ? "bg-orange-100 text-orange-700" :
                                        "bg-blue-50 text-blue-700"
                                    )}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {product.totalQuantitySold} units sold • Avg: {formatGHS(product.averagePrice)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="font-bold text-green-600">{formatGHS(product.totalRevenue)}</p>
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                        <TrendingUp className="w-3 h-3" />
                                        Revenue
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-500">
                        No product performance data available
                    </div>
                )}
            </div>
        </div>
    );
}