// components/auth/LoginForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthLayout } from './AuthLayout';

// Schema for login validation
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * LoginForm
 * Handles user authentication via backend API.
 * Displays server errors and redirects based on user role.
 */
export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login(data.email, data.password);
      
      // Extract user role from the response
      // The login function should return the full response including user data
      const userRole = (response as any)?.user?.role || (response as any)?.role;
      
      console.log('Login successful, user role:', userRole); // Debug log
      
      // Role-based redirection
      if (userRole === 'admin') {
        console.log('Redirecting admin to /admin'); // Debug log
        router.push('/admin');
      } else {
        console.log('Redirecting customer to /account'); // Debug log
        router.push('/account');
      }

    } catch (err: any) {
      // Handle API or network errors
      console.error('Login error:', err); // Debug log
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Display API error if any */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end text-sm">
            <Link href="/account/auth/forgot-password" className="text-primary hover:underline transition-colors">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm text-foreground/70">
        Don't have an account?{' '}
        <Link href="/account/auth/register" className="text-primary hover:underline font-medium">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}