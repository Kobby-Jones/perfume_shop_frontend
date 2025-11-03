// app/account/forgot-password/page.tsx

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Forgot Password Page route (Stub).
 */
export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Reset Password">
      <p className="text-sm text-center text-foreground/70 mb-4">
        Enter your email address to receive a password reset link.
      </p>
      <div className="space-y-4">
        <Input placeholder="Email Address" type="email" />
        <Button className="w-full">Send Reset Link</Button>
      </div>
      <div className="mt-6 text-center">
        <Button variant="link" asChild>
          <Link href="/account/login">Back to Login</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
