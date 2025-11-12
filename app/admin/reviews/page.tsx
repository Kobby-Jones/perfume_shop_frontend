// app/admin/reviews/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Star, Check, X, Loader2, Filter } from 'lucide-react';
import { apiFetch } from '@/lib/api/httpClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlert } from '@/components/shared/ModalAlert';

// Updated interface to match backend response structure
interface Review {
    id: number;
    title: string;
    comment: string;
    rating: number;
    createdAt: string; 
    status: 'pending' | 'approved' | 'rejected';
    productId: number;
    userId: number;
    product: { 
        id: number;
        name: string;
    };
    user: { 
        id: number;
        name: string;
        email: string;
    };
}

const STATUS_FILTERS = ['All', 'pending', 'approved', 'rejected'];

export default function AdminReviewsPage() {
    const queryClient = useQueryClient();
    const { alert } = useAlert();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    
    // Fetch Reviews (GET /api/admin/reviews)
    const { data: allReviews = [], isLoading, isError } = useQuery<Review[]>({
        queryKey: ['adminReviews'],
        queryFn: async () => {
            const data = await apiFetch('/admin/reviews');
            console.log('Fetched reviews:', data.reviews); // Debug log
            return data.reviews as Review[];
        },
        staleTime: 1000 * 60,
    });

    // Mutation to update review status
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: 'approved' | 'rejected' }) => 
            apiFetch(`/admin/reviews/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
            alert({ title: "Review Status Updated", message: "Review successfully moderated.", variant: 'success' });
        },
        onError: (error: any) => {
            alert({ title: "Update Failed", message: error.message || "Could not update review status.", variant: 'error' });
        },
    });

    const filteredReviews = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        
        const filtered = allReviews.filter(review => {
            // First apply status filter
            const matchesStatus = statusFilter === 'All' || review.status === statusFilter;
            
            // If no status match, skip this review
            if (!matchesStatus) return false;
            
            // If no search term, include all reviews that match status
            if (!term) return true;
            
            // Apply search filter - safely handle nested objects
            const productName = review.product?.name?.toLowerCase() || '';
            const userName = review.user?.name?.toLowerCase() || '';
            const userEmail = review.user?.email?.toLowerCase() || '';
            const reviewTitle = review.title?.toLowerCase() || '';
            const reviewComment = review.comment?.toLowerCase() || '';
            
            const matchesSearch = 
                productName.includes(term) ||
                userName.includes(term) ||
                userEmail.includes(term) ||
                reviewTitle.includes(term) ||
                reviewComment.includes(term);
            
            return matchesSearch;
        });
        
        console.log(`Filtered reviews (status: ${statusFilter}, search: "${term}"):`, filtered.length); // Debug log
        return filtered;
    }, [allReviews, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const total = allReviews.length;
        const pending = allReviews.filter(r => r.status === 'pending').length;
        const approved = allReviews.filter(r => r.status === 'approved').length;
        const rejected = allReviews.filter(r => r.status === 'rejected').length;
        const sum = allReviews.reduce((s, r) => s + r.rating, 0);
        const avgRating = total > 0 ? (sum / total).toFixed(1) : 'N/A';
        
        console.log('Stats:', { total, pending, approved, rejected }); // Debug log
        return { total, pending, approved, rejected, avgRating };
    }, [allReviews]);

    const handleUpdateStatus = (id: number, status: 'approved' | 'rejected') => {
        updateStatusMutation.mutate({ id, status });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };
    
    const getStatusColor = (status: Review['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500 text-white';
            case 'approved': return 'bg-green-500 text-white';
            case 'rejected': return 'bg-red-500 text-white';
            default: return 'bg-gray-500';
        }
    };

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    if (isError) return <div className="text-red-500 p-4">Failed to load review data.</div>;

    return (
        <div className="space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" /> 
                Customer Reviews
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Total Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold text-green-600">{stats.approved}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm text-gray-500">Avg Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl md:text-2xl font-bold flex items-center">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400 mr-1" />
                            {stats.avgRating}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
                <Input 
                    placeholder="Search by product, customer, or review content..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_FILTERS.map(f => (
                            <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
                {filteredReviews.length === 0 ? (
                    <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                        {allReviews.length === 0 
                            ? "No reviews found in the system."
                            : `No reviews found matching your filters (Status: ${statusFilter}${searchTerm ? `, Search: "${searchTerm}"` : ''}).`
                        }
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <Card key={review.id} className={`border-l-4 border-l-${getStatusColor(review.status).includes('yellow') ? 'yellow' : getStatusColor(review.status).includes('green') ? 'green' : 'red'}-500`}>
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-base">
                                                {review.product?.name || 'Unknown Product'} 
                                                {review.product?.id && ` (ID: ${review.product.id})`}
                                            </h3>
                                            <Badge className={getStatusColor(review.status)}>
                                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                                            {renderStars(review.rating)}
                                            <span>•</span>
                                            <span>
                                                {review.user?.name || 'Unknown User'} 
                                                {review.user?.email && ` (${review.user.email})`}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <p className="text-sm font-semibold text-gray-900">{review.title}</p>
                                        <p className="text-sm text-gray-700">{review.comment}</p>
                                    </div>

                                    {review.status === 'pending' && (
                                        <div className="flex gap-2 md:flex-col">
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleUpdateStatus(review.id, 'approved')}
                                                disabled={updateStatusMutation.isPending}
                                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                                            >
                                                <Check className="w-4 h-4 mr-1" />Approve
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                                disabled={updateStatusMutation.isPending}
                                                className="flex-1 md:flex-none text-red-600 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4 mr-1" />Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}