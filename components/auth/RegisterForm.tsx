// components/auth/RegisterForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, Phone } from 'lucide-react';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthLayout } from './AuthLayout';

// --- Validations ---
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  // Basic regex for Ghana phone numbers (starts with 0 and is 10 digits)
  phoneNumber: z.string().regex(/^0\d{9}$/, { message: "Invalid phone number. Use format 024XXXXXXX" }),
  password: z.string().min(6, { message: "Min 6 characters." }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export function RegisterForm() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  
  // State for Multi-step flow
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [registeredPhone, setRegisteredPhone] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Form 1: Registration ---
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', phoneNumber: '', password: '' },
  });

  // --- Form 2: OTP ---
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Handler: Register
  const onRegisterSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await register(data.name, data.phoneNumber, data.password);
      
      // Success: Move to OTP step
      setRegisteredPhone(data.phoneNumber);
      setStep('otp');
      toast.success('Verification code sent to your phone.');
    } catch (e: any) {
      setError(e.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Verify OTP
  const onOtpSubmit = async (data: OtpFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await verifyOtp(registeredPhone, data.otp);
      
      toast.success('Account verified successfully!');
      if (user?.role === 'admin') router.push('/admin');
      else router.push('/account');
      
    } catch (e: any) {
      setError(e.message || 'Verification failed. Check code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Resend
  const handleResend = async () => {
      try {
          await resendOtp(registeredPhone);
          toast.success('New code sent.');
      } catch (e) {
          toast.error('Failed to resend code.');
      }
  };

  // --- Render Step 1: Register ---
  if (step === 'register') {
    return (
      <AuthLayout title="Create Account">
        <Form {...registerForm}>
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <FormField control={registerForm.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={registerForm.control} name="phoneNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="024XXXXXXX" {...field} className="pl-10" />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={registerForm.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"} 
                      {...field} 
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-foreground/70">
          Already have an account? <Link href="/account/auth/login" className="text-primary hover:underline font-medium">Sign In</Link>
        </div>
      </AuthLayout>
    );
  }

  // --- Render Step 2: OTP ---
  return (
    <AuthLayout title="Verify Phone">
        <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <strong>{registeredPhone}</strong>
            </p>
        </div>

        <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

                <FormField control={otpForm.control} name="otp" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="sr-only">OTP Code</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="Enter 6-digit code" 
                                className="text-center text-2xl tracking-widest h-12" 
                                maxLength={6} 
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Login'}
                </Button>
            </form>
        </Form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
            <button type="button" onClick={handleResend} className="text-primary hover:underline">
                Resend Code
            </button>
            <button type="button" onClick={() => setStep('register')} className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Change Phone Number
            </button>
        </div>
    </AuthLayout>
  );
}