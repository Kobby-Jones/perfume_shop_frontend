// app/admin/inventory/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, Loader2, AlertTriangle, TrendingDown, Download } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InventoryProduct {
    id: number;
    name: string;
    sku?: string;
    brand: string;
    category: string;
    availableStock: number;
    lowStockThreshold: number;
    price: number;
    lastRestocked?: string;
}

interface InventoryRawResponse {
    products: InventoryProduct[];
}

type InventoryFinalData = InventoryProduct[];

const STOCK_FILTERS = ['All', 'Low Stock', 'Out of Stock', 'In Stock'];

export default function AdminInventoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState<string>('All');

    const { data: products = [], isLoading, isError } = useQuery<
        InventoryRawResponse,
        Error,
        InventoryFinalData
    >({
        queryKey: ['adminInventory'],
        queryFn: () => apiFetch('/products?limit=1000'),
        select: (data) => data.products.map(p => ({
            ...p,
            lowStockThreshold: 10,
            sku: `SKU-${p.id}`,
        })),
    });

    const filteredProducts = useMemo(() => {
        let results = products;

        // Stock filter
        if (stockFilter === 'Low Stock') {
            results = results.filter(p => p.availableStock > 0 && p.availableStock <= p.lowStockThreshold);
        } else if (stockFilter === 'Out of Stock') {
            results = results.filter(p => p.availableStock === 0);
        } else if (stockFilter === 'In Stock') {
            results = results.filter(p => p.availableStock > p.lowStockThreshold);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(p => 
                p.name.toLowerCase().includes(term) ||
                p.brand.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term)
            );
        }

        return results;
    }, [products, searchTerm, stockFilter]);

    const stats = useMemo(() => {
        const lowStock = products.filter(p => p.availableStock > 0 && p.availableStock <= p.lowStockThreshold).length;
        const outOfStock = products.filter(p => p.availableStock === 0).length;
        const totalValue = products.reduce((sum, p) => sum + (p.availableStock * p.price * 14), 0);
        
        return { lowStock, outOfStock, totalValue, totalProducts: products.length };
    }, [products]);

    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    const getStockStatus = (product: InventoryProduct) => {
        if (product.availableStock === 0) return { label: 'Out of Stock', color: 'bg-red-500' };
        if (product.availableStock <= product.lowStockThreshold) return { label: 'Low Stock', color: 'bg-yellow-500' };
        return { label: 'In Stock', color: 'bg-green-500' };
    };

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
    
    if (isError) return <div className="text-red-500 p-4">Failed to load inventory data.</div>;

    return (
        <div className="space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <Package className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
                Inventory Management
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold">{stats.totalProducts}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold text-yellow-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            {stats.lowStock}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Out of Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold text-red-600 flex items-center">
                            <TrendingDown className="w-4 h-4 mr-2" />
                            {stats.outOfStock}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Inventory Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg md:text-xl font-bold text-green-600">
                            {formatGHS(stats.totalValue)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
                <Input 
                    placeholder="Search by name, brand, or SKU..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter by Stock" />
                        </SelectTrigger>
                        <SelectContent>
                            {STOCK_FILTERS.map(f => (
                                <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Download className="w-4 h-4 mr-2" />Export Inventory
                    </Button>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                        No products found.
                    </div>
                ) : (
                    filteredProducts.map((product) => {
                        const status = getStockStatus(product);
                        return (
                            <div 
                                key={product.id} 
                                className={`bg-white rounded-lg shadow-md p-4 space-y-3 ${
                                    status.color === 'bg-red-500' ? 'border-l-4 border-red-500' :
                                    status.color === 'bg-yellow-500' ? 'border-l-4 border-yellow-500' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-bold text-base">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.sku}</p>
                                        <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
                                    </div>
                                    <Badge className={status.color + ' text-white'}>
                                        {status.label}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                                    <div>
                                        <p className="text-gray-500">Stock</p>
                                        <p className="font-bold text-lg">{product.availableStock}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Value</p>
                                        <p className="font-bold text-primary">
                                            {formatGHS(product.availableStock * product.price * 14)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['SKU', 'Product', 'Brand', 'Category', 'Stock', 'Status', 'Value'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((p) => {
                            const status = getStockStatus(p);
                            return (
                                <tr key={p.id} className={status.color === 'bg-red-500' ? 'bg-red-50' : status.color === 'bg-yellow-500' ? 'bg-yellow-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.brand}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{p.availableStock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={status.color + ' text-white'}>{status.label}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
                                        {formatGHS(p.availableStock * p.price * 14)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}