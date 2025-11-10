// lib/hooks/useAddresses.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/httpClient';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useCallback } from 'react';

// Define the expected Address structure from the backend
interface Address {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    zip: string;
    country: string;
    isDefault: boolean;
    userId: number; // Only used internally
}

const ADDRESS_QUERY_KEY = 'userAddresses';

export function useAddresses() {
    const queryClient = useQueryClient();
    const { isLoggedIn } = useAuth();

    // Fetch Addresses
    const { data: addresses = [], isLoading, isError } = useQuery<Address[]>({
        queryKey: [ADDRESS_QUERY_KEY],
        queryFn: async () => {
            const data = await apiFetch('/account/addresses');
            return data.addresses || [];
        },
        enabled: isLoggedIn,
        refetchOnWindowFocus: true,
    });

    // Mutation for adding a new address
    const createAddressMutation = useMutation({
        mutationFn: (newAddress: Omit<Address, 'id' | 'userId' | 'isDefault'>) =>
            apiFetch('/account/addresses', { method: 'POST', body: JSON.stringify(newAddress) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADDRESS_QUERY_KEY] });
            toast.success('New address saved successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save address.');
        },
    });

    // Mutation for updating an address
    const updateAddressMutation = useMutation({
        mutationFn: (updatedAddress: Partial<Address>) =>
            apiFetch(`/account/addresses/${updatedAddress.id}`, { method: 'PUT', body: JSON.stringify(updatedAddress) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADDRESS_QUERY_KEY] });
            toast.success('Address updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update address.');
        },
    });

    // Mutation for deleting an address
    const deleteAddressMutation = useMutation({
        mutationFn: (id: number) =>
            apiFetch(`/account/addresses/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADDRESS_QUERY_KEY] });
            toast.success('Address removed.');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete address.');
        },
    });
    
    // Mutation for setting an address as default
    const setDefaultAddress = useCallback((id: number) => {
        // Optimistically update the local list first
        queryClient.setQueryData([ADDRESS_QUERY_KEY], (old: Address[]) => 
             old.map(a => ({ ...a, isDefault: a.id === id }))
        );

        updateAddressMutation.mutate({ id, isDefault: true } as Partial<Address>);
    }, [queryClient, updateAddressMutation]);


    return {
        addresses,
        isLoading,
        isError,
        createAddress: createAddressMutation.mutate,
        updateAddress: updateAddressMutation.mutate,
        deleteAddress: deleteAddressMutation.mutate,
        setDefaultAddress,
        isPending: createAddressMutation.isPending || updateAddressMutation.isPending || deleteAddressMutation.isPending,
    };
}