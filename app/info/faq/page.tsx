// app/info/faq/page.tsx

import { InfoPageLayout } from '@/components/layout/InfoPageLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Mock FAQ Data
const faqItems = [
    { 
        question: "What is the difference between EDP and EDT?",
        answer: "EDP (Eau de Parfum) contains a higher concentration of fragrance oils (15-20%), making the scent last longer (typically 6-8 hours). EDT (Eau de Toilette) has a lower concentration (5-15%) and is lighter, lasting around 3-4 hours."
    },
    {
        question: "Do you offer international shipping?",
        answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and estimated delivery times are calculated at checkout based on your location and chosen shipping speed."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day return window for all unused and unopened items. Due to hygiene reasons, we cannot accept returns on fragrances that have been tested or partially used."
    }
];

/**
 * FAQ Page: Uses the Accordion component for a clean, collapsible display of questions.
 */
export default function FAQPage() {
  return (
    <InfoPageLayout title="Frequently Asked Questions">
        <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4 bg-secondary/30">
                    <AccordionTrigger className="font-semibold text-lg hover:no-underline py-4">
                        {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base pb-4">
                        {item.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        <p className="text-base text-center pt-8 text-foreground/70">
            Can't find your answer? Please contact us directly.
        </p>
    </InfoPageLayout>
  );
}