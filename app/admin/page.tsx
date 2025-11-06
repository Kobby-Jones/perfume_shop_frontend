// app/(admin)/page.tsx

import React from 'react';
import { cn } from '@/lib/utils';
 

/**
 * Admin Dashboard Overview Page.
 * This file is a Server Component and uses the AdminLayout for protection/navigation.
 */
export default function AdminDashboardOverview() {
    // Mock data for display (in production, fetch via API)
    const stats = [
        { title: 'Total Revenue', value: 'GHS 12,500.00', icon: 'DollarSign', color: 'text-green-600' },
        { title: 'New Orders (7D)', value: '45', icon: 'ShoppingBag', color: 'text-primary' },
        { title: 'Low Stock Items', value: '12', icon: 'AlertTriangle', color: 'text-yellow-600' },
        { title: 'Total Customers', value: '1,890', icon: 'Users', color: 'text-blue-600' },
    ];
    
    // We import icons dynamically since this is a Server Component
    const IconMap: { [key: string]: React.ElementType } = { DollarSign, ShoppingBag, AlertTriangle, Users };

    return (
        <div className="space-y-10">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            
            {/* 1. Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = IconMap[stat.icon];
                    return (
                        <div key={stat.title} className="bg-white p-6 rounded-xl shadow-md border-t-4 border-primary/50">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                {Icon && <Icon className={cn("w-6 h-6", stat.color)} />}
                            </div>
                            <p className="text-3xl font-extrabold mt-1">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* 2. Order Quick View (Placeholder) */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                <div className="h-48 flex items-center justify-center text-foreground/70 border border-dashed rounded-lg">
                    [List of recent orders table goes here - fetch from `/api/admin/orders`]
                </div>
            </div>
            
            {/* 3. Low Stock Alert (Placeholder) */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4">Product Performance Summary</h2>
                <div className="h-48 flex items-center justify-center text-foreground/70 border border-dashed rounded-lg">
                    [Chart/Report on best-selling items goes here]
                </div>
            </div>
        </div>
    );
}

// Map required icons for the Server Component
import { DollarSign, ShoppingBag, AlertTriangle, Users } from 'lucide-react';