// app/account/auth/reset-password/page.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/httpClient';

// Schema for password reset validation
const resetPasswordSchema = z.object({
    password: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'], // Set the error message on the confirmPassword field
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Reset Password Page: User enters a new password using a token from the URL.
 */
export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    const mutation = useMutation({
        mutationFn: (data: ResetPasswordFormData) => {
            if (!token) throw new Error('Missing reset token.');
            
            return apiFetch('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    token,
                    newPassword: data.password,
                }),
            });
        },
        onSuccess: (data) => {
            toast.success('Password Successfully Reset', {
                description: data.message || 'You can now sign in with your new password.',
            });
            router.push('/account/auth/login');
        },
        onError: (error: any) => {
            toast.error('Password Reset Failed', {
                description: error.message || 'The token may be invalid or expired. Please try requesting a new link.',
            });
        },
    });

    const onSubmit = (data: ResetPasswordFormData) => {
        mutation.mutate(data);
    };
    
    if (!token) {
        return (
            <AuthLayout title="Invalid Request">
                <p className="text-center text-red-500">
                    Missing password reset token. Please check your email link or request a new reset.
                </p>
                <Button variant="link" onClick={() => router.push('/account/auth/forgot-password')} className="w-full mt-4">
                    Request New Reset Link
                </Button>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Set New Password">
            <p className="text-sm text-center text-foreground/70 mb-4">
                Enter and confirm your new password below.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="••••••••" 
                                        type="password" 
                                        {...field} 
                                        disabled={mutation.isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="••••••••" 
                                        type="password" 
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
                                Resetting...
                            </>
                        ) : (
                            <>
                                <Key className="mr-2 h-4 w-4" />
                                Reset Password
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </AuthLayout>
    );
}