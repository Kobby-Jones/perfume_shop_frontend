// components/account/UpdateProfileForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/httpClient';
import { useAuth } from '@/lib/hooks/useAuth'; // Import useAuth to refresh context user

// Schema for updating personal details
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Query key for caching user profile
const PROFILE_QUERY_KEY = 'userProfile';

/**
 * Form for updating user name and email, fully integrated with API.
 */
export function UpdateProfileForm() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth(); // Get refetch utility

  // --- 1. Fetch current user profile from /auth/me (or a dedicated /account/profile endpoint) ---
  // Since we implemented /auth/me, we rely on it for the base data
  const { data: profile, isLoading } = useQuery<
    { user: { name: string; email: string } },
    Error,
    { name: string; email: string } // Add the selected data type here
  >({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: () => apiFetch('/auth/me'), 
    select: (data) => data.user, // Select the user object from the response
    staleTime: 1000 * 60, // Keep data fresh for 1 minute
  });


  // --- 2. Initialize form ---
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  });

  // --- 3. Update form defaults once profile data is loaded ---
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        email: profile.email,
      });
    }
  }, [profile, form]);

  // --- 4. Mutation for updating profile ---
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiFetch('/account/profile', { // This endpoint maps to PUT /api/account/profile on backend
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate the profile query to refetch latest data
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] }); 
      // Also refetch the user context to update header/dashboard immediately
      refetchUser(); 
      toast.success('Your profile information has been updated.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Could not save profile changes.');
    },
  });

  // --- 5. Submit handler ---
  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  // --- 6. Loading state ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // --- 7. Form rendering ---
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your full name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                {/* Note: Disabling email editing for simplicity, often requires verification loop */}
                <Input type="email" {...field} placeholder="Enter your email" disabled /> 
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-4"
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  );
}