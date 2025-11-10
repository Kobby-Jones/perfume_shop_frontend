// components/admin/UserForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';

// Define the schema for admin-created users
const userSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['user', 'admin'], { message: 'Role is required.' }),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Admin form for creating a new user and assigning their role.
 * Communicates with POST /api/admin/users.
 */
export function UserForm({ open, onOpenChange }: UserFormProps) {
  const queryClient = useQueryClient();
  const { alert } = useAlert();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user', // Default to standard user
    },
  });
  
  React.useEffect(() => {
    // Reset form errors and values when modal opens
    if (open) {
        form.reset({
            name: '',
            email: '',
            password: '',
            role: 'user',
        });
        form.clearErrors();
    }
  }, [open, form]);


  const mutation = useMutation({
    mutationFn: (data: UserFormData) => {
        return apiFetch('/admin/users', { 
            method: 'POST', 
            body: JSON.stringify(data) 
        });
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        onOpenChange(false);
        alert({ 
            title: "User Created", 
            message: data.message || `User ${form.getValues('email')} created successfully with role: ${form.getValues('role').toUpperCase()}.`, 
            variant: 'success' 
        });
    },
    onError: (error: any) => {
        alert({ 
            title: "Creation Failed", 
            message: error.message || "Could not create user account. Email may be taken.", 
            variant: 'error' 
        });
    },
  });

  const onSubmit = (data: UserFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Create New User Account
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" {...field} placeholder="user@example.com" /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl><Input type="password" {...field} placeholder="Min. 8 characters" /></FormControl>
                  <FormDescription className="text-xs">
                    User can change this password after first login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
            )} />
            
            <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="user">User (Customer)</SelectItem>
                          <SelectItem value="admin">Admin (Staff)</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )} />
            
            <DialogFooter className="mt-6">
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={mutation.isPending}>
                      Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}