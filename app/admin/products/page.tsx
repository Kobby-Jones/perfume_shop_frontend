'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';
import { ProductForm } from '@/components/admin/ProductForm'; 

// Define the Product structure for the component
interface AdminProduct {
    id: number;
    name: string;
    description: string; 
    price: number;
    availableStock: number;
    category: string;
    brand: string;
}

// 1. Define the RAW data type received directly from the API (TQueryFnData)
interface AdminProductsRawResponse {
    products: AdminProduct[];
    totalCount: number; // Included for completeness
}

// 2. Define the FINAL transformed data type used by the component (TData)
type AdminProductsFinalData = AdminProduct[];


export default function AdminProductsPage() {
    const queryClient = useQueryClient();
    const { alert } = useAlert();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<AdminProduct | undefined>(undefined);

    // Fetch all products
    const { data: products = [], isLoading, isError } = useQuery<
        AdminProductsRawResponse,  // TQueryFnData: The type received from apiFetch
        Error,                     // TError: Standard error type
        AdminProductsFinalData     // TData: The final type after the select function runs
    >({
        queryKey: ['adminProducts'],
        queryFn: () => apiFetch('/products?limit=1000'), 
        // CRITICAL FIX: The select function transforms the RawResponse into the FinalData array type.
        select: (data) => data.products,
    });

    // --- Delete Mutation ---
    const deleteMutation = useMutation({
        mutationFn: (id: number) => {
            return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            alert({ title: "Product Deleted", message: "Item successfully removed from catalog.", variant: 'success' });
        },
        onError: (error: any) => {
            alert({ title: "Delete Failed", message: error.message || "Could not delete product.", variant: 'error' });
        },
    });

    // --- Handlers ---
    const handleEdit = (product: AdminProduct) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleNew = () => {
        setEditingProduct(undefined); // Clear any old editing data
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

    if (isLoading) return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
    if (isError) return <div className="text-red-500">Failed to load product catalog.</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center">
                    <Package className="w-8 h-8 mr-3" /> Product Catalog ({products.length})
                </h1>
                <Button onClick={handleNew}>
                    <Plus className="w-5 h-5 mr-2" /> Add New Product
                </Button>
            </div>

            <Input 
                placeholder="Search by name or brand..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
            />

            {/* Product Table */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
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
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} title="Edit Product"><Edit className='w-4 h-4 text-blue-500' /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p)} title="Delete Product" disabled={deleteMutation.isPending}>
                                        <Trash2 className='w-4 h-4 text-red-500' />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Product Form Modal */}
            <ProductForm 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                product={editingProduct}
            />
        </div>
    );
}
