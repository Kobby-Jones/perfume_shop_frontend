// components/auth/LoginForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthLayout } from './AuthLayout';

// Define the schema for login validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login form component.
 */
export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    // NOTE: Replace with actual authentication API call (e.g., /api/login)
    console.log("Login attempt:", data);
    // On success: redirect to /account
  };

  return (
    <AuthLayout title="Welcome Back">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input placeholder="you@example.com" type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input placeholder="••••••••" type="password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <div className="flex justify-end text-sm">
            <Link href="/account/forgot-password" className="text-primary hover:underline transition-colors">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm text-foreground/70">
        Don't have an account?{' '}
        <Link href="/account/register" className="text-primary hover:underline font-medium">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}