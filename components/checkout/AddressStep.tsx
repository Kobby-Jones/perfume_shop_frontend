// components/checkout/AddressStep.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, User, Home, Globe, ArrowRight } from 'lucide-react';

const addressSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  street: z.string().min(5, { message: "Street address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  zip: z.string().regex(/^\d{5}$/, { message: "Invalid ZIP code (e.g., 12345)." }),
  country: z.string().min(2, { message: "Country is required." }),
});

type AddressFormData = z.infer<typeof addressSchema>;

export function AddressStep({ nextStep, setData }: { nextStep: () => void, setData: (data: any) => void }) {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: '', lastName: '', street: '', city: '', zip: '', country: 'Ghana'
    },
  });

  const onSubmit = (data: AddressFormData) => {
    setData((prev: any) => ({ ...prev, address: data }));
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">Shipping Address</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the address where you'd like your order delivered
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  First Name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John" 
                    {...field} 
                    className="h-11 focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Etornam" 
                    {...field}
                    className="h-11 focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          
          {/* Street Address */}
          <FormField control={form.control} name="street" render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                <Home className="h-4 w-4 text-primary" />
                Street Address
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Zongo one Lane" 
                  {...field}
                  className="h-11 focus:ring-2 focus:ring-primary/20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          {/* City, ZIP, Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">City</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Sunyani" 
                    {...field}
                    className="h-11 focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="zip" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">ZIP Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="00233" 
                    {...field}
                    className="h-11 focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                  <Globe className="h-4 w-4 text-primary" />
                  Country
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ghana" 
                    {...field}
                    className="h-11 focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Make sure your address is complete and accurate to avoid delivery delays.
            </p>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold">
            Continue to Shipping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
