// app/info/privacy/page.tsx

import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Shield, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 2024";
  
  return (
    <InfoPageLayout title="Privacy Policy">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Your Privacy Matters</AlertTitle>
        <AlertDescription>
          Last updated: {lastUpdated}. We are committed to protecting your personal information.
        </AlertDescription>
      </Alert>

      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        
        <h3 className="text-xl font-semibold mb-2 mt-4">1.1 Personal Information</h3>
        <p>When you create an account or place an order, we collect:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Name and contact information (email, phone number)</li>
          <li>Shipping and billing addresses</li>
          <li>Payment information (processed securely by Paystack)</li>
          <li>Order history and preferences</li>
        </ul>

        <h3 className="text-xl font-semibold mb-2 mt-4">1.2 Automatically Collected Information</h3>
        <p>We automatically collect:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Device information (IP address, browser type)</li>
          <li>Usage data (pages visited, time spent)</li>
          <li>Cookie data (see our Cookie Policy)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p>We use your data to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Process and fulfill your orders</li>
          <li>Communicate order updates and customer service</li>
          <li>Improve our website and services</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Detect and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">3. Data Sharing & Third Parties</h2>
        <p>We share your information only with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Paystack:</strong> For secure payment processing (Ghana)</li>
          <li><strong>Supabase:</strong> For secure data storage and file hosting</li>
          <li><strong>Shipping partners:</strong> To deliver your orders</li>
          <li><strong>Legal authorities:</strong> When required by law</li>
        </ul>
        <p className="mt-4">
          We <strong>never sell</strong> your personal information to third parties.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p>
          We implement industry-standard security measures including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>SSL/TLS encryption for all data transmission</li>
          <li>Secure token-based authentication</li>
          <li>Regular security audits and updates</li>
          <li>PCI-compliant payment processing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights (GDPR & Ghana DPA)</h2>
        <p>Under applicable data protection laws, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Correct inaccurate information</li>
          <li><strong>Erasure:</strong> Request deletion of your account</li>
          <li><strong>Portability:</strong> Receive your data in a structured format</li>
          <li><strong>Objection:</strong> Opt-out of marketing communications</li>
          <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide services to you</li>
          <li>Comply with legal obligations (e.g., tax records - 7 years)</li>
          <li>Resolve disputes and enforce agreements</li>
        </ul>
        <p className="mt-4">
          You may request deletion of your account data at any time by contacting us.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Cookies & Tracking</h2>
        <p>
          We use cookies and similar technologies to enhance your experience. 
          See our <a href="/info/cookies" className="text-primary hover:underline">Cookie Policy</a> for details.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
        <p>
          Our services are not intended for individuals under 18 years of age. 
          We do not knowingly collect data from children.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">9. International Transfers</h2>
        <p>
          Your data may be transferred to and processed in countries outside Ghana. 
          We ensure adequate safeguards are in place for such transfers.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of 
          significant changes via email or website notice.
        </p>
      </section>

      <section className="bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Mail className="mr-2" />
          Contact Us
        </h2>
        <p>
          For privacy-related questions or to exercise your rights, contact us:
        </p>
        <ul className="mt-4 space-y-2">
          <li><strong>Email:</strong> privacy@scentia.com</li>
          <li><strong>Phone:</strong> +233 123 456 789</li>
          <li><strong>Address:</strong> 123 Fragrance Ave, Accra, Ghana</li>
        </ul>
      </section>
    </InfoPageLayout>
  );
}