// components/account/OrderHistory.tsx

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; 

// Mock Order Data
const mockOrders = [
  { id: 1003, date: '2025-10-28', status: 'Processing', total: 112.99, icon: Clock, color: 'bg-accent/20 text-accent-foreground' },
  { id: 1002, date: '2025-10-20', status: 'Shipped', total: 189.50, icon: Truck, color: 'bg-blue-100 text-blue-800' },
  { id: 1001, date: '2025-09-15', status: 'Delivered', total: 55.00, icon: CheckCircle, color: 'bg-green-100 text-green-800' },
];

/**
 * Renders the user's list of past orders with status and summary.
 */
export function OrderHistoryList() {
  // NOTE: In a production setup, this data would be fetched using useQuery.

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold border-b pb-2">Your Orders ({mockOrders.length})</h2>
      
      {mockOrders.map((order) => {
        const Icon = order.icon;
        
        return (
          <Card key={order.id} className="shadow-md transition-shadow duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
              <div className="flex flex-col">
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <p className="text-sm text-foreground/70">Placed on {order.date}</p>
              </div>
              <Badge className={`text-sm font-semibold flex items-center ${order.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex justify-between items-center p-4">
              <p className="text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
              <Link href={`/account/orders/${order.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}

      {/* Placeholder for pagination/infinite scroll */}
      <div className="text-center pt-4">
          <Button variant="ghost">Load More Orders</Button>
      </div>
    </div>
  );
}