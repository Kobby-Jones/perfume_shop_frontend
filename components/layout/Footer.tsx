// components/layout/Footer.tsx

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  CreditCard,
  Shield,
  Truck,
  Award
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

/**
 * Data structure for the footer navigation columns.
 */
const footerLinks = [
  {
    title: 'Shop',
    links: [
      { name: 'All Products', href: '/shop' },
      { name: 'Best Sellers', href: '/shop?tag=bestseller' },
      { name: 'Gift Sets', href: '/shop?tag=gifts' },
      { name: 'New Arrivals', href: '/shop?tag=new' },
      { name: 'Sale', href: '/shop?tag=sale' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/info/about' },
      { name: 'Our Story', href: '/info/about#story' },
      { name: 'Contact', href: '/info/contact' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { name: 'FAQ', href: '/info/faq' },
      { name: 'Shipping & Delivery', href: '/info/shipping' },
      { name: 'Returns & Refunds', href: '/info/returns' },
      { name: 'Track Order', href: '#' },
      { name: 'Scent Guide', href: '#' },
    ],
  },
];

const trustBadges = [
  { icon: Shield, text: 'Secure Payment' },
  { icon: Truck, text: 'Free Shipping' },
  { icon: Award, text: '100% Authentic' },
  { icon: CreditCard, text: 'Easy Returns' },
];

/**
 * Renders the main application footer with navigation links, newsletter signup,
 * trust badges, contact info, and social icons. Production-ready design.
 */
export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <footer className="mt-16 border-t border-border bg-gradient-to-b from-muted/30 to-muted/60">
      {/* Trust Badges Section */}
      <div className="border-b border-border bg-white/50 backdrop-blur-sm">
        <div className="container px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trustBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <div key={index} className="flex items-center gap-2 md:gap-3 group">
                  <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-foreground">{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container px-4 sm:px-6 lg:px-8 pt-10 md:pt-12 pb-6 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">
            <Link href="/" className="inline-block group">
              <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-[0.18em] flex font-sans">
                <span className="text-primary group-hover:text-primary/80 transition-colors">Scent</span>
                <span className="text-black ml-1 relative group-hover:text-foreground/80 transition-colors">
                  Haven
                  <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-primary group-hover:bg-primary/80 transition-colors"></span>
                </span>
              </h2>
            </Link>
            
            <p className="text-sm text-foreground/70 max-w-sm leading-relaxed">
              Curating the world's finest scents for the discerning individual. 
              Handcrafted luxury, sustainably sourced, and ethically produced.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h3 className="text-sm md:text-base font-semibold text-foreground">
                Join Our Newsletter
              </h3>
              <p className="text-xs md:text-sm text-foreground/60">
                Get exclusive offers, fragrance tips, and early access to new launches.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white text-sm"
                  disabled={isSubmitting}
                  required
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="flex-shrink-0"
                  disabled={isSubmitting}
                >
                  <Send className={`h-4 w-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                </Button>
              </form>
              {submitStatus === 'success' && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Successfully subscribed!
                </p>
              )}
              <p className="text-xs text-foreground/50">
                By subscribing, you agree to our Privacy Policy.
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-foreground mb-3">Contact Us</h3>
              <div className="flex items-start gap-2 text-xs md:text-sm text-foreground/70 hover:text-primary transition-colors group">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary group-hover:scale-110 transition-transform" />
                <span>123 Fragrance Ave, Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-foreground/70 hover:text-primary transition-colors group">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary group-hover:scale-110 transition-transform" />
                <a href="tel:+233503580927" className="hover:underline">
                  +233 50 358 0927
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-foreground/70 hover:text-primary transition-colors group">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary group-hover:scale-110 transition-transform" />
                <a href="mailto:info@scenthaven.com" className="hover:underline">
                  info@scenthaven.com
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-base font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs md:text-sm text-foreground/70 hover:text-primary transition-all inline-block hover:translate-x-1 duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-6 md:my-8 bg-border/50" />

        {/* Bottom Row: Social Icons, Payment Methods, and Legal Links */}
        <div className="space-y-5 md:space-y-6">
          {/* Social Media & Payment Methods */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-5 md:gap-6">
            {/* Social Media Icons */}
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium text-foreground/70 mr-2">Follow Us:</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all"
                aria-label="Email"
                asChild
              >
                <a href="mailto:info@scenthaven.com">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all"
                aria-label="Instagram"
                asChild
              >
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all"
                aria-label="Twitter"
                asChild
              >
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all"
                aria-label="Facebook"
                asChild
              >
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Payment Methods - Mobile Money */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <span className="text-xs md:text-sm text-foreground/60 font-medium">We Accept:</span>
              <div className="flex gap-2 flex-wrap justify-center">
                {/* MTN Mobile Money */}
                <div className="relative px-3 md:px-4 py-2 md:py-2.5 bg-[#FFCC00] rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFCC00] to-[#FFB800] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <span className="text-[10px] md:text-xs font-bold text-black/90">MTN</span>
                    <span className="text-[8px] md:text-[10px] font-semibold text-black/70">MoMo</span>
                  </div>
                </div>
                
                {/* Telecel Cash */}
                <div className="relative px-3 md:px-4 py-2 md:py-2.5 bg-[#E31E24] rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24] to-[#C41E1E] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <span className="text-[10px] md:text-xs font-bold text-white">Telecel</span>
                    <span className="text-[8px] md:text-[10px] font-semibold text-white/90">Cash</span>
                  </div>
                </div>
                
                {/* AirtelTigo Cash */}
                <div className="relative px-3 md:px-4 py-2 md:py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#E31E24]"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#0066CC]"></div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#C41E1E]"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#0052A3]"></div>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <span className="text-[10px] md:text-xs font-bold text-white drop-shadow-sm">AirtelTigo</span>
                    <span className="text-[8px] md:text-[10px] font-semibold text-white/95 drop-shadow-sm">Cash</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright and Policy Links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 pt-4 border-t border-border/50">
            <p className="text-xs md:text-sm text-foreground/60">
              &copy; {new Date().getFullYear()} Scent Haven. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 gap-y-2 text-xs md:text-sm text-foreground/60">
              <Link href="/info/terms" className="hover:text-primary transition-colors hover:underline">
                Terms & Conditions
              </Link>
              <Link href="/info/privacy" className="hover:text-primary transition-colors hover:underline">
                Privacy Policy
              </Link>
              <Link href="/info/cookies" className="hover:text-primary transition-colors hover:underline">
                Cookie Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors hover:underline">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}