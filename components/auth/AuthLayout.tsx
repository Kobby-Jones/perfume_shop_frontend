// components/auth/AuthLayout.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Props for the AuthLayout component.
 * @property title - The title for the authentication form (e.g., Login, Register).
 * @property children - The form content to be displayed.
 */
interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

/**
 * A consistent layout wrapper for all authentication forms.
 * Provides branding, card structure, and space for professional messaging.
 */
export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="container py-12 md:py-20 flex justify-center">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-primary/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">{title}</CardTitle>
          <p className="text-sm text-foreground/60">Scentia Account Access</p>
        </CardHeader>
        <CardContent>
          {/* Professional Security Alert */}
          <Alert className="mb-4 border-primary text-primary">
            <Shield className="h-4 w-4" />
            <AlertTitle>Secure Access</AlertTitle>
            <AlertDescription>
              Your personal information is protected with industry-standard encryption.
            </AlertDescription>
          </Alert>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}