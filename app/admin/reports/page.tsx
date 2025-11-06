'use client';

import { BarChart, LineChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart as BarChartIcon, DollarSign, Users, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/httpClient';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data structures matching GHS currency and common e-commerce stats
const mockSalesData = [
  { month: 'Oct', revenue: 4500, orders: 120 },
  { month: 'Nov', revenue: 6200, orders: 180 },
  { month: 'Dec', revenue: 8800, orders: 250 },
  { month: 'Jan', revenue: 5100, orders: 150 },
  { month: 'Feb', revenue: 4900, orders: 140 },
];

const mockCategoryData = [
  { name: 'Women', value: 4000, color: '#DB2777' }, // Pink
  { name: 'Men', value: 3000, color: '#3B82F6' }, // Blue
  { name: 'Unisex', value: 2500, color: '#F59E0B' }, // Amber
];

// Helper function to format currency
const formatGHS = (amount: number, p0?: number) => 
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

/**
 * Custom Tooltip for Recharts to show GHS currency.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].name;
    return (
      <div className="bg-white p-3 border shadow-lg rounded-lg text-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">{name}: {formatGHS(value)}</p>
      </div>
    );
  }
  return null;
};

/**
 * Admin Sales and Analytics Reports Dashboard.
 * Integrates Recharts for professional data visualization.
 */
export default function AdminReportsPage() {
    // In a production app, you would fetch all mock data here using a single hook/query
    // const { data, isLoading } = useQuery(...)

    const isLoading = false; // Mock loading state

    if (isLoading) {
        return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
    }
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold flex items-center">
                <BarChartIcon className="w-8 h-8 mr-3" /> Sales & Analytics Reports
            </h1>

            {/* 1. Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-lg">
                    <CardHeader><CardTitle className="text-lg">Total Revenue (Last 6 Months)</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-extrabold text-green-600">{formatGHS(35000)}</CardContent>
                </Card>
                 <Card className="shadow-lg">
                    <CardHeader><CardTitle className="text-lg">Avg. Order Value</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-extrabold text-primary">{formatGHS(135.50)}</CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader><CardTitle className="text-lg">New Customer Count</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-extrabold flex items-center text-blue-600">
                        280 <Users className="w-8 h-8 ml-3" />
                    </CardContent>
                </Card>
            </div>

            {/* 2. Monthly Revenue Trend (Line/Bar Chart) */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-xl">Monthly Revenue & Order Volume</CardTitle>
                    <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2"/> Update Data</Button>
                </CardHeader>
                <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockSalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={val => formatGHS(val, 0)} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#DB2777" />
                            <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#5EEAD4" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* 3. Sales By Category (Pie Chart) */}
            <Card className="shadow-lg">
                <CardHeader><CardTitle className="text-xl">Sales Distribution by Category</CardTitle></CardHeader>
                <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={mockCategoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                fill="#8884d8"
                                label
                            >
                                {mockCategoryData.map((entry, index) => (
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
    );
}
