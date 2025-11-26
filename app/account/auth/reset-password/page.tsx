// app/account/auth/reset-password/page.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Key, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react'; // ✅ Add Suspense here

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/httpClient';

const resetPasswordSchema = z.object({
    phoneNumber: z.string().min(10, "Phone number is required"),
    otp: z.string().length(6, "OTP must be 6 digits"),
   newPassword: z
  .string()
  .min(8, { message: "Min 8 characters." })
  .regex(/[A-Z]/, { message: "Must contain an uppercase letter." })
  .regex(/[a-z]/, { message: "Must contain a lowercase letter." })
  .regex(/[0-9]/, { message: "Must contain a number." }),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get('phone') || '';

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { 
            phoneNumber: phoneParam, 
            otp: '', 
            newPassword: '', 
            confirmPassword: '' 
        },
    });

    useEffect(() => {
        if (phoneParam) {
            form.setValue('phoneNumber', phoneParam);
        }
    }, [phoneParam, form]);

    const mutation = useMutation({
        mutationFn: (data: ResetPasswordFormData) => {
            return apiFetch('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    phoneNumber: data.phoneNumber,
                    otp: data.otp,
                    newPassword: data.newPassword,
                }),
            });
        },
        onSuccess: (data) => {
            toast.success('Password Reset Successful', {
                description: 'You can now login with your new password.',
            });
            router.push('/account/auth/login');
        },
        onError: (error: any) => {
            toast.error('Reset Failed', {
                description: error.message || 'Invalid code or expired session.',
            });
        },
    });

    const onSubmit = (data: ResetPasswordFormData) => {
        mutation.mutate(data);
    };

    return (
        <AuthLayout title="Set New Password">
            <p className="text-sm text-center text-foreground/70 mb-4">
                Enter the OTP sent to your phone and your new password.
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
                                    <Input placeholder="024XXXXXXX" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Verification Code (OTP)</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="123456" 
                                        className="tracking-widest text-lg" 
                                        maxLength={6} 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="password" placeholder="••••••••" {...field} className="pl-10"/>
                                    </div>
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
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="password" placeholder="••••••••" {...field} className="pl-10"/>
                                    </div>
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

//  STEP 2: Create new default export that wraps the content with Suspense
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Set New Password">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AuthLayout>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}