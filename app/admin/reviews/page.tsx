// app/admin/reviews/page.tsx

'use client';

import { useState } from 'react';
import { MessageSquare, Star, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock review data
interface Review {
    id: number;
    productName: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    verified: boolean;
}

const mockReviews: Review[] = [
    {
        id: 1,
        productName: "Chanel No. 5 Eau de Parfum",
        customerName: "Sarah Johnson",
        rating: 5,
        comment: "Absolutely love this perfume! The scent lasts all day and gets so many compliments.",
        date: "2025-11-08",
        status: "pending",
        verified: true
    },
    {
        id: 2,
        productName: "Dior Sauvage EDT",
        customerName: "Michael Chen",
        rating: 4,
        comment: "Great masculine scent, very fresh. Slightly expensive but worth it.",
        date: "2025-11-07",
        status: "approved",
        verified: true
    },
    {
        id: 3,
        productName: "Tom Ford Black Orchid",
        customerName: "Emily Davis",
        rating: 5,
        comment: "Luxurious and unique! Perfect for evening wear.",
        date: "2025-11-06",
        status: "approved",
        verified: false
    },
    {
        id: 4,
        productName: "Yves Saint Laurent Libre",
        customerName: "Anonymous",
        rating: 2,
        comment: "Not what I expected. Too strong for my taste.",
        date: "2025-11-05",
        status: "pending",
        verified: false
    },
];

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>(mockReviews);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            review.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || review.status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    };

    const handleApprove = (id: number) => {
        setReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
    };

    const handleReject = (id: number) => {
        setReviews(reviews.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

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
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                            {stats.avgRating}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
                <Input 
                    placeholder="Search by product or customer name..." 
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
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
                {filteredReviews.length === 0 ? (
                    <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                        No reviews found.
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <Card key={review.id} className={
                            review.status === 'pending' ? 'border-l-4 border-yellow-500' :
                            review.status === 'approved' ? 'border-l-4 border-green-500' :
                            'border-l-4 border-red-500'
                        }>
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-base">{review.productName}</h3>
                                            {review.verified && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Check className="w-3 h-3 mr-1" />Verified Purchase
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            {renderStars(review.rating)}
                                            <span>•</span>
                                            <span>{review.customerName}</span>
                                            <span>•</span>
                                            <span>{new Date(review.date).toLocaleDateString()}</span>
                                        </div>

                                        <p className="text-sm text-gray-700 mt-2">{review.comment}</p>

                                        <div className="flex items-center gap-2 pt-2">
                                            <Badge className={
                                                review.status === 'pending' ? 'bg-yellow-500' :
                                                review.status === 'approved' ? 'bg-green-500' :
                                                'bg-red-500'
                                            }>
                                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {review.status === 'pending' && (
                                        <div className="flex gap-2 md:flex-col">
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleApprove(review.id)}
                                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                                            >
                                                <Check className="w-4 h-4 mr-1" />Approve
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleReject(review.id)}
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