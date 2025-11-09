// app/admin/page.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, ShoppingBag, AlertTriangle, Users } from 'lucide-react';

export default function AdminDashboardOverview() {
    const stats = [
        { title: 'Total Revenue', value: 'GHS 12,500.00', icon: 'DollarSign', color: 'text-green-600' },
        { title: 'New Orders (7D)', value: '45', icon: 'ShoppingBag', color: 'text-primary' },
        { title: 'Low Stock Items', value: '12', icon: 'AlertTriangle', color: 'text-yellow-600' },
        { title: 'Total Customers', value: '1,890', icon: 'Users', color: 'text-blue-600' },
    ];
    
    const IconMap: { [key: string]: React.ElementType } = { DollarSign, ShoppingBag, AlertTriangle, Users };

    return (
        <div className="space-y-6 md:space-y-10">
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            
            {/* Quick Stats Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat) => {
                    const Icon = IconMap[stat.icon];
                    return (
                        <div key={stat.title} className="bg-white p-4 md:p-6 rounded-xl shadow-md border-t-4 border-primary/50">
                            <div className="flex justify-between items-center">
                                <p className="text-xs md:text-sm font-medium text-gray-500">{stat.title}</p>
                                {Icon && <Icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />}
                            </div>
                            <p className="text-2xl md:text-3xl font-extrabold mt-1">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <h2 className="text-lg md:text-xl font-bold mb-4">Recent Orders</h2>
                <div className="h-40 md:h-48 flex items-center justify-center text-foreground/70 border border-dashed rounded-lg text-sm md:text-base text-center px-4">
                    [List of recent orders table goes here - fetch from `/api/admin/orders`]
                </div>
            </div>
            
            {/* Product Performance */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
                <h2 className="text-lg md:text-xl font-bold mb-4">Product Performance Summary</h2>
                <div className="h-40 md:h-48 flex items-center justify-center text-foreground/70 border border-dashed rounded-lg text-sm md:text-base text-center px-4">
                    [Chart/Report on best-selling items goes here]
                </div>
            </div>
        </div>
    );
}