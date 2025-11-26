import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CartItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-border">
      {/* Image and name */}
      <div className="flex items-center w-full sm:w-1/2">
        <Skeleton className="w-20 h-20 rounded-md" />
        <div className="ml-4 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex w-full sm:w-1/2 justify-between items-center mt-3 sm:mt-0">
        <Skeleton className="h-8 w-28" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="container py-6 md:py-10">
      <Skeleton className="h-9 w-64 mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-0">
          {[1, 2, 3].map((i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
        
        {/* Summary card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-12 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}