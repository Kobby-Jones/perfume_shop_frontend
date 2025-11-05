// components/auth/RegisterForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '@/lib/hooks/useAuth'; // API-integrated hook
import React from 'react';

// Define the schema for registration validation
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Registration form component, integrated with the API useAuth hook.
 */
export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await register(data.name, data.email, data.password);
      // On successful registration, redirect to the user dashboard
      router.push('/account'); 
    } catch (e: any) {
      setError(e.message || 'Registration failed. Try a different email address.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Join Scentia">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm text-foreground/70">
        Already have an account?{' '}
        <Link href="/account/auth/login" className="text-primary hover:underline font-medium">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}