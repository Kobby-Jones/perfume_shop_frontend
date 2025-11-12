// lib/types.ts

/**
 * Defines the detailed structure of the JSON object stored in the Product.details field.
 * This structure is used for the Product Detail Page tabs (Notes, Longevity, etc.).
 */
export interface ProductDetails {
    size: string;
    concentration: 'EDP' | 'EDT' | 'EDC' | 'Parfum';
    scentProfile: string[];
    longevity: string;
    sillage: string;
    season: string[];
    occasion: string[];
    topNotes: string[];
    middleNotes: string[];
    baseNotes: string[];
  }
  
  /**
   * Defines the main structure for a Product object returned by the /api/products endpoints.
   * This ensures consistency across the entire frontend application.
   */
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number | null; 
    images: string[]; // URLs stored on Supabase
    availableStock: number;
    category: 'Men' | 'Women' | 'Unisex';
    brand: string;
    isFeatured: boolean;
    rating?: number; 
    reviewCount?: number; 
    details?: ProductDetails | any; // JSON field, allowing any type for safety
    
    // These properties might not be directly in the DB but are expected by components:
    isNew?: boolean; 
    isBestseller?: boolean; 
  }