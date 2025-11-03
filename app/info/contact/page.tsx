// app/info/contact/page.tsx

import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Mail, Phone, MapPin } from 'lucide-react';

/**
 * Contact Us Page (Simplified Stub).
 */
export default function ContactPage() {
  return (
    <InfoPageLayout title="Get In Touch">
        <p className="text-xl font-medium text-center pb-4">We are here to help you find your perfect scent.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-4">
            <div className="space-y-2 border p-6 rounded-lg shadow-sm">
                <Mail className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm">support@scentia.com</p>
                <p className="text-xs text-foreground/60">We aim to respond within 24 hours.</p>
            </div>
            <div className="space-y-2 border p-6 rounded-lg shadow-sm">
                <Phone className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Phone Inquiries</h3>
                <p className="text-sm">+1 (555) 123-4567</p>
                <p className="text-xs text-foreground/60">Mon - Fri, 9am - 5pm EST.</p>
            </div>
            <div className="space-y-2 border p-6 rounded-lg shadow-sm">
                <MapPin className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Head Office</h3>
                <p className="text-sm">100 Perfume Blvd, Scentville, CA 90210</p>
                <p className="text-xs text-foreground/60">Visits by appointment only.</p>
            </div>
        </div>
    </InfoPageLayout>
  );
}