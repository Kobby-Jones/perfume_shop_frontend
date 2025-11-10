// lib/data/mock-products.ts - THIS FILE SHOULD BE CLEARED/DELETED AFTER MIGRATION

// We define the Product interface here only for type compatibility during migration.
// In a real app, this definition should live in shared types.

type JsonObject = Record<string, any>;


export interface ProductDetails {
  size: string;
  concentration: string;
  scentProfile: string[];
  longevity: string;
  sillage: string;
  season: string[];
  occasion: string[];
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; 
  images: string[];
  availableStock: number;
  category: 'Men' | 'Women' | 'Unisex';
  brand: string;
  isFeatured: boolean;
  isNew?: boolean; 
  isBestseller?: boolean; 
  rating?: number; 
  reviewCount?: number; 
  details: ProductDetails | JsonObject; 
}

export const MOCK_PRODUCTS: Product[] = []; // Emptied array

/**
 * WARNING: This function MUST be replaced by API calls.
 */
export async function getProducts(): Promise<Product[]> {
  console.warn("MOCK PRODUCTS CALLED. ENSURE THIS IS REPLACED WITH API FETCH.");
  return MOCK_PRODUCTS;
}