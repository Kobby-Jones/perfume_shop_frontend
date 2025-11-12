// app/account/forgot-password/page.tsx

'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/httpClient';

// Schema for forgot password validation
const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password Page route.
 */
export default function ForgotPasswordPage() {
    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const mutation = useMutation({
        mutationFn: (data: ForgotPasswordFormData) => {
            return apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        onSuccess: (data) => {
            toast.success('Request Sent', {
                description: data.message || 'If your account exists, a reset link has been sent to your email.',
            });
            form.reset();
        },
        onError: (error: any) => {
            toast.error('Request Failed', {
                description: error.message || 'Could not process your request. Please try again.',
            });
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        mutation.mutate(data);
    };

    return (
        <AuthLayout title="Reset Password">
            <p className="text-sm text-center text-foreground/70 mb-4">
                Enter your email address to receive a secure password reset link.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="you@example.com" 
                                        type="email" 
                                        {...field} 
                                        disabled={mutation.isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Reset Link
                            </>
                        )}
                    </Button>
                </form>
            </Form>
            <div className="mt-6 text-center">
                <Button variant="link" asChild>
                    <Link href="/account/auth/login">Back to Login</Link>
                </Button>
            </div>
        </AuthLayout>
    );
}