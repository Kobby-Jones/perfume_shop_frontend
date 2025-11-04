// components/checkout/AddressStep.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define the schema for address validation
const addressSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  street: z.string().min(5, { message: "Street address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  zip: z.string().regex(/^\d{5}$/, { message: "Invalid ZIP code (e.g., 12345)." }),
  country: z.string().min(2, { message: "Country is required." }),
});

type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Checkout Step 1: Shipping Address Input.
 * @param props.nextStep - Function to advance to the next stage.
 * @param props.setData - Function to update global checkout data.
 */
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl><Input placeholder="John" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl><Input placeholder="Etornam" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <FormField control={form.control} name="street" render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl><Input placeholder="Zongo one Lane" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl><Input placeholder="Sunyani" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="zip" render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP / Postal Code</FormLabel>
              <FormControl><Input placeholder="00233" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl><Input placeholder="Ghana" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <Button type="submit" className="w-full mt-6">Continue to Shipping</Button>
      </form>
    </Form>
  );
}