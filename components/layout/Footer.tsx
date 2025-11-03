// components/layout/Footer.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Twitter, Instagram, Facebook, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

/**
 * Data structure for the footer navigation columns.
 */
const footerLinks = [
  {
    title: 'Shop',
    links: [
      { name: 'All Products', href: '/shop' },
      { name: 'Gift Sets', href: '/shop?tag=gifts' },
      { name: 'New Arrivals', href: '/shop?tag=new' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/info/about' },
      { name: 'Contact', href: '/info/contact' },
      { name: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Help',
    links: [
      { name: 'FAQ', href: '/info/faq' },
      { name: 'Shipping', href: '/info/shipping' },
      { name: 'Returns', href: '/info/returns' },
    ],
  },
];

/**
 * Renders the main application footer with navigation links, legal text, and social icons.
 * Uses a responsive grid for mobile and desktop layout.
 */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-secondary pt-10 pb-6 text-foreground/80">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* --- Main Footer Links Grid --- */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Logo/Branding Column (Desktop View) */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2 space-y-4">
            <Link href="/">
                <h2 className="text-3xl font-serif font-bold tracking-widest text-primary">Scentia</h2>
            </Link>
            <p className="text-sm max-w-xs">
              Curating the world's finest scents for the discerning individual. Handcrafted luxury, sustainably sourced.
            </p>
          </div>

          {/* Navigation Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-primary transition-colors block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-border" />

        {/* --- Bottom Row: Social Icons and Legal Links --- */}
        <div className="flex flex-col-reverse justify-between gap-4 md:flex-row md:items-center">
          {/* Copyright and Policy Links */}
          <div className="text-sm text-foreground/60 space-y-2 md:space-y-0">
            <p className="mb-2">&copy; {new Date().getFullYear()} Scentia Perfumes. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/info/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
              <Link href="/info/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" aria-label="Email">
                <Mail className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}