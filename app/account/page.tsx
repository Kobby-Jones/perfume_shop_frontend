// app/account/page.tsx

'use client';

import { AccountLayout } from '@/components/account/AccountLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * User Dashboard Overview Page.
 * Displays quick links, recent order summary, and account status.
 */
export default function AccountDashboardPage() {
  // Mock User Data
  const userName = "Jane Doe";
  const userEmail = "jane.doe@scentia.com";
  const mockRecentOrder = { id: 1001, date: '2024-10-20', status: 'Shipped', total: 189.50 };

  return (
    <AccountLayout>
      <h2 className="text-2xl font-bold mb-6">Welcome, {userName}!</h2>
      
      {/* Account Info Card */}
      <Card className="mb-8 border-l-4 border-accent">
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Manage your profile and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p className="font-semibold">Email: <span className="font-normal text-foreground/70">{userEmail}</span></p>
            <p className="font-semibold">Member Since: <span className="font-normal text-foreground/70">October 2023</span></p>
            <Link href="/account/settings">
                <Button variant="link" className="p-0 pt-2">Update Profile</Button>
            </Link>
        </CardContent>
      </Card>

      {/* Recent Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Order</CardTitle>
          <CardDescription>Order #{mockRecentOrder.id} placed on {mockRecentOrder.date}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold mb-3">Total: ${mockRecentOrder.total.toFixed(2)}</p>
          <p className="text-sm font-medium text-green-600 mb-4">Status: {mockRecentOrder.status}</p>
          <div className="flex space-x-4">
            <Link href="/account/orders/1001">
                <Button size="sm">View Details</Button>
            </Link>
            <Link href="/account/orders">
                <Button size="sm" variant="outline">View All Orders</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

    </AccountLayout>
  );
}