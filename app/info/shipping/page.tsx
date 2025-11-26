import { Metadata } from 'next';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export const metadata: Metadata = {
  title: 'Shipping Information | Scentia',
  description: 'Learn about our shipping options and delivery times.',
};

export default function ShippingPage() {
  return (
    <InfoPageLayout title="Shipping Information">
      <div className="prose prose-gray max-w-none">
        <p className="lead">
          We deliver across Ghana! Here's everything you need to know about our 
          shipping options and delivery times.
        </p>

        <h2>Delivery Areas</h2>
        <p>
          We currently deliver to all regions in Ghana. Delivery times may vary 
          depending on your location.
        </p>

        <h2>Shipping Rates</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th>Order Value</th>
              <th>Shipping Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Under GHS 500</td>
              <td>GHS 20.00</td>
            </tr>
            <tr>
              <td>GHS 500 and above</td>
              <td>FREE</td>
            </tr>
          </tbody>
        </table>

        <h2>Delivery Times</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th>Location</th>
              <th>Estimated Delivery</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Accra & Tema</td>
              <td>1-2 business days</td>
            </tr>
            <tr>
              <td>Kumasi</td>
              <td>2-3 business days</td>
            </tr>
            <tr>
              <td>Other Major Cities</td>
              <td>3-5 business days</td>
            </tr>
            <tr>
              <td>Remote Areas</td>
              <td>5-7 business days</td>
            </tr>
          </tbody>
        </table>

        <h2>Order Processing</h2>
        <p>
          Orders are processed within 24 hours on business days. Orders placed on 
          weekends or holidays will be processed on the next business day.
        </p>

        <h2>Order Tracking</h2>
        <p>
          Once your order is shipped, you will receive an SMS notification with 
          tracking information. You can also track your order status in your 
          account dashboard.
        </p>

        <h2>Delivery Instructions</h2>
        <ul>
          <li>Please ensure someone is available to receive the package</li>
          <li>Provide accurate delivery address and phone number</li>
          <li>Our delivery partner will call before delivery</li>
        </ul>

        <h2>Failed Delivery</h2>
        <p>
          If delivery is unsuccessful due to an incorrect address or unavailability, 
          re-delivery may incur additional charges. Please ensure your contact 
          information is accurate.
        </p>

        <h2>Questions?</h2>
        <p>
          If you have any questions about shipping, please contact us via WhatsApp 
          or visit our <a href="/info/contact">Contact Page</a>.
        </p>
      </div>
    </InfoPageLayout>
  );
}