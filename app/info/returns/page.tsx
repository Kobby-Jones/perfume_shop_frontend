import { Metadata } from 'next';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export const metadata: Metadata = {
  title: 'Returns & Refunds | Scentia',
  description: 'Learn about our returns and refund policy.',
};

export default function ReturnsPage() {
  return (
    <InfoPageLayout title="Returns & Refunds">
      <div className="prose prose-gray max-w-none">
        <h2>Return Policy</h2>
        <p>
          At Scent Haven, we want you to be completely satisfied with your purchase. 
          If you are not happy with your order, we offer a hassle-free return policy.
        </p>

        <h3>Eligibility</h3>
        <ul>
          <li>Items must be returned within 14 days of delivery</li>
          <li>Products must be unused, unopened, and in original packaging</li>
          <li>Proof of purchase is required</li>
        </ul>

        <h3>Non-Returnable Items</h3>
        <ul>
          <li>Opened or used fragrances</li>
          <li>Gift cards</li>
          <li>Sale items marked as final sale</li>
        </ul>

        <h3>How to Return</h3>
        <ol>
          <li>Contact our customer service via WhatsApp or email</li>
          <li>Provide your order number and reason for return</li>
          <li>Receive return authorization and shipping instructions</li>
          <li>Ship the item back in its original packaging</li>
        </ol>

        <h3>Refunds</h3>
        <p>
          Once we receive and inspect your return, we will process your refund within 
          5-7 business days. Refunds will be credited to your original payment method.
        </p>

        <h3>Exchanges</h3>
        <p>
          If you would like to exchange an item for a different product, please 
          contact us and we will guide you through the process.
        </p>

        <h3>Damaged or Defective Items</h3>
        <p>
          If you receive a damaged or defective item, please contact us immediately 
          with photos of the damage. We will arrange a replacement or full refund 
          at no extra cost to you.
        </p>
      </div>
    </InfoPageLayout>
  );
}