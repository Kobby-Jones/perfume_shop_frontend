'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    availableStock: number;
    category: string;
    brand: string;
}

// Schema with string inputs (what the form actually uses)
const productFormSchema = z.object({
  id: z.number().optional(), 
  name: z.string().min(3, 'Name is required.'),
  brand: z.string().min(2, 'Brand is required.'),
  category: z.enum(['Men', 'Women', 'Unisex'], { message: 'Select a valid category.' }),
  price: z.string().min(1, 'Price is required.'),
  availableStock: z.string().min(1, 'Stock is required.'),
  description: z.string().min(10, 'Description is required.'),
}).refine((data) => {
  const price = parseFloat(data.price);
  return !isNaN(price) && price > 0;
}, {
  message: 'Price must be a positive number.',
  path: ['price'],
}).refine((data) => {
  const stock = parseInt(data.availableStock);
  return !isNaN(stock) && stock >= 0 && Number.isInteger(stock);
}, {
  message: 'Stock must be a non-negative integer.',
  path: ['availableStock'],
});

type ProductFormInput = z.infer<typeof productFormSchema>;

// Output type with numbers (what gets sent to API)
interface ProductFormOutput {
  id?: number;
  name: string;
  brand: string;
  category: 'Men' | 'Women' | 'Unisex';
  price: number;
  availableStock: number;
  description: string;
}

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product; 
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const isEdit = !!product;
  const queryClient = useQueryClient();
  const { alert } = useAlert();

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      id: product?.id,
      name: product?.name || '',
      brand: product?.brand || '',
      category: (product?.category as 'Men' | 'Women' | 'Unisex') || 'Women',
      price: product?.price ? product.price.toString() : '',
      availableStock: product?.availableStock !== undefined ? product.availableStock.toString() : '',
      description: product?.description || '',
    },
  });
  
  React.useEffect(() => {
    if (open) {
        form.reset({
            id: product?.id,
            name: product?.name || '',
            brand: product?.brand || '',
            category: (product?.category as 'Men' | 'Women' | 'Unisex') || 'Women',
            price: product?.price ? product.price.toString() : '',
            availableStock: product?.availableStock !== undefined ? product.availableStock.toString() : '',
            description: product?.description || '',
        });
        form.clearErrors(); 
    }
  }, [product, open, form]);

  const mutation = useMutation({
    mutationFn: (data: ProductFormOutput) => { 
        const url = isEdit ? `/admin/products/${product?.id}` : '/admin/products';
        const method = isEdit ? 'PUT' : 'POST';
        return apiFetch(url, { method, body: JSON.stringify(data) });
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        onOpenChange(false);
        alert({ 
            title: isEdit ? "Updated Successfully" : "Product Created", 
            message: data.message || `Product ${form.getValues('name')} saved to catalog.`, 
            variant: 'success' 
        });
    },
    onError: (error: any) => {
        alert({ 
            title: "Operation Failed", 
            message: error.message || "Could not save product data.", 
            variant: 'error' 
        });
    },
  });

  const onSubmit = (data: ProductFormInput) => {
    // Transform string inputs to numbers for API
    const transformedData: ProductFormOutput = {
      ...data,
      price: parseFloat(data.price),
      availableStock: parseInt(data.availableStock),
    };
    mutation.mutate(transformedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Brand</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="Men">Men</SelectItem>
                              <SelectItem value="Women">Women</SelectItem>
                              <SelectItem value="Unisex">Unisex</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (GHS)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                
                <FormField control={form.control} name="availableStock" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Qty</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={4} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            
            <DialogFooter className="mt-6">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={mutation.isPending}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="ml-2">
                    {mutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEdit ? 'Saving...' : 'Creating...'}</>
                    ) : (
                        isEdit ? 'Save Changes' : 'Create Product'
                    )}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}