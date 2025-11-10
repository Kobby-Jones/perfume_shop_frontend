// app/admin/page.tsx

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { DollarSign, ShoppingBag, AlertTriangle, Users, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';

interface DashboardStats {
    totalRevenue: number;
    newOrders7D: number;
    lowStockItems: number;
    totalCustomers: number;
    avgOrderValue: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const data = await apiFetch('/admin/dashboard-stats');
        
        // Check if data.stats exists, otherwise return default values
        if (data?.stats) {
            return data.stats;
        }
        
        // If the API returns data directly (not nested in stats)
        if (data?.totalRevenue !== undefined) {
            return data as DashboardStats;
        }
        
        // Fallback to default values
        console.warn('Dashboard stats API returned unexpected structure:', data);
        return {
            totalRevenue: 0,
            newOrders7D: 0,
            lowStockItems: 0,
            totalCustomers: 0,
            avgOrderValue: 0,
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Return default values on error
        return {
            totalRevenue: 0,
            newOrders7D: 0,
            lowStockItems: 0,
            totalCustomers: 0,
            avgOrderValue: 0,
        };
    }
};

const formatGHS = (amount: number, decimals: number = 2) => 
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: decimals }).format(amount);

export default function AdminDashboardOverview() {
    const { data: stats, isLoading, isError } = useQuery<DashboardStats>({
        queryKey: ['adminDashboardStats'],
        queryFn: fetchDashboardStats,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const statCards = [
        { title: 'Total Revenue', value: stats?.totalRevenue !== undefined ? formatGHS(stats.totalRevenue) : 'N/A', icon: 'DollarSign', color: 'text-green-600', dataKey: 'totalRevenue' },
        { title: 'Avg. Order Value', value: stats?.avgOrderValue !== undefined ? formatGHS(stats.avgOrderValue) : 'N/A', icon: 'DollarSign', color: 'text-green-600', dataKey: 'avgOrderValue' },
        { title: 'New Orders (7D)', value: stats?.newOrders7D !== undefined ? stats.newOrders7D.toString() : 'N/A', icon: 'ShoppingBag', color: 'text-primary', dataKey: 'newOrders7D' },
        { title: 'Low Stock Items', value: stats?.lowStockItems !== undefined ? stats.lowStockItems.toString() : 'N/A', icon: 'AlertTriangle', color: 'text-yellow-600', dataKey: 'lowStockItems' },
        { title: 'Total Customers', value: stats?.totalCustomers !== undefined ? stats.totalCustomers.toString() : 'N/A', icon: 'Users', color: 'text-blue-600', dataKey: 'totalCustomers' },
    ];
    
    const IconMap: { [key: string]: React.ElementType } = { DollarSign, ShoppingBag, AlertTriangle, Users };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !stats) {
        return <div className="text-red-500 p-4">Failed to load dashboard data. Please check your API connection.</div>;
    }

    return (
        <div className="space-y-6 md:space-y-10">
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((stat) => {
                    const Icon = IconMap[stat.icon];
                    const isCurrency = stat.dataKey === 'totalRevenue' || stat.dataKey === 'avgOrderValue';
                    
                    return (
                        <div key={stat.title} className="bg-white p-4 md:p-6 rounded-xl shadow-md border-t-4 border-primary/50">
                            <div className="flex justify-between items-center">
                                <p className="text-xs md:text-sm font-medium text-gray-500">{stat.title}</p>
                                {Icon && <Icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />}
                            </div>
                            <p className="text-2xl md:text-3xl font-extrabold mt-1">
                                {isCurrency ? stat.value : stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Placeholder sections remain until we implement the charting/list components */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <h2 className="text-lg md:text-xl font-bold mb-4">Recent Orders</h2>
                <div className="h-40 md:h-48 flex items-center justify-center text-foreground/70 border border-dashed rounded-lg text-sm md:text-base text-center px-4">
                    Orders dashboard integration next.
                </div>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <h2 className="text-lg md:text-xl font-bold mb-4">Product Performance Summary</h2>
                <div className="h-40 md:h-48 flex items-center justify-center text-foreground/70 border border-dashed rounded-lg text-sm md:text-base text-center px-4">
                    Analytics page integration next.
                </div>
            </div>
        </div>
    );
}