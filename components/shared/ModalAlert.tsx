// components/shared/ModalAlert.tsx

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'success' | 'error' | 'info' | 'warning';

interface AlertState {
  open: boolean;
  title: string;
  message: string;
  variant: AlertVariant;
}

interface AlertContextType {
  alert: (state: { title: string; message: string; variant?: AlertVariant }) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// --- Component Helpers ---

const getVariantProps = (variant: AlertVariant) => {
  switch (variant) {
    case 'success':
      return { icon: CheckCircle, titleClass: 'text-green-600', buttonClass: 'bg-green-600 hover:bg-green-700' };
    case 'error':
      return { icon: XCircle, titleClass: 'text-red-600', buttonClass: 'bg-red-600 hover:bg-red-700' };
    case 'warning':
      return { icon: AlertTriangle, titleClass: 'text-yellow-600', buttonClass: 'bg-yellow-600 hover:bg-yellow-700' };
    case 'info':
    default:
      return { icon: Info, titleClass: 'text-primary', buttonClass: 'bg-primary hover:bg-primary/90' };
  }
};

/**
 * Global Alert Modal Component (Replaces Toast for better branding/UX)
 */
export function GlobalAlertModal({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const closeModal = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  const alert = useCallback((state: { title: string; message: string; variant?: AlertVariant }) => {
    setAlertState({
      open: true,
      title: state.title,
      message: state.message,
      variant: state.variant || 'info',
    });
  }, []);

  const { icon: Icon, titleClass, buttonClass } = getVariantProps(alertState.variant);

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      
        <Dialog
            open={alertState.open}
            onOpenChange={(open) => setAlertState((prev) => ({ ...prev, open }))}
            >
        <DialogContent className="sm:max-w-[425px] border-t-8 border-primary rounded-lg shadow-2xl">
          <DialogHeader className="flex flex-col items-center pt-4">
            <Icon className={cn('h-10 w-10 mb-3', titleClass)} />
            <DialogTitle className={cn('text-2xl font-bold', titleClass)}>
              {alertState.title}
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2 text-foreground/80">
              {alertState.message}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button onClick={closeModal} className={cn('w-full', buttonClass)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AlertContext.Provider>
  );
}

/**
 * Hook to trigger the global alert modal.
 */
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within a GlobalAlertModal');
  }
  return context;
};