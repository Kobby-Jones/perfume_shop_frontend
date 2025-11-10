// app/admin/products/page.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';
import { ProductForm } from '@/components/admin/ProductForm';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Define the precise structure expected from the backend
interface AdminProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    availableStock: number;
    category: string;
    brand: string;
    images: string[];
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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

    // Fetch Products (GET /api/products)
    const { data: products = [], isLoading, isError } = useQuery<
        AdminProductsRawResponse,
        Error,
        AdminProductsFinalData
    >({
        queryKey: ['adminProducts'],
        // Fetch all products (limit=999 to simulate no pagination for admin table)
        queryFn: () => apiFetch('/products?limit=999'),
        select: (data) => data.products,
    });

    // Delete Mutation (DELETE /api/admin/products/:id)
    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            alert({ title: "Product Deleted", message: "Item successfully removed from catalog.", variant: 'success' });
            setDeleteConfirmOpen(false);
            setProductToDelete(null);
        },
        onError: (error: any) => {
            alert({ title: "Delete Failed", message: error.message || "Could not delete product.", variant: 'error' });
            setDeleteConfirmOpen(false);
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
        setProductToDelete(product);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            deleteMutation.mutate(productToDelete.id);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

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

            {/* Desktop Table View */}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatGHS(p.price)}</td>
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
            
            {/* Product Form Dialog */}
            <ProductForm 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                product={editingProduct}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>"{productToDelete?.name}"</strong>? 
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}