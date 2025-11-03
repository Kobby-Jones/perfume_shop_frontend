// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/lib/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Scentia | Luxury Perfume Shop",
  description: "A modern, mobile-first e-commerce frontend built with Next.js and Tailwind CSS.",
};

/**
 * Root layout component for the entire application.
 * Wraps all pages with necessary HTML structure, providers, Header, and Footer.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable
      )}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            {/* FIXED: Added container, mx-auto, and responsive padding for horizontal breathing space */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
              <Toaster />
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}