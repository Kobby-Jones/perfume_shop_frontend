// app/admin/reports/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart as BarChartIcon, DollarSign, Users, RefreshCw, TrendingUp, Crown, Tag } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/httpClient';
import { useState } from 'react';

// --- Types ---
interface ReportsOverview {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    newCustomers: number;
    totalCustomers: number;
    period: string;
}

interface SalesDataPoint {
    month: string;
    revenue: number;
    orders: number;
}

/**
 * Include an index signature so this matches Recharts' ChartDataInput (which allows arbitrary string keys).
 * This keeps the explicit fields while satisfying the library's type expectation.
 */
interface CategoryDataPoint {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

// NEW TYPES
interface TopCustomer {
    id: number;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
}

interface DiscountPerf {
    code: string;
    usageCount: number;
    totalRevenue: number;
    totalDiscountGiven: number;
}

// --- Helpers ---
const formatGHS = (amount: number, decimals?: number) => {
  return new Intl.NumberFormat('en-GH', { 
    style: 'currency', 
    currency: 'GHS',
    minimumFractionDigits: decimals ?? 2,
    maximumFractionDigits: decimals ?? 2
  }).format(amount);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 md:p-3 border shadow-lg rounded-lg text-xs md:text-sm max-w-[200px]">
        <p className="font-semibold mb-1 truncate">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="truncate">
            {entry.name}: {typeof entry.value === 'number' && (entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('spent'))
              ? formatGHS(entry.value, 0) 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const renderCustomLabel = (entry: any, isMobile: boolean) => {
  return isMobile ? `${entry.name}` : `${entry.name}: ${formatGHS(entry.value, 0)}`;
};

export default function AdminReportsPage() {
    const [months, setMonths] = useState(6);
    const [isMobile, setIsMobile] = useState(false);

    // --- Data Fetching ---
    const { data: overview, isLoading: l1, refetch: r1 } = useQuery<{ metrics: ReportsOverview }>({
        queryKey: ['adminReportsOverview', months],
        queryFn: () => apiFetch(`/admin/reports/overview?months=${months}`),
    });

    const { data: salesResponse, isLoading: l2, refetch: r2 } = useQuery<{ salesData: SalesDataPoint[] }>({
        queryKey: ['adminMonthlySales', months],
        queryFn: () => apiFetch(`/admin/reports/monthly-sales?months=${months}`),
    });

    const { data: categoryResponse, isLoading: l3, refetch: r3 } = useQuery<{ categorySales: CategoryDataPoint[] }>({
        queryKey: ['adminCategorySales', months],
        queryFn: () => apiFetch(`/admin/reports/category-sales?months=${months}`),
    });

    // NEW Queries
    const { data: topCustomersData, isLoading: l4, refetch: r4 } = useQuery<{ topCustomers: TopCustomer[] }>({
        queryKey: ['adminTopCustomers', months],
        queryFn: () => apiFetch(`/admin/reports/top-customers?months=${months}`),
    });

    const { data: discountData, isLoading: l5, refetch: r5 } = useQuery<{ discountPerformance: DiscountPerf[] }>({
        queryKey: ['adminDiscountPerf', months],
        queryFn: () => apiFetch(`/admin/reports/discounts?months=${months}`),
    });

    const isLoading = l1 || l2 || l3 || l4 || l5;
    const metrics = overview?.metrics;
    const salesData = salesResponse?.salesData || [];
    const categoryData = categoryResponse?.categorySales || [];
    const topCustomers = topCustomersData?.topCustomers || [];
    const discounts = discountData?.discountPerformance || [];

    const handleRefresh = () => {
        r1(); r2(); r3(); r4(); r5();
    };

    if (isLoading && !metrics) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }
    
    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                    <BarChartIcon className="w-6 h-6 md:w-8 md:h-8 mr-2" /> 
                    Sales & Analytics
                </h1>
                <div className="flex gap-2">
                    <select 
                        value={months} 
                        onChange={(e) => setMonths(parseInt(e.target.value))}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        <option value={3}>Last 3 Months</option>
                        <option value={6}>Last 6 Months</option>
                        <option value={12}>Last 12 Months</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* 1. Key Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="shadow-sm border-l-4 border-l-green-500">
                    <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm text-gray-500 font-medium">Total Revenue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-700">{formatGHS(metrics?.totalRevenue || 0, 0)}</div></CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm text-gray-500 font-medium">Avg. Order Value</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-700">{formatGHS(metrics?.avgOrderValue || 0)}</div></CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm text-gray-500 font-medium">Total Customers</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-purple-700">{metrics?.totalCustomers || 0}</div></CardContent>
                </Card>
            </div>

            {/* 2. Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Revenue Trend</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} />
                                <YAxis fontSize={12} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-lg">Sales by Category</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%" cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label={(entry) => entry.name}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Detailed Lists Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Customers Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-500" /> Top VIP Customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topCustomers.length > 0 ? (
                            <div className="space-y-4">
                                {topCustomers.map((c, idx) => (
                                    <div key={c.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{c.name}</p>
                                                <p className="text-xs text-gray-500">{c.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700 text-sm">{formatGHS(c.totalSpent)}</p>
                                            <p className="text-xs text-gray-500">{c.totalOrders} orders</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No customer data available.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Discount Performance Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-500" /> Coupon Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {discounts.length > 0 ? (
                            <div className="space-y-4">
                                {discounts.map((d, idx) => (
                                    <div key={d.code} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                        <div>
                                            <div className="font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-sm inline-block mb-1">
                                                {d.code}
                                            </div>
                                            <p className="text-xs text-gray-500">{d.usageCount} uses</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatGHS(d.totalRevenue)}</p>
                                            <p className="text-xs text-gray-500">Revenue Generated</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No discount usage recorded.</div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}