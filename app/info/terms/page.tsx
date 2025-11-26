import { Metadata } from 'next';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Scentia',
  description: 'Read our terms and conditions for using Scentia.',
};

export default function TermsPage() {
  return (
    <InfoPageLayout title="Terms & Conditions">
      <div className="prose prose-gray max-w-none">
        <p className="lead">
          Please read these terms and conditions carefully before using our website 
          and services.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using the Scentia website, you accept and agree to be bound 
          by these Terms and Conditions. If you do not agree to these terms, please do 
          not use our website.
        </p>

        <h2>2. Use of Website</h2>
        <p>
          You agree to use this website only for lawful purposes and in a way that does 
          not infringe the rights of others or restrict their use of the website.
        </p>

        <h2>3. Products and Pricing</h2>
        <ul>
          <li>All prices are displayed in Ghana Cedis (GHS) and include applicable taxes</li>
          <li>We reserve the right to modify prices without prior notice</li>
          <li>Product availability is subject to change</li>
          <li>We strive to display accurate product images and descriptions</li>
        </ul>

        <h2>4. Orders and Payment</h2>
        <ul>
          <li>All orders are subject to acceptance and availability</li>
          <li>Payment must be made in full at the time of ordering</li>
          <li>We accept payments through Paystack (mobile money, cards)</li>
          <li>We reserve the right to refuse or cancel any order</li>
        </ul>

        <h2>5. Shipping and Delivery</h2>
        <p>
          Please refer to our <a href="/info/shipping">Shipping Policy</a> for detailed 
          information about delivery times and costs.
        </p>

        <h2>6. Returns and Refunds</h2>
        <p>
          Please refer to our <a href="/info/returns">Returns & Refunds Policy</a> for 
          detailed information about our return process.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          All content on this website, including text, images, logos, and graphics, is 
          the property of Scentia and is protected by copyright laws. You may not 
          reproduce, distribute, or use any content without our written permission.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          Scentia shall not be liable for any indirect, incidental, or consequential 
          damages arising from your use of our website or products.
        </p>

        <h2>9. Privacy</h2>
        <p>
          Your use of our website is also governed by our <a href="/info/privacy">Privacy Policy</a>.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right to update these terms at any time. Continued use of the 
          website after changes constitutes acceptance of the new terms.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about these Terms & Conditions, please contact us 
          through our <a href="/info/contact">Contact Page</a>.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Last updated: November 2025
        </p>
      </div>
    </InfoPageLayout>
  );
}