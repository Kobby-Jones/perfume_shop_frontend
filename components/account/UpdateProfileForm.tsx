// components/account/UpdateProfileForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/httpClient';
import { useAuth } from '@/lib/hooks/useAuth'; 

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  // Phone is read-only in this form for now
});

type ProfileFormData = z.infer<typeof profileSchema>;
const PROFILE_QUERY_KEY = 'userProfile';

export function UpdateProfileForm() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: () => apiFetch('/auth/me'), 
    select: (data) => data.user,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiFetch('/account/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] }); 
      refetchUser(); 
      toast.success('Profile updated.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Could not save changes.');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number Field (Read-Only) */}
        <div className="space-y-2">
            <FormLabel>Phone Number</FormLabel>
            <Input value={profile?.phoneNumber || ''} disabled className="bg-muted" />
            <FormDescription className="text-xs">
                To change your phone number, please contact support or re-register.
            </FormDescription>
        </div>

        <Button type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}