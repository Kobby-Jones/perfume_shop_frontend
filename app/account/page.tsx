// app/account/page.tsx

'use client';

import { AccountLayout } from '@/components/account/AccountLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Award, 
  TrendingUp,
  ShoppingBag,
  User,
  Mail,
  Calendar,
  Clock,
  ChevronRight,
  Star,
  Gift,
  Sparkles,
  Bell
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';

/**
 * User Dashboard Overview Page with rich features and modern UI
 */
export default function AccountDashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    rewardPoints: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user stats and recent orders
    const fetchDashboardData = async () => {
      try {
        // Replace with actual API calls
        // const statsRes = await fetch('/api/user/stats');
        // const ordersRes = await fetch('/api/user/orders/recent');
        
        // Mock data for now
        setTimeout(() => {
          setStats({
            totalOrders: 12,
            totalSpent: 1847.50,
            wishlistItems: 8,
            rewardPoints: 450,
          });
          
          setRecentOrders([
            {
              id: 'ORD-1001',
              date: '2024-11-05',
              status: 'Delivered',
              total: 189.50,
              items: 3,
              image: '/placeholder-perfume.jpg',
            },
            {
              id: 'ORD-0998',
              date: '2024-10-28',
              status: 'Shipped',
              total: 245.00,
              items: 2,
              image: '/placeholder-perfume.jpg',
            },
          ]);
          
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  const userName = user?.name || 'Valued Customer';
  const userEmail = user?.email || '';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2023';


  const statusColors: Record<string, string> = {
    Delivered: 'bg-green-100 text-green-800 border-green-200',
    Shipped: 'bg-blue-100 text-blue-800 border-blue-200',
    Processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  if (isLoading) {
    return (
      <AccountLayout>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
            <p className="text-muted-foreground">Manage your orders, wishlist, and account settings</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Orders */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 text-purple-600" />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <Sparkles className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">GHS {stats.totalSpent.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>

        {/* Wishlist */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-red-600" />
              <Badge variant="secondary">{stats.wishlistItems}</Badge>
            </div>
            <p className="text-2xl font-bold">{stats.wishlistItems}</p>
            <p className="text-sm text-muted-foreground">Wishlist Items</p>
          </CardContent>
        </Card>

        {/* Reward Points */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-8 w-8 text-amber-600" />
              <Gift className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.rewardPoints}</p>
            <p className="text-sm text-muted-foreground">Reward Points</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Info */}
        <Card className="lg:col-span-1 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Account Info</CardTitle>
            </div>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{userEmail}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{memberSince}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Account Tier</p>
                  <Badge className="mt-1 bg-gradient-to-r from-amber-500 to-orange-500">
                    Gold Member
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <Link href="/account/settings" className="block">
              <Button className="w-full gap-2 group">
                Update Profile
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </div>
              </div>
              <Link href="/account/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Link href="/shop">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">Order #{order.id}</p>
                          <Badge className={`${statusColors[order.status]} border`}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(order.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric' 
                            })}
                          </span>
                          <span>{order.items} items</span>
                        </div>
                      </div>
                      <p className="text-lg font-bold">GHS {order.total.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <Link href={`/account/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          View Details
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                      {order.status === 'Delivered' && (
                        <Button variant="ghost" size="sm">
                          Buy Again
                        </Button>
                      )}
                      {order.status === 'Shipped' && (
                        <Button variant="ghost" size="sm">
                          Track Order
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Promotional Banner */}
      <Card className="mt-6 border-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white overflow-hidden">
        <CardContent className="py-8 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-6 w-6" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Exclusive Offer
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-2">Redeem Your Reward Points!</h3>
            <p className="mb-4 text-white/90">
              You have {stats.rewardPoints} points. Use them to get exclusive discounts on your next purchase.
            </p>
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Explore Rewards
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </AccountLayout>
  );
}