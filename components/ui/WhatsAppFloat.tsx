// components/ui/WhatsAppFloat.tsx

'use client';

import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Floating WhatsApp chat button that appears on all pages.
 * Provides quick access to WhatsApp support/contact.
 */
export function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Replace with your actual WhatsApp business number (format: country code + number, no + or spaces)
  const whatsappNumber = '233123456789'; // Example: Ghana number
  const defaultMessage = encodeURIComponent('Hello! I have a question about Scentia Perfumes.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <>
      {/* Tooltip/Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">Scentia Support</h3>
                  <p className="text-xs text-gray-500">Typically replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Hi there! 👋 Have questions about our fragrances? Chat with us on WhatsApp.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#25D366] hover:bg-[#20BD5A] text-white text-center py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              Start Chat
            </a>
          </div>
        </div>
      )}

      {/* Main Float Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group",
          "bg-[#25D366] hover:bg-[#20BD5A]",
          isOpen && "rotate-0 scale-95"
        )}
        aria-label="WhatsApp Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-pulse" />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
          </>
        )}
        
        {/* Ripple Effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
      </button>
    </>
  );
}