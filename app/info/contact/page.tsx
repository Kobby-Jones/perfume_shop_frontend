// app/info/contact/page.tsx

'use client';

import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Enhanced Contact Page with form, multiple contact methods, and FAQ
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Message sent successfully! We\'ll respond within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="outline" className="mb-2">
              We're Here to Help
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Get In Touch
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Have questions about our fragrances? We're here to help you find your perfect scent.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Email */}
          <Card className="text-center hover:shadow-lg transition-shadow border-2">
            <CardContent className="p-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Email Support</h3>
                <a 
                  href="mailto:support@scentia.com" 
                  className="text-sm text-primary hover:underline block"
                >
                  support@scentia.com
                </a>
                <p className="text-xs text-muted-foreground">Response within 24 hours</p>
              </div>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card className="text-center hover:shadow-lg transition-shadow border-2">
            <CardContent className="p-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
                <Phone className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Phone Inquiries</h3>
                <a 
                  href="tel:+15551234567" 
                  className="text-sm text-primary hover:underline block"
                >
                  +233 (555) 123-4567
                </a>
                <p className="text-xs text-muted-foreground">Mon - Fri, 9am - 10pm GMT</p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="text-center hover:shadow-lg transition-shadow border-2">
            <CardContent className="p-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Head Office</h3>
                <p className="text-sm">100 Perfume Blvd<br/>Scentville, CA 90210</p>
                <p className="text-xs text-muted-foreground">By appointment only</p>
              </div>
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card className="text-center hover:shadow-lg transition-shadow border-2">
            <CardContent className="p-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Live Chat</h3>
                <Button variant="outline" size="sm" className="w-full">
                  Start Chat
                </Button>
                <p className="text-xs text-muted-foreground">Available 9am - 9pm EST</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content: Form + Info */}
      <section className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Contact Form - 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Send Us a Message</h2>
                    <p className="text-muted-foreground">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </div>

                  <Separator />

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum 20 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 text-base font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info - 1/3 width */}
          <div className="space-y-6">
            {/* Business Hours */}
            <Card className="border-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Business Hours</h3>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">9am - 5pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10am - 4pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-2">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Quick Links</h3>
                <Separator />
                <div className="space-y-2">
                  <a href="/info/faq" className="block text-sm text-primary hover:underline">
                    → Frequently Asked Questions
                  </a>
                  <a href="/info/shipping" className="block text-sm text-primary hover:underline">
                    → Shipping & Delivery
                  </a>
                  <a href="/info/returns" className="block text-sm text-primary hover:underline">
                    → Returns & Refunds
                  </a>
                  <a href="/shop" className="block text-sm text-primary hover:underline">
                    → Browse Our Collection
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2">
              <CardContent className="p-6 space-y-3 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <h4 className="font-semibold">Fast Response</h4>
                <p className="text-sm text-muted-foreground">
                  We typically respond to inquiries within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-12 md:py-16 border-t">
        <div className="container max-w-4xl">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find answers to common questions before reaching out
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">How long does shipping take?</h4>
                <p className="text-sm text-muted-foreground">
                  Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">What is your return policy?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day return policy for unopened products. Opened fragrances can be returned within 14 days if unsatisfied.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Do you offer samples?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! We offer 2ml samples of most fragrances. You can order up to 5 samples per order at $5 each.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Are your products authentic?</h4>
                <p className="text-sm text-muted-foreground">
                  Absolutely. All our fragrances are 100% authentic and sourced directly from authorized distributors and brands.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <a href="/info/faq">View All FAQs</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}