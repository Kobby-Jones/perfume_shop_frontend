// app/account/(protected)/addresses/page.tsx

'use client';

import { useState } from 'react';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Edit, Trash2, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddressForm } from '@/components/account/AddressForm'; // New component

/**
 * User Address Book Page.
 */
export default function AddressBookPage() {
    const { addresses, isLoading, deleteAddress, setDefaultAddress, isPending } = useAddresses();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any | null>(null);

    const handleEdit = (address: any) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    const handleNew = () => {
        setEditingAddress(null);
        setIsFormOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold flex items-center">
                    <MapPin className="w-6 h-6 mr-3" />
                    Your Address Book
                </h2>
                <Button onClick={handleNew} size="sm">
                    <Plus className="w-4 h-4 mr-2" />Add New Address
                </Button>
            </div>
            
            {addresses.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg p-6 text-foreground/70">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                    <p className="text-xl font-semibold">No Saved Addresses</p>
                    <p className="text-base">Click "Add New Address" to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <Card 
                            key={address.id} 
                            className={`shadow-md transition-shadow hover:shadow-lg ${
                                address.isDefault ? 'border-2 border-primary/70 bg-primary/5' : ''
                            }`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-lg">{address.name}</CardTitle>
                                    {address.isDefault && (
                                        <Badge className="bg-primary/90 text-white font-semibold">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Default
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="icon-sm" 
                                        onClick={() => handleEdit(address)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon-sm" 
                                        onClick={() => deleteAddress(address.id)}
                                        disabled={isPending || address.isDefault}
                                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-sm">
                                <p className="font-semibold">{address.firstName} {address.lastName}</p>
                                <p>{address.street}</p>
                                <p>{address.city}, {address.zip}</p>
                                <p>{address.country}</p>

                                <div className="pt-3 border-t mt-3">
                                    {!address.isDefault && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setDefaultAddress(address.id)}
                                            disabled={isPending}
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                    {address.isDefault && (
                                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Used for current checkout.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            <AddressForm 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                currentAddress={editingAddress}
            />
        </div>
    );
}