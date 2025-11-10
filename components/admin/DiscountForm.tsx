// components/admin/DiscountForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Calendar, Tag, Percent, DollarSign } from 'lucide-react';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';

interface Discount {
    id: number;
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    minPurchase?: number;
    maxUses?: number;
    currentUses: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'scheduled';
}

const discountSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(4, 'Code is required (min 4 chars).').toUpperCase(),
  description: z.string().min(5, 'Description required.'),
  type: z.enum(['percentage', 'fixed']),
  value: z.string().refine(v => parseFloat(v) > 0, { message: 'Value must be positive.' }),
  minPurchase: z.string().optional().refine(v => !v || parseFloat(v) >= 0, { message: 'Must be non-negative.' }),
  maxUses: z.string().optional().refine(v => !v || (parseInt(v, 10) >= 0 && Number.isInteger(parseInt(v, 10))), { message: 'Must be a non-negative integer.' }),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().min(1, 'End date is required.'),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentDiscount?: Discount;
}

export function DiscountForm({ open, onOpenChange, currentDiscount }: DiscountFormProps) {
    const isEdit = !!currentDiscount;
    const queryClient = useQueryClient();
    const { alert } = useAlert();

    const form = useForm<DiscountFormData>({
        resolver: zodResolver(discountSchema),
        defaultValues: {
            code: '',
            description: '',
            type: 'percentage',
            value: '',
            minPurchase: '',
            maxUses: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // 30 days later
            id: currentDiscount?.id,
        },
    });

    useEffect(() => {
        if (open && currentDiscount) {
            form.reset({
                id: currentDiscount.id,
                code: currentDiscount.code,
                description: currentDiscount.description,
                type: currentDiscount.type,
                value: currentDiscount.value.toString(),
                minPurchase: currentDiscount.minPurchase?.toString() || '',
                maxUses: currentDiscount.maxUses?.toString() || '',
                startDate: currentDiscount.startDate.split('T')[0],
                endDate: currentDiscount.endDate.split('T')[0],
            });
            form.clearErrors();
        } else if (open && !currentDiscount) {
            form.reset(); // Reset for new discount form
            form.clearErrors();
        }
    }, [currentDiscount, open, form]);

    const mutation = useMutation({
        mutationFn: (data: DiscountFormData) => {
            const payload = {
                ...data,
                value: parseFloat(data.value),
                minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : 0,
                maxUses: data.maxUses ? parseInt(data.maxUses, 10) : null,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            };
            
            const url = isEdit ? `/admin/discounts/${currentDiscount!.id}` : '/admin/discounts';
            const method = isEdit ? 'PUT' : 'POST';
            
            return apiFetch(url, { method, body: JSON.stringify(payload) });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminDiscounts'] });
            onOpenChange(false);
            alert({ 
                title: isEdit ? "Discount Updated" : "Discount Created", 
                message: data.message || `Coupon ${form.getValues('code')} saved successfully.`, 
                variant: 'success' 
            });
        },
        onError: (error: any) => {
            alert({ title: "Operation Failed", message: error.message || "Could not save discount data.", variant: 'error' });
        },
    });

    const onSubmit = (data: DiscountFormData) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">
                        {isEdit ? 'Edit Discount' : 'Create New Discount'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="code" render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel className='flex items-center gap-1'><Tag className='w-4 h-4'/>Coupon Code</FormLabel>
                                    <FormControl><Input {...field} placeholder="E.g., WINTER20" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Input {...field} placeholder="E.g., 20% off all winter scents" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount (GHS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="value" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='flex items-center gap-1'>
                                        {form.watch('type') === 'percentage' ? <Percent className='w-4 h-4'/> : <DollarSign className='w-4 h-4'/>}
                                        Discount Value
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="minPurchase" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Min Purchase (GHS)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            step="0.01" 
                                            {...field} 
                                            value={field.value ?? ''} 
                                            placeholder="0" 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='flex items-center gap-1'><Calendar className='w-4 h-4'/> Start Date</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='flex items-center gap-1'><Calendar className='w-4 h-4'/> End Date</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        <FormField control={form.control} name="maxUses" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Uses (Optional)</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value ?? ''} 
                                        placeholder="Leave blank for unlimited" 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <DialogFooter className="mt-6">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={mutation.isPending}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={mutation.isPending} className="ml-2">
                                {mutation.isPending ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    isEdit ? 'Save Changes' : 'Create Discount'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}