// app/account/orders/page.tsx

'use client';

import { AccountLayout } from '@/components/account/AccountLayout';
import { OrderHistoryList } from '@/components/account/OrderHistory';

/**
 * Order History Page route.
 */
export default function OrderHistoryPage() {
  // NOTE: In a complete project, there would also be /account/orders/[id]/page.tsx 
  // for the specific Order Detail Page.
  return (
    
      <OrderHistoryList />
  );
}