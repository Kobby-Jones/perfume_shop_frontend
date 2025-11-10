// lib/hooks/useSupabaseStorage.tsx

'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// NOTE: Replace these with your actual Supabase credentials from your .env file
// Since Next.js variables are not automatically accessible in standard TS files,
// you need to either expose them as NEXT_PUBLIC_ in your .env or manage them securely.
// We use placeholder values here; ensure you replace them when running locally.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const BUCKET_NAME = 'product-images'; // Must match the name of your bucket

// Initialize Supabase Client (safe to use anon key for public storage upload)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Hook for managing secure file uploads to Supabase Storage.
 * Designed specifically for the Admin Product Form.
 */
export function useSupabaseStorage() {
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Uploads a single file to Supabase Storage.
     * @param file The File object to upload.
     * @param folder The folder path within the bucket (e.g., 'perfumes/').
     * @returns A promise resolving to the UploadResult (URL or error).
     */
    const uploadFile = useCallback(async (file: File, folder: string): Promise<UploadResult> => {
        if (!file) {
            return { success: false, error: 'No file provided.' };
        }
        
        setIsUploading(true);
        
        // Create a unique file path: folder/timestamp-filename.ext
        const fileExtension = file.name.split('.').pop();
        const filePath = `${folder}${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

        try {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                console.error('Supabase upload error:', error);
                toast.error("Upload failed: " + error.message);
                return { success: false, error: error.message };
            }

            // Get the public URL for the newly uploaded file
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            if (!publicUrlData.publicUrl) {
                return { success: false, error: 'Failed to retrieve public URL.' };
            }
            
            toast.success('Image uploaded successfully!');
            return { success: true, url: publicUrlData.publicUrl };

        } catch (error: any) {
            console.error('General upload exception:', error);
            return { success: false, error: error.message };
        } finally {
            setIsUploading(false);
        }
    }, []);

    return {
        isUploading,
        uploadFile,
    };
}