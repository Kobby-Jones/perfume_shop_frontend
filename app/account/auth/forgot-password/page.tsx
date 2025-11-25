// app/account/auth/forgot-password/page.tsx

'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/httpClient';

const forgotPasswordSchema = z.object({
    phoneNumber: z.string().min(10, { message: 'Enter a valid phone number.' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { phoneNumber: '' },
    });

    const mutation = useMutation({
        mutationFn: (data: ForgotPasswordFormData) => {
            return apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        onSuccess: (_, variables) => {
            toast.success('OTP Sent', {
                description: 'Check your phone for the verification code.',
            });
            // Redirect to Reset page with phone number in query param for convenience
            router.push(`/account/auth/reset-password?phone=${variables.phoneNumber}`);
        },
        onError: (error: any) => {
            toast.error('Request Failed', {
                description: error.message || 'Could not process request.',
            });
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        mutation.mutate(data);
    };

    return (
        <AuthLayout title="Reset Password">
            <p className="text-sm text-center text-foreground/70 mb-4">
                Enter your phone number to receive a reset code.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="024XXXXXXX" 
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
                                <Phone className="mr-2 h-4 w-4" />
                                Send Code
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