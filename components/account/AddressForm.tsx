// components/account/AddressForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { Loader2, Save, MapPin, User, Home, Globe } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/data/countries-mock';

// Simple mock country list for Select input (since the backend doesn't provide this list)
const countryList = countries || ['Ghana', 'Nigeria', 'United States', 'United Kingdom', 'Canada'];


const addressSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: "Address name is required (e.g., Home, Work)." }),
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  street: z.string().min(5, { message: "Street address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  zip: z.string().min(3, { message: "ZIP/Postal code is required." }),
  country: z.string().min(2, { message: "Country is required." }),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAddress?: AddressFormData | null;
}

export function AddressForm({ open, onOpenChange, currentAddress }: AddressFormProps) {
    const { createAddress, updateAddress, isPending } = useAddresses();
    const isEdit = !!currentAddress?.id;

    const form = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            name: currentAddress?.name || '',
            firstName: currentAddress?.firstName || '',
            lastName: currentAddress?.lastName || '',
            street: currentAddress?.street || '',
            city: currentAddress?.city || '',
            zip: currentAddress?.zip || '',
            country: currentAddress?.country || 'Ghana',
            id: currentAddress?.id
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                name: currentAddress?.name || 'Home',
                firstName: currentAddress?.firstName || '',
                lastName: currentAddress?.lastName || '',
                street: currentAddress?.street || '',
                city: currentAddress?.city || '',
                zip: currentAddress?.zip || '',
                country: currentAddress?.country || 'Ghana',
                id: currentAddress?.id
            });
            form.clearErrors();
        }
    }, [currentAddress, open, form]);


    const onSubmit = (data: AddressFormData) => {
        const payload: Omit<AddressFormData, 'id'> = {
            name: data.name,
            firstName: data.firstName,
            lastName: data.lastName,
            street: data.street,
            city: data.city,
            zip: data.zip,
            country: data.country,
        };

        if (isEdit && data.id) {
            updateAddress({ ...payload, id: data.id });
        } else {
            createAddress(payload);
        }
        
        // Form closes automatically on success via the mutation's onSuccess handler invalidating the query
        // and triggering the parent component to update and close.
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">
                        {isEdit ? 'Edit Address' : 'Add New Address'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address Label (e.g., Home, Work)</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" />First Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" />Last Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        {/* Street and City */}
                        <FormField control={form.control} name="street" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Home className="h-4 w-4" />Street Address</FormLabel>
                                <FormControl><Input {...field} placeholder="House number and street" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        {/* City, ZIP, Country */}
                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="zip" render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>ZIP/Code</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4" />Country</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {countryList.map(country => (
                                                <SelectItem key={country} value={country}>{country}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        <DialogFooter className="mt-6">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isPending}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending} className="ml-2">
                                {isPending ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Save Address</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}