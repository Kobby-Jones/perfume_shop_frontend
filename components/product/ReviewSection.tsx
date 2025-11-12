// components/product/ReviewSection.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, Star, Frown, CheckCircle, ThumbsUp, BarChart3, Filter } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { apiFetch } from '@/lib/api/httpClient';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';

// Zod Schema for Review Submission
const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5.'),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  comment: z.string().min(20, 'Comment must be at least 20 characters.'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Review { 
  id: number;
  userId: number;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpfulCount: number;
} 

interface ReviewData {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

/**
 * Enhanced Review Section with professional design and responsive layout
 */
export function ReviewSection({ productId }: { productId: number }) {
  const queryClient = useQueryClient();
  const { isLoggedIn, user } = useAuth();
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch Reviews
  const { data, isLoading, isError } = useQuery<ReviewData>({
    queryKey: ['reviews', productId],
    queryFn: () => apiFetch(`/reviews/${productId}`),
  });

  const reviews = data?.reviews || [];
  const averageRating = data?.averageRating || 0;
  const reviewCount = data?.reviewCount || 0;

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: '', comment: '' },
  });

  // Review Submission Mutation
  const reviewMutation = useMutation({
    mutationFn: (newReview: ReviewFormData) => {
      return apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ ...newReview, productId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      toast.success("Review submitted successfully! It will appear after moderation.");
      form.reset({ rating: 5, title: '', comment: '' });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Could not submit review. Please try again.");
    },
  });
  
  // Helpful Vote Mutation
  const helpfulMutation = useMutation({
    mutationFn: (reviewId: number) => {
      return apiFetch(`/reviews/${reviewId}/helpful`, {
        method: 'POST',
        body: JSON.stringify({ action: 'increment' }),
      });
    },
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: ['reviews', productId] });

      const previousReviewData = queryClient.getQueryData<ReviewData>(['reviews', productId]);

      if (previousReviewData) {
        queryClient.setQueryData<ReviewData>(['reviews', productId], {
          ...previousReviewData,
          reviews: previousReviewData.reviews.map(review => 
            review.id === reviewId 
              ? { ...review, helpfulCount: review.helpfulCount + 1 } 
              : review
          )
        });
      }
      return { previousReviewData };
    },
    onError: (err, reviewId, context) => {
      if (context?.previousReviewData) {
        queryClient.setQueryData(['reviews', productId], context.previousReviewData);
      }
      toast.error("Failed to register vote.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  const handleVoteHelpful = (reviewId: number) => {
    if (!isLoggedIn) {
      toast.warning('You must be logged in to vote.');
      return;
    }
    if (helpfulMutation.isPending) return; 

    helpfulMutation.mutate(reviewId);
  };

  const onSubmit = (data: ReviewFormData) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to submit a review.");
      return;
    }
    reviewMutation.mutate(data);
  };
  
  const hasReviewed = reviews.some(r => r.userId === user?.id);

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution.reverse(); // [5★, 4★, 3★, 2★, 1★]
  }, [reviews]);

  // Filter reviews by rating
  const filteredReviews = useMemo(() => {
    if (filterRating === null) return reviews;
    return reviews.filter(r => r.rating === filterRating);
  }, [reviews, filterRating]);

  return (
    <div className="space-y-8">
      
      {/* Rating Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Average Rating Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center space-y-4">
            <div className="space-y-2">
              <div className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
              <StarRating rating={averageRating} size={24} className="justify-center" />
              <p className="text-sm text-muted-foreground">
                Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            <Separator />

            {/* Write Review Button */}
            {!hasReviewed && (
              <Button 
                onClick={() => setShowForm(!showForm)} 
                className="w-full"
                variant={showForm ? "outline" : "default"}
              >
                {showForm ? "Cancel" : "Write a Review"}
              </Button>
            )}
            {hasReviewed && (
              <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                You reviewed this product
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h4 className="font-semibold text-lg mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Rating Distribution
            </h4>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating, index) => {
                const count = ratingDistribution[index];
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                
                return (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted",
                      filterRating === rating && "bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Form - Collapsible */}
      {showForm && !hasReviewed && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <h4 className="font-semibold text-lg mb-4">Share Your Experience</h4>
            <ReviewForm 
              form={form} 
              onSubmit={onSubmit} 
              isPending={reviewMutation.isPending} 
              isLoggedIn={isLoggedIn} 
            />
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-xl font-bold">
            Customer Reviews {filterRating && `(${filterRating} Star)`}
          </h3>
          {filterRating && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filter
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Frown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground mb-2">
                {filterRating 
                  ? `No ${filterRating}-star reviews yet` 
                  : "No reviews yet"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {filterRating 
                  ? "Try selecting a different rating filter" 
                  : "Be the first to share your thoughts about this product!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size={16} />
                          <Badge variant={review.rating >= 4 ? "default" : "secondary"}>
                            {review.rating}.0
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-lg">{review.title}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <button 
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:cursor-wait"
                        onClick={() => handleVoteHelpful(review.id)}
                        disabled={helpfulMutation.isPending}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({review.helpfulCount || 0})</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Review Form Component
 */
function ReviewForm({ form, onSubmit, isPending, isLoggedIn }: any) {
  const [tempRating, setTempRating] = useState(5);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Rating Selector */}
        <FormField 
          name="rating" 
          control={form.control} 
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Rating *</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => field.onChange(starValue)}
                        onMouseEnter={() => setTempRating(starValue)}
                        onMouseLeave={() => setTempRating(field.value)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={cn(
                            "transition-colors",
                            starValue <= (tempRating || field.value) 
                              ? "fill-amber-400 text-amber-400" 
                              : "text-gray-300 hover:text-gray-400"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {field.value} {field.value === 1 ? 'Star' : 'Stars'}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        {/* Title Input */}
        <FormField 
          name="title" 
          control={form.control} 
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Review Title *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Summarize your experience in a few words" 
                  {...field} 
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        {/* Comment Textarea */}
        <FormField 
          name="comment" 
          control={form.control} 
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Your Review *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share your thoughts about the fragrance, longevity, scent profile, and overall experience..." 
                  rows={5} 
                  {...field}
                  className="resize-none"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 20 characters ({field.value.length}/20)
              </p>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-11 text-base font-semibold" 
          disabled={isPending || !isLoggedIn}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" /> 
              Submit Review
            </>
          )}
        </Button>

        {!isLoggedIn && (
          <p className="text-sm text-amber-600 text-center">
            You must be logged in to submit a review
          </p>
        )}
      </form>
    </Form>
  );
}