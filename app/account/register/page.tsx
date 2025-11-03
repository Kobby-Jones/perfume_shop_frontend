// app/account/register/page.tsx

// NOTE: For brevity, we reuse LoginForm UI structure but assume register form is here.
import { AuthLayout } from '@/components/auth/AuthLayout'; 
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Register Page route (Simplified Stub).
 */
export default function RegisterPage() {
  // In a real application, you would create a dedicated RegisterForm component 
  // with name, email, password, and confirmation fields, similar to LoginForm.
  return (
    <AuthLayout title="Join Scentia">
        <div className="space-y-4">
            <Input placeholder="Full Name" />
            <Input placeholder="Email Address" type="email" />
            <Input placeholder="Password" type="password" />
            <Button className="w-full">Create Account</Button>
        </div>
        <div className="mt-6 text-center text-sm text-foreground/70">
            Already have an account?{' '}
            <Link href="/account/login" className="text-primary hover:underline font-medium">
                Sign In
            </Link>
        </div>
    </AuthLayout>
  );
}