import { Metadata } from 'next';
import { InfoPageLayout } from '@/components/layout/InfoPageLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy | Scentia',
  description: 'Learn how we use cookies on our website.',
};

export default function CookiesPage() {
  return (
    <InfoPageLayout title="Cookie Policy">
      <div className="prose prose-gray max-w-none">
        <p className="lead">
          This Cookie Policy explains how Scentia uses cookies and similar technologies 
          when you visit our website.
        </p>

        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files that are stored on your device when you visit 
          a website. They help the website remember your preferences and improve your 
          browsing experience.
        </p>

        <h2>Types of Cookies We Use</h2>

        <h3>Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They enable 
          basic features like page navigation, secure areas access, and shopping cart 
          functionality. The website cannot function properly without these cookies.
        </p>

        <h3>Analytics Cookies</h3>
        <p>
          We use analytics cookies to understand how visitors interact with our website. 
          This helps us improve our website and services. These cookies collect 
          information anonymously.
        </p>

        <h3>Functional Cookies</h3>
        <p>
          These cookies allow the website to remember choices you make (such as your 
          preferred language or region) and provide enhanced, personalized features.
        </p>

        <h3>Marketing Cookies</h3>
        <p>
          These cookies are used to deliver advertisements that are relevant to you. 
          They also help measure the effectiveness of advertising campaigns.
        </p>

        <h2>Managing Cookies</h2>
        <p>
          You can control and manage cookies through your browser settings. Please note 
          that removing or blocking cookies may impact your user experience and some 
          features may no longer be available.
        </p>

        <h2>Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Any changes will be 
          posted on this page with an updated revision date.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Last updated: November 2025
        </p>
      </div>
    </InfoPageLayout>
  );
}