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
    [key: string]: string | number;
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
      <div className="bg-white p-2 md:p-3 border shadow-lg rounded-lg text-xs md:text-sm max-w-[200px]">
        <p className="font-semibold mb-1 truncate">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="truncate">
            {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue') 
              ? formatGHS(entry.value, 0) 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom pie chart label for better mobile responsiveness
const renderCustomLabel = (entry: any, isMobile: boolean) => {
  if (isMobile) {
    // On mobile, show shorter labels
    return `${entry.name}`;
  }
  return `${entry.name}: ${formatGHS(entry.value, 0)}`;
};

export default function AdminReportsPage() {
    const [months, setMonths] = useState(6);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile on mount
    useState(() => {
        if (typeof window !== 'undefined') {
            setIsMobile(window.innerWidth < 768);
            const handleResize = () => setIsMobile(window.innerWidth < 768);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    });

    // Fetch overview metrics
    const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<{ metrics: ReportsOverview }>({
        queryKey: ['adminReportsOverview', months],
        queryFn: () => apiFetch(`/admin/reports/overview?months=${months}`),
        staleTime: 1000 * 60 * 5,
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
        <div className="space-y-4 md:space-y-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center">
                    <BarChartIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 mr-2 flex-shrink-0" /> 
                    <span className="truncate">Sales & Analytics</span>
                </h1>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <select 
                        value={months} 
                        onChange={(e) => setMonths(parseInt(e.target.value))}
                        className="px-3 py-2 border rounded-md text-xs md:text-sm flex-1 sm:flex-initial min-w-0"
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
                        className="flex-shrink-0"
                    >
                        <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="text-xs md:text-sm">Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                <Card className="shadow-lg overflow-hidden">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-xs md:text-sm lg:text-base flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="truncate">Total Revenue ({metrics?.period})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="text-xl md:text-2xl lg:text-3xl font-extrabold text-green-600 break-all leading-tight">
                        {formatGHS(metrics?.totalRevenue || 0, 0)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {metrics?.totalOrders || 0} orders
                      </p>
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg overflow-hidden">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-xs md:text-sm lg:text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="truncate">Avg. Order Value</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="text-xl md:text-2xl lg:text-3xl font-extrabold text-primary break-all leading-tight">
                        {formatGHS(metrics?.avgOrderValue || 0)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Per completed order
                      </p>
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg overflow-hidden sm:col-span-2 lg:col-span-1">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-xs md:text-sm lg:text-base flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate">New Customers</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="text-xl md:text-2xl lg:text-3xl font-extrabold text-blue-600">
                        {metrics?.newCustomers || 0}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total: {metrics?.totalCustomers || 0} customers
                      </p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Revenue Chart */}
            <Card className="shadow-lg overflow-hidden">
                <CardHeader className="px-4 pt-4 pb-2">
                    <CardTitle className="text-sm md:text-base lg:text-lg">Monthly Revenue & Orders</CardTitle>
                </CardHeader>
                <CardContent className="h-64 md:h-80 lg:h-96 px-2 md:px-4 pb-4">
                    {salesData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xs md:text-sm text-center px-4">
                            No sales data available for the selected period
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={salesData} 
                              margin={{ top: 10, right: isMobile ? 5 : 10, left: isMobile ? -20 : -10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                  dataKey="month" 
                                  tick={{ fontSize: isMobile ? 10 : 12 }}
                                  angle={isMobile ? -45 : 0}
                                  textAnchor={isMobile ? "end" : "middle"}
                                  height={isMobile ? 60 : 30}
                                />
                                <YAxis 
                                  yAxisId="left" 
                                  orientation="left" 
                                  stroke="#8884d8" 
                                  tickFormatter={val => isMobile ? `${(val / 1000).toFixed(0)}k` : formatGHS(val, 0)}
                                  tick={{ fontSize: isMobile ? 9 : 11 }}
                                  width={isMobile ? 35 : 60}
                                />
                                <YAxis 
                                  yAxisId="right" 
                                  orientation="right" 
                                  stroke="#82ca9d"
                                  tick={{ fontSize: isMobile ? 9 : 11 }}
                                  width={isMobile ? 30 : 40}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                  wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} 
                                  iconSize={isMobile ? 8 : 14}
                                />
                                <Bar yAxisId="left" dataKey="revenue" name="Revenue (GHS)" fill="#DB2777" />
                                <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#5EEAD4" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Sales By Category Pie Chart */}
            <Card className="shadow-lg overflow-hidden">
                <CardHeader className="px-4 pt-4 pb-2">
                  <CardTitle className="text-sm md:text-base lg:text-lg">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-64 md:h-80 lg:h-96 px-2 md:px-4 pb-4">
                    {categoryData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xs md:text-sm text-center px-4">
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
                                outerRadius={isMobile ? "60%" : "70%"}
                                fill="#8884d8"
                                label={isMobile ? false : (entry: any) => renderCustomLabel(entry, false)}
                                labelLine={!isMobile}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                              wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                              iconSize={isMobile ? 8 : 14}
                            />
                        </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}