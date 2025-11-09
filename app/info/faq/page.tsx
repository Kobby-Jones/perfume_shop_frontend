// app/info/faq/page.tsx

import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Package, RotateCcw, Shield, Clock, Globe } from 'lucide-react';

// Enhanced FAQ Data with categories and icons
const faqCategories = [
    {
        category: "Products & Fragrances",
        icon: Package,
        items: [
            { 
                question: "What is the difference between EDP and EDT?",
                answer: "EDP (Eau de Parfum) contains a higher concentration of fragrance oils (15-20%), making the scent last longer (typically 6-8 hours). EDT (Eau de Toilette) has a lower concentration (5-15%) and is lighter, lasting around 3-4 hours. EDP is ideal for evening wear and special occasions, while EDT works well for daily wear."
            },
            {
                question: "How should I store my perfumes?",
                answer: "Store your fragrances in a cool, dry place away from direct sunlight and heat sources. Keep them in their original boxes when possible. Avoid storing in the bathroom as humidity and temperature fluctuations can degrade the fragrance quality over time."
            },
            {
                question: "Are your perfumes authentic?",
                answer: "Absolutely. We source all our fragrances directly from authorized distributors and brand partners. Every product comes with authenticity guarantees and original packaging. We never sell counterfeit or diluted products."
            }
        ]
    },
    {
        category: "Shipping & Delivery",
        icon: Globe,
        items: [
            {
                question: "Do you offer international shipping?",
                answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and estimated delivery times are calculated at checkout based on your location and chosen shipping speed. Express shipping options are available for most destinations."
            },
            {
                question: "How long does shipping take?",
                answer: "Domestic orders typically arrive within 3-5 business days. International shipping varies by destination: 7-14 business days for standard shipping, and 3-7 business days for express. You'll receive tracking information once your order ships."
            },
            {
                question: "Do you offer free shipping?",
                answer: "Yes! We offer free standard shipping on all domestic orders over GHS75. Free international shipping is available on orders over GHS150. Promotional free shipping may also be available during special events."
            }
        ]
    },
    {
        category: "Returns & Refunds",
        icon: RotateCcw,
        items: [
            {
                question: "What is your return policy?",
                answer: "We offer a 30-day return window for all unused and unopened items. Due to hygiene reasons, we cannot accept returns on fragrances that have been tested or partially used. Original packaging and proof of purchase are required for all returns."
            },
            {
                question: "How do I initiate a return?",
                answer: "Contact our customer service team through your account dashboard or email us at returns@perfumeshop.com with your order number. We'll provide you with a prepaid return label and detailed instructions within 24 hours."
            },
            {
                question: "When will I receive my refund?",
                answer: "Once we receive and inspect your return, refunds are processed within 5-7 business days. The refund will be issued to your original payment method. Please allow an additional 3-5 business days for your bank to process the transaction."
            }
        ]
    },
    {
        category: "Orders & Payment",
        icon: Shield,
        items: [
            {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are secured with 256-bit SSL encryption for your protection."
            },
            {
                question: "Can I modify or cancel my order?",
                answer: "Orders can be modified or cancelled within 1 hour of placement. After this window, orders enter our fulfillment process and cannot be changed. Please contact customer service immediately if you need to make changes."
            },
            {
                question: "Do you offer gift wrapping?",
                answer: "Yes! We offer complimentary premium gift wrapping for all orders. You can add a personalized gift message at checkout. Our fragrances arrive beautifully packaged in elegant boxes, perfect for any occasion."
            }
        ]
    }
];

/**
 * FAQ Page: Professional design with categorized questions and enhanced UX
 */
export default function FAQPage() {
  return (
    <InfoPageLayout title="Frequently Asked Questions">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about our products, shipping, returns, and more.
            </p>
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input 
                    type="text" 
                    placeholder="Search for answers..." 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => {
                const IconComponent = category.icon;
                return (
                    <div key={categoryIndex} className="space-y-6">
                        {/* Category Header */}
                        <div className="flex items-center gap-3 pb-2 border-b">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">{category.category}</h2>
                        </div>

                        {/* Accordion Items */}
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {category.items.map((item, itemIndex) => (
                                <AccordionItem 
                                    key={itemIndex} 
                                    value={`item-${categoryIndex}-${itemIndex}`} 
                                    className="border rounded-xl px-6 bg-card shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <AccordionTrigger className="font-semibold text-left hover:no-underline py-5 [&[data-state=open]]:text-primary">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pt-1">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                );
            })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border">
            <div className="text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Still have questions?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Our customer support team is here to help. We typically respond within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                        Contact Support
                    </button>
                    <button className="px-6 py-3 rounded-lg border border-input font-semibold hover:bg-accent transition-colors">
                        Live Chat
                    </button>
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                    Available Monday - Friday, 9 AM - 6 PM GMT
                </p>
            </div>
        </div>
    </InfoPageLayout>
  );
}