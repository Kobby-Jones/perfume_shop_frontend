// app/admin/reports/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart as BarChartIcon, DollarSign, Users, RefreshCw, TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/httpClient';
import { useState } from 'react';

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

interface CategoryDataPoint {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number; // Add index signature for Recharts compatibility
}

const formatGHS = (amount: number, decimals?: number) => {
  const formatter = new Intl.NumberFormat('en-GH', { 
    style: 'currency', 
    currency: 'GHS',
    minimumFractionDigits: decimals ?? 2,
    maximumFractionDigits: decimals ?? 2
  });
  return formatter.format(amount);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border shadow-lg rounded-lg text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue') 
              ? formatGHS(entry.value) 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminReportsPage() {
    const [months, setMonths] = useState(6);

    // Fetch overview metrics
    const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<{ metrics: ReportsOverview }>({
        queryKey: ['adminReportsOverview', months],
        queryFn: () => apiFetch(`/admin/reports/overview?months=${months}`),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Fetch monthly sales data
    const { data: salesResponse, isLoading: salesLoading, refetch: refetchSales } = useQuery<{ salesData: SalesDataPoint[] }>({
        queryKey: ['adminMonthlySales', months],
        queryFn: () => apiFetch(`/admin/reports/monthly-sales?months=${months}`),
        staleTime: 1000 * 60 * 5,
    });

    // Fetch category sales data
    const { data: categoryResponse, isLoading: categoryLoading, refetch: refetchCategory } = useQuery<{ categorySales: CategoryDataPoint[] }>({
        queryKey: ['adminCategorySales', months],
        queryFn: () => apiFetch(`/admin/reports/category-sales?months=${months}`),
        staleTime: 1000 * 60 * 5,
    });

    const isLoading = overviewLoading || salesLoading || categoryLoading;
    const metrics = overview?.metrics;
    const salesData = salesResponse?.salesData || [];
    const categoryData = categoryResponse?.categorySales || [];

    const handleRefresh = () => {
        refetchOverview();
        refetchSales();
        refetchCategory();
    };

    if (isLoading && !metrics) {
        return (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        );
    }
    
    return (
        <div className="space-y-4 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                    <BarChartIcon className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
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
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Total Revenue ({metrics?.period})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl md:text-4xl font-extrabold text-green-600">
                        {formatGHS(metrics?.totalRevenue || 0, 0)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {metrics?.totalOrders || 0} orders
                      </p>
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Avg. Order Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl md:text-4xl font-extrabold text-primary">
                        {formatGHS(metrics?.avgOrderValue || 0)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Per completed order
                      </p>
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        New Customers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl md:text-4xl font-extrabold text-blue-600">
                        {metrics?.newCustomers || 0}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total: {metrics?.totalCustomers || 0} customers
                      </p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Revenue Chart */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base md:text-xl">Monthly Revenue & Orders</CardTitle>
                </CardHeader>
                <CardContent className="h-64 md:h-96">
                    {salesData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No sales data available for the selected period
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={salesData} 
                              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                  dataKey="month" 
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                  yAxisId="left" 
                                  orientation="left" 
                                  stroke="#8884d8" 
                                  tickFormatter={val => formatGHS(val, 0)}
                                  tick={{ fontSize: 11 }}
                                />
                                <YAxis 
                                  yAxisId="right" 
                                  orientation="right" 
                                  stroke="#82ca9d"
                                  tick={{ fontSize: 11 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar yAxisId="left" dataKey="revenue" name="Revenue (GHS)" fill="#DB2777" />
                                <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#5EEAD4" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Sales By Category Pie Chart */}
            <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base md:text-xl">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-64 md:h-96">
                    {categoryData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No category data available for the selected period
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="70%"
                                fill="#8884d8"
                                label={(entry: any) => `${entry.name}: ${formatGHS(entry.value as number, 0)}`}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}