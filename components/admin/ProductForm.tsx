// components\admin\ProductForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, Image as ImageIcon, Upload } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api/httpClient';
import { useAlert } from '@/components/shared/ModalAlert';
import { useSupabaseStorage } from '@/lib/hooks/useSupabaseStorage';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    availableStock: number;
    category: string;
    brand: string;
    images: string[];
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
  images: z.array(z.string().url('Must be a valid URL')).max(4, 'Maximum 4 images allowed'),
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
  images: string[];
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
  const { uploadFile, isUploading } = useSupabaseStorage();
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);

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
      images: product?.images || [],
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
            images: product?.images || [],
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentImages = form.getValues('images');
    
    // Check if adding these files would exceed the limit
    if (currentImages.length + files.length > 4) {
      alert({ 
        title: 'Limit Reached', 
        message: `You can only add ${4 - currentImages.length} more image(s). Maximum 4 images allowed per product.`, 
        variant: 'error' 
      });
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert({ title: 'Invalid File', message: `${file.name} is not an image file.`, variant: 'error' });
          return Promise.resolve(null);
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert({ title: 'File Too Large', message: `${file.name} exceeds 5MB limit.`, variant: 'error' });
          return Promise.resolve(null);
        }

        return uploadFile(file, 'perfumes/');
      });

      const results = await Promise.all(uploadPromises);
      
      // Filter successful uploads
      const successfulUrls = results
        .filter((result): result is { success: true; url: string } => 
          result !== null && result.success && !!result.url
        )
        .map(result => result.url);

      if (successfulUrls.length > 0) {
        const updatedImages = [...currentImages, ...successfulUrls];
        form.setValue('images', updatedImages, { shouldValidate: true });
      }

      // Clear the file input
      event.target.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      alert({ 
        title: 'Upload Failed', 
        message: 'An error occurred while uploading images.', 
        variant: 'error' 
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues('images');
    form.setValue('images', currentImages.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const isFormDisabled = mutation.isPending || uploadingImages || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                      <FormControl><Input {...field} disabled={isFormDisabled} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Brand</FormLabel>
                      <FormControl><Input {...field} disabled={isFormDisabled} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
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
                          disabled={isFormDisabled}
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
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={4} {...field} disabled={isFormDisabled} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />

            {/* Image Upload Section */}
            <FormField control={form.control} name="images" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Product Images (Max 4)
                  </FormLabel>
                  
                  {/* Current Images */}
                  {field.value.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {field.value.map((url, index) => (
                        <div key={index} className="relative group border rounded-lg p-2 bg-gray-50">
                          <div className="aspect-square relative overflow-hidden rounded-md mb-2">
                            <img 
                              src={url} 
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1" title={url}>
                            Image {index + 1}
                          </p>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleRemoveImage(index)}
                            disabled={isFormDisabled}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload New Images */}
                  {field.value.length < 4 && (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        disabled={isFormDisabled}
                        className="hidden"
                      />
                      <label 
                        htmlFor="image-upload" 
                        className={`cursor-pointer flex flex-col items-center gap-2 ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploadingImages || isUploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-gray-600">Uploading images...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Click to upload images or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WebP up to 5MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">
                    {field.value.length}/4 images • Files are uploaded to secure Supabase storage
                  </p>
                </FormItem>
            )} />
            
            <DialogFooter className="mt-6">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={isFormDisabled}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isFormDisabled} className="ml-2">
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