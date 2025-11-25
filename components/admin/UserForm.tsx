// components/admin/UserForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Phone } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';

// Updated schema to use phoneNumber instead of email
const userSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phoneNumber: z.string().min(10, 'Enter a valid phone number (e.g., 024XXXXXXX)'), // Changed to phoneNumber
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['user', 'admin', 'staff'], { message: 'Role is required.' }),
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
      phoneNumber: '', // Changed
      password: '',
      role: 'user',
    },
  });
  
  React.useEffect(() => {
    if (open) {
        form.reset({
            name: '',
            phoneNumber: '', // Changed
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
            message: data.message || `User ${form.getValues('phoneNumber')} created successfully with role: ${form.getValues('role').toUpperCase()}.`, 
            variant: 'success' 
        });
    },
    onError: (error: any) => {
        alert({ 
            title: "Creation Failed", 
            message: error.message || "Could not create user account. Phone number may be taken.", 
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
            
            {/* Phone Number Field */}
            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input {...field} placeholder="024XXXXXXX" className="pl-10" />
                    </div>
                  </FormControl>
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
                          <SelectItem value="staff">Staff (Day-to-Day Ops)</SelectItem>
                          <SelectItem value="admin">Admin (Full Access)</SelectItem>
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