// app/admin/discounts/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Edit, Trash2, Copy, Percent, DollarSign, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api/httpClient';
import { DiscountForm } from '@/components/admin/DiscountForm';
import { useAlert } from '@/components/shared/ModalAlert';
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

interface AdminDiscountsRawResponse {
    discounts: Discount[];
}

export default function AdminDiscountsPage() {
    const queryClient = useQueryClient();
    const { alert } = useAlert();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | undefined>(undefined);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

    // Fetch Discounts (GET /api/admin/discounts)
    const { data: rawData = { discounts: [] }, isLoading, isError } = useQuery<AdminDiscountsRawResponse, Error>({
        queryKey: ['adminDiscounts'],
        queryFn: () => apiFetch('/admin/discounts'),
        staleTime: 1000 * 60,
    });
    
    const discounts = rawData.discounts;

    // Delete Mutation (DELETE /api/admin/discounts/:id)
    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/admin/discounts/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDiscounts'] });
            alert({ title: "Discount Deleted", message: "Coupon successfully revoked.", variant: 'success' });
            setDeleteConfirmOpen(false);
            setDiscountToDelete(null);
        },
        onError: (error: any) => {
            alert({ title: "Delete Failed", message: error.message || "Could not delete coupon.", variant: 'error' });
            setDeleteConfirmOpen(false);
        },
    });

    const filteredDiscounts = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return discounts.filter(discount => 
            discount.code.toLowerCase().includes(term) ||
            discount.description.toLowerCase().includes(term)
        );
    }, [discounts, searchTerm]);

    const stats = useMemo(() => {
        return {
            active: discounts.filter(d => d.status === 'active').length,
            scheduled: discounts.filter(d => d.status === 'scheduled').length,
            totalUses: discounts.reduce((sum, d) => sum + d.currentUses, 0),
        };
    }, [discounts]);

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount);
        setIsFormOpen(true);
    };

    const handleNew = () => {
        setEditingDiscount(undefined);
        setIsFormOpen(true);
    };
    
    const handleDelete = (discount: Discount) => {
        setDiscountToDelete(discount);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (discountToDelete) {
            deleteMutation.mutate(discountToDelete.id);
        }
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

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
    
    if (isError) return <div className="text-red-500 p-4">Failed to load discount data.</div>;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                    <Tag className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
                    Discounts & Coupons
                </h1>
                <Button size="sm" className="self-start sm:self-auto" onClick={handleNew}>
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
                                                onClick={() => navigator.clipboard.writeText(discount.code)}
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
                                                {discount.type === 'percentage' 
                                                    ? <Percent className="w-4 h-4 text-primary" />
                                                    : <DollarSign className="w-4 h-4 text-primary" />
                                                }
                                                <span className="font-semibold">
                                                    {discount.type === 'percentage' 
                                                        ? `${discount.value}% OFF` 
                                                        : `${formatGHS(discount.value)} OFF`
                                                    }
                                                </span>
                                            </div>
                                            {discount.minPurchase && discount.minPurchase > 0 && (
                                                <span className="text-gray-500">
                                                    • Min: {formatGHS(discount.minPurchase)}
                                                </span>
                                            )}
                                            {discount.maxUses !== null && discount.maxUses !== undefined && (
                                                <span className="text-gray-500">
                                                    • Uses: {discount.currentUses}/{discount.maxUses}
                                                </span>
                                            )}
                                            {(discount.maxUses === null || discount.maxUses === undefined) && (
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
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1 lg:flex-none"
                                            onClick={() => handleEdit(discount)}
                                        >
                                            <Edit className="w-4 h-4 lg:mr-2" />
                                            <span className="hidden lg:inline">Edit</span>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1 lg:flex-none text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(discount)}
                                            disabled={deleteMutation.isPending}
                                        >
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
            
            {/* Discount Form Dialog */}
            <DiscountForm 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                currentDiscount={editingDiscount}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete coupon code <strong>"{discountToDelete?.code}"</strong>? 
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