// app/admin/reports/page.tsx

'use client';

import { BarChart, LineChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart as BarChartIcon, DollarSign, Users, RefreshCw } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const mockSalesData = [
  { month: 'Oct', revenue: 4500, orders: 120 },
  { month: 'Nov', revenue: 6200, orders: 180 },
  { month: 'Dec', revenue: 8800, orders: 250 },
  { month: 'Jan', revenue: 5100, orders: 150 },
  { month: 'Feb', revenue: 4900, orders: 140 },
];

const mockCategoryData = [
  { name: 'Women', value: 4000, color: '#DB2777' },
  { name: 'Men', value: 3000, color: '#3B82F6' },
  { name: 'Unisex', value: 2500, color: '#F59E0B' },
];

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

export default function AdminReportsPage() {
    const isLoading = false;

    if (isLoading) {
        return (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        );
    }
    
    return (
        <div className="space-y-4 md:space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <BarChartIcon className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
                Sales & Analytics
            </h1>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm md:text-lg">Total Revenue (6M)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl md:text-4xl font-extrabold text-green-600">
                      {formatGHS(35000, 0)}
                    </CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm md:text-lg">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl md:text-4xl font-extrabold text-primary">
                      {formatGHS(135.50)}
                    </CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm md:text-lg">New Customers</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl md:text-4xl font-extrabold flex items-center text-blue-600">
                        280 <Users className="w-6 h-6 md:w-8 md:h-8 ml-2 md:ml-3" />
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Revenue Chart */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-base md:text-xl">Monthly Revenue & Orders</CardTitle>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm">
                      <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2"/> Update
                    </Button>
                </CardHeader>
                <CardContent className="h-64 md:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={mockSalesData} 
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
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#DB2777" />
                            <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#5EEAD4" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Sales By Category Pie Chart */}
            <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base md:text-xl">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-64 md:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={mockCategoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="70%"
                                fill="#8884d8"
                                label={(entry) => entry.name}
                            >
                                {mockCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}