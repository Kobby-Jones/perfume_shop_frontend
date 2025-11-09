// app/admin/discounts/page.tsx

'use client';

import { useState } from 'react';
import { Tag, Plus, Edit, Trash2, Copy, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Discount {
    id: number;
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    minPurchase?: number;
    maxUses?: number;
    currentUses: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'scheduled';
}

const mockDiscounts: Discount[] = [
    {
        id: 1,
        code: "WELCOME20",
        description: "Welcome discount for new customers",
        type: "percentage",
        value: 20,
        minPurchase: 100,
        maxUses: 100,
        currentUses: 45,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        status: "active"
    },
    {
        id: 2,
        code: "FREESHIP",
        description: "Free shipping on all orders",
        type: "fixed",
        value: 50,
        minPurchase: 200,
        currentUses: 128,
        startDate: "2025-11-01",
        endDate: "2025-11-30",
        status: "active"
    },
    {
        id: 3,
        code: "BLACKFRIDAY",
        description: "Black Friday mega sale",
        type: "percentage",
        value: 35,
        maxUses: 500,
        currentUses: 0,
        startDate: "2025-11-29",
        endDate: "2025-11-30",
        status: "scheduled"
    },
    {
        id: 4,
        code: "SUMMER2024",
        description: "Summer sale ended",
        type: "percentage",
        value: 25,
        currentUses: 234,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        status: "expired"
    },
];

export default function AdminDiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDiscounts = discounts.filter(discount => 
        discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discount.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        active: discounts.filter(d => d.status === 'active').length,
        scheduled: discounts.filter(d => d.status === 'scheduled').length,
        totalUses: discounts.reduce((sum, d) => sum + d.currentUses, 0),
    };

    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    const getStatusColor = (status: Discount['status']) => {
        switch (status) {
            case 'active': return 'bg-green-500 text-white';
            case 'scheduled': return 'bg-blue-500 text-white';
            case 'expired': return 'bg-gray-400 text-white';
            default: return 'bg-gray-500';
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`Copied: ${code}`);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                    <Tag className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
                    Discounts & Coupons
                </h1>
                <Button size="sm" className="self-start sm:self-auto">
                    <Plus className="w-4 h-4 mr-2" />Create Coupon
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Active Coupons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold text-green-600">{stats.active}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Scheduled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Total Uses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold">{stats.totalUses}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Input 
                placeholder="Search coupons by code or description..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
            />

            {/* Discounts List */}
            <div className="space-y-3">
                {filteredDiscounts.length === 0 ? (
                    <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                        No coupons found.
                    </div>
                ) : (
                    filteredDiscounts.map((discount) => (
                        <Card key={discount.id}>
                            <CardContent className="p-4">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Left Section */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <code className="px-3 py-1 bg-gray-100 rounded font-mono text-lg font-bold">
                                                {discount.code}
                                            </code>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => copyCode(discount.code)}
                                                className="h-8"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Badge className={getStatusColor(discount.status)}>
                                                {discount.status.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-gray-600">{discount.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Percent className="w-4 h-4 text-primary" />
                                                <span className="font-semibold">
                                                    {discount.type === 'percentage' 
                                                        ? `${discount.value}% OFF` 
                                                        : `${formatGHS(discount.value)} OFF`
                                                    }
                                                </span>
                                            </div>
                                            {discount.minPurchase && (
                                                <span className="text-gray-500">
                                                    • Min: {formatGHS(discount.minPurchase)}
                                                </span>
                                            )}
                                            {discount.maxUses && (
                                                <span className="text-gray-500">
                                                    • Uses: {discount.currentUses}/{discount.maxUses}
                                                </span>
                                            )}
                                            {!discount.maxUses && (
                                                <span className="text-gray-500">
                                                    • Uses: {discount.currentUses}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            Valid: {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Right Section - Actions */}
                                    <div className="flex gap-2 lg:flex-col">
                                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                                            <Edit className="w-4 h-4 lg:mr-2" />
                                            <span className="hidden lg:inline">Edit</span>
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4 lg:mr-2" />
                                            <span className="hidden lg:inline">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}