// app/admin/products/page.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';
import { ProductForm } from '@/components/admin/ProductForm';
import { Badge } from '@/components/ui/badge';

interface AdminProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    availableStock: number;
    category: string;
    brand: string;
}

interface AdminProductsRawResponse {
    products: AdminProduct[];
    totalCount: number;
}

type AdminProductsFinalData = AdminProduct[];

export default function AdminProductsPage() {
    const queryClient = useQueryClient();
    const { alert } = useAlert();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<AdminProduct | undefined>(undefined);

    const { data: products = [], isLoading, isError } = useQuery<
        AdminProductsRawResponse,
        Error,
        AdminProductsFinalData
    >({
        queryKey: ['adminProducts'],
        queryFn: () => apiFetch('/products?limit=1000'),
        select: (data) => data.products,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            alert({ title: "Product Deleted", message: "Item successfully removed from catalog.", variant: 'success' });
        },
        onError: (error: any) => {
            alert({ title: "Delete Failed", message: error.message || "Could not delete product.", variant: 'error' });
        },
    });

    const handleEdit = (product: AdminProduct) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleNew = () => {
        setEditingProduct(undefined);
        setIsFormOpen(true);
    };
    
    const handleDelete = (product: AdminProduct) => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"? This cannot be undone.`)) {
            deleteMutation.mutate(product.id);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatGHS = (amount: number) => 
        new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
    
    if (isError) return <div className="text-red-500 p-4">Failed to load product catalog.</div>;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                    <Package className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
                    <span>Products <span className="text-base md:text-xl">({products.length})</span></span>
                </h1>
                <Button onClick={handleNew} size="sm" className="self-start sm:self-auto">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Add Product
                </Button>
            </div>

            <Input 
                placeholder="Search by name or brand..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
            />

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                        No products found.
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className={`bg-white rounded-lg shadow-md p-4 space-y-3 ${
                                product.availableStock < 5 ? 'border-l-4 border-yellow-500' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-bold text-base">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.brand}</p>
                                    <Badge variant="outline" className="mt-1 text-xs">
                                        {product.category}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">{formatGHS(product.price * 14)}</p>
                                    <p className={`text-sm font-bold mt-1 ${
                                        product.availableStock < 5 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                        Stock: {product.availableStock}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-2 border-t">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEdit(product)}
                                    className="flex-1"
                                >
                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDelete(product)}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['ID', 'Name', 'Category', 'Price (GHS)', 'Stock', 'Actions'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((p) => (
                            <tr key={p.id} className={p.availableStock < 5 ? 'bg-yellow-50/50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatGHS(p.price * 14)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                    <span className={p.availableStock < 5 ? 'text-red-600' : 'text-green-600'}>
                                        {p.availableStock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} title="Edit Product">
                                        <Edit className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleDelete(p)} 
                                        title="Delete Product" 
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <ProductForm 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                product={editingProduct}
            />
        </div>
    );
}