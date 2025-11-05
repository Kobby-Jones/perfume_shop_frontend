// components/product/ReviewSection.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, User, Send, Star, Frown, CheckCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StarRating } from './StarRating';
import { apiFetch } from '@/lib/api/httpClient';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Zod Schema for Review Submission
const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5.'),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  comment: z.string().min(20, 'Comment must be at least 20 characters.'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;


// Backend Review structure

//   // Construct new review explicitly
// const newReview: Review = {
//     id: mockReviews.length + 1,
//     productId: reviewData.productId,
//     userId: reviewData.userId,
//     userName: reviewData.userName,
//     rating: reviewData.rating,
//     title: reviewData.title,
//     comment: reviewData.comment,
//     date: new Date().toISOString().split('T')[0] ?? '',};

// mockReviews.push(newReview);
// return newReview;
// }




interface Review { 
    userId: number;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
} 

interface ReviewData {
    reviews: Review[];
    averageRating: number;
    reviewCount: number;
}

/**
 * Fetches and manages all reviews for a specific product.
 */
export function ReviewSection({ productId }: { productId: number }) {
  const queryClient = useQueryClient();
  const { isLoggedIn, user } = useAuth();

  // 1. Fetch Reviews
  const { data, isLoading, isError } = useQuery<ReviewData>({
    queryKey: ['reviews', productId],
    queryFn: () => apiFetch(`/reviews/${productId}`), // GET /api/reviews/:productId
  });

  const reviews = data?.reviews || [];
  const averageRating = data?.averageRating || 0;
  const reviewCount = data?.reviewCount || 0;

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: '', comment: '' },
  });

  // 2. Review Submission Mutation
  const reviewMutation = useMutation({
    mutationFn: (newReview: ReviewFormData) => {
      return apiFetch('/reviews', { // POST /api/reviews
        method: 'POST',
        body: JSON.stringify({ ...newReview, productId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      toast.success("Review submitted successfully.");
      form.reset({ rating: 5, title: '', comment: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || "Could not submit review. Please try again.");
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to submit a review.");
      return;
    }
    reviewMutation.mutate(data);
  };
  
  // Find if current user has already reviewed (for better UX control)
  const hasReviewed = reviews.some(r => r.userId === user?.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 border rounded-lg bg-secondary/30">
        
        {/* Left Column: Summary and Form */}
        <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold">Customer Ratings</h3>
            
            {/* Average Rating Display */}
            <div className="flex items-center space-x-4">
                <StarRating rating={averageRating} size={28} />
                <span className="text-4xl font-extrabold text-foreground">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-foreground/70">{reviewCount} total verified ratings.</p>

            <Separator />
            
            {/* Review Submission Form */}
            <h4 className="font-semibold text-lg">Write a Review</h4>
            {hasReviewed ? (
                <p className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Thank you! You have already reviewed this product.
                </p>
            ) : (
                <ReviewForm form={form} onSubmit={onSubmit} isPending={reviewMutation.isPending} isLoggedIn={isLoggedIn} />
            )}
        </div>

        {/* Right Column: Review List */}
        <div className="lg:col-span-2 space-y-8 lg:border-l lg:pl-8">
            <h3 className="text-xl font-bold">All Reviews</h3>
            {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : reviewCount === 0 ? (
                <p className="text-foreground/70 flex items-center"><Frown className="w-5 h-5 mr-2" /> Be the first to review this product!</p>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review, index) => (
                        <div key={index} className="pb-4 border-b border-border">
                            <div className="flex justify-between items-center mb-1">
                                <StarRating rating={review.rating} size={16} />
                                <span className="text-xs text-foreground/50">{review.date}</span>
                            </div>
                            <h4 className="font-semibold text-base mb-1">{review.title}</h4>
                            <p className="text-sm text-foreground/80">{review.comment}</p>
                            <p className="text-xs font-medium mt-2 text-primary">— {review.userName}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}

// Inner component for the form (reused to keep ReviewSection clean)
function ReviewForm({ form, onSubmit, isPending, isLoggedIn }: any) {
    const [tempRating, setTempRating] = useState(5); // Local state for star hover UX
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* 1. Rating Selector */}
                <FormField name="rating" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your Rating ({field.value} Stars)</FormLabel>
                        <FormControl>
                            <div className="flex space-x-1 cursor-pointer">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                    <Star
                                        key={starValue}
                                        size={24}
                                        className={cn(
                                            "transition-colors",
                                            starValue <= (field.value || tempRating) ? "fill-accent text-accent" : "text-gray-300"
                                        )}
                                        onClick={() => field.onChange(starValue)}
                                        onMouseEnter={() => setTempRating(starValue)}
                                        onMouseLeave={() => setTempRating(field.value)}
                                    />
                                ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* 2. Title Input */}
                <FormField name="title" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Review Title</FormLabel>
                        <FormControl><Input placeholder="E.g., Great purchase!" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* 3. Comment Textarea */}
                <FormField name="comment" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your Detailed Comment</FormLabel>
                        <FormControl><Textarea placeholder="What did you love/dislike about the product?" rows={4} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                
                {/* 4. Submit Button */}
                <Button type="submit" className="w-full" disabled={isPending || !isLoggedIn}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" /> Submit Review
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
}