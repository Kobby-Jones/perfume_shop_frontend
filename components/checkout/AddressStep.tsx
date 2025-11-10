// components/checkout/AddressStep.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, User, Home, Globe, ArrowRight, Loader2, Plus, CheckCircle } from 'lucide-react';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '@/components/ui/badge';

const addressSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  street: z.string().min(5, { message: "Street address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  zip: z.string().min(3, { message: "ZIP code is required." }),
  country: z.string().min(2, { message: "Country is required." }),
});

type AddressFormData = z.infer<typeof addressSchema>;

// Mock type definition for consistency
interface SavedAddress extends AddressFormData {
    id: number;
    name: string;
    isDefault: boolean;
}

export function AddressStep({ nextStep, data, setData }: { 
    nextStep: () => void, 
    data: any, 
    setData: (data: any) => void 
}) {
    const { addresses, isLoading } = useAddresses();
    const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const form = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            firstName: '', lastName: '', street: '', city: '', zip: '', country: 'Ghana'
        },
    });
    
    // Set initial selection logic
    if (addresses.length > 0 && selectedAddressId === null && !useNewAddress) {
        const defaultAddress = addresses.find(a => a.isDefault);
        if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setData((prev: any) => ({ ...prev, address: defaultAddress }));
        }
    }


    const handleSelectAddress = (id: string) => {
        const addressId = parseInt(id);
        const selected = addresses.find(a => a.id === addressId);
        if (selected) {
            setSelectedAddressId(addressId);
            setData((prev: any) => ({ ...prev, address: selected }));
        }
        setUseNewAddress(false);
    };

    const handleNewAddressSubmit = (formData: AddressFormData) => {
        setData((prev: any) => ({ ...prev, address: formData }));
        nextStep();
    };
    
    const handleContinueWithSaved = () => {
        if (!selectedAddressId) return;
        nextStep();
    };
    
    if (isLoading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
    }

    const selectedSavedAddress = addresses.find(a => a.id === selectedAddressId);
    
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
                    Select a saved address or enter a new one
                </p>
            </div>

            {/* Address Selection Toggle */}
            {addresses.length > 0 && (
                <div className="space-y-4">
                    <RadioGroup 
                        value={useNewAddress ? 'new' : selectedAddressId?.toString() || ''}
                        onValueChange={(val) => {
                            if (val === 'new') {
                                setUseNewAddress(true);
                                setSelectedAddressId(null);
                                setData((prev: any) => ({ ...prev, address: null }));
                            } else {
                                handleSelectAddress(val);
                            }
                        }}
                        className="flex flex-col gap-3"
                    >
                        {addresses.map((address) => (
                            <div 
                                key={address.id}
                                className={`relative border rounded-lg p-4 transition-all cursor-pointer ${
                                    selectedAddressId === address.id ? 'border-primary shadow-md' : 'hover:border-primary/50'
                                }`}
                            >
                                <RadioGroupItem 
                                    value={address.id.toString()} 
                                    id={`address-${address.id}`} 
                                    className="absolute top-4 right-4"
                                />
                                <Label htmlFor={`address-${address.id}`} className="flex flex-col text-left cursor-pointer">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className='font-semibold'>{address.name}</span>
                                        {address.isDefault && (
                                            <Badge variant='secondary' className='text-xs'>Default</Badge>
                                        )}
                                    </div>
                                    <p className='text-sm text-muted-foreground'>{address.street}, {address.city}, {address.country}</p>
                                    <p className='text-xs text-muted-foreground'>{address.firstName} {address.lastName}</p>
                                </Label>
                            </div>
                        ))}
                        
                        {/* Option to use a new address */}
                        <div 
                            className={`relative border rounded-lg p-4 transition-all cursor-pointer ${
                                useNewAddress ? 'border-primary shadow-md' : 'hover:border-primary/50'
                            }`}
                        >
                            <RadioGroupItem value="new" id="address-new" className="absolute top-4 right-4" />
                            <Label htmlFor="address-new" className="flex items-center gap-3 font-semibold text-left cursor-pointer">
                                <Plus className="h-5 w-5 text-primary" />
                                Add a new address
                            </Label>
                        </div>
                    </RadioGroup>
                    
                    {/* Continue button for saved addresses */}
                    {selectedSavedAddress && !useNewAddress && (
                        <Button type="button" onClick={handleContinueWithSaved} className="w-full h-12 text-base font-semibold">
                            Continue with Saved Address
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}


            {/* New Address Form (Only displayed if no addresses exist OR 'use new address' is selected) */}
            {(useNewAddress || addresses.length === 0) && (
                <Card className='p-6 shadow-none border-dashed bg-secondary/20'>
                    <h4 className='font-semibold mb-4 flex items-center gap-2'>
                        <MapPin className='w-4 h-4'/> Enter Shipping Details
                    </h4>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleNewAddressSubmit)} className="space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                            <User className="h-4 w-4 text-primary" />
                                            First Name
                                        </FormLabel>
                                        <FormControl><Input {...field} className="h-11" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                            <User className="h-4 w-4 text-primary" />
                                            Last Name
                                        </FormLabel>
                                        <FormControl><Input {...field} className="h-11" /></FormControl>
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
                                    <FormControl><Input {...field} className="h-11" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            {/* City, ZIP, Country */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">City</FormLabel>
                                        <FormControl><Input {...field} className="h-11" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="zip" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">ZIP Code</FormLabel>
                                        <FormControl><Input {...field} className="h-11" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="country" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                            <Globe className="h-4 w-4 text-primary" /> Country
                                        </FormLabel>
                                        <FormControl><Input {...field} className="h-11" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                                Continue to Shipping
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Form>
                </Card>
            )}
        </div>
    );
}