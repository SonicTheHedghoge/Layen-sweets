export type ProductCategory = 'Macaron' | 'Cake' | 'Sable';
export type Language = 'fr' | 'en' | 'ar';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  ingredients: string[];
  // Specific Flags
  available: boolean; // For Macarons/All
  sableDressage?: boolean; // For Sablés (With decoration)
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  items: { 
    productId: string; 
    name: string; 
    quantity: number;
    notes?: string; // For specific requests like "Avec Dressage"
  }[];
  totalPrice: number;
  notes: string;
  status: 'Pending' | 'Processed' | 'Completed';
  date: string;
}

export interface Recipe {
  id: string;
  title: string;
  content: string;
  image: string;
}

export interface SiteContent {
  // Brand
  logoText: string;
  logoImage: string;
  contactPhone: string;
  facebookUrl: string;
  
  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroImage: string; // Main
  heroImage2: string; // Decorative 1
  heroImage3: string; // Decorative 2
  heroVideo?: string;
  
  // About
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  
  // Recipes/Footer images if needed
  chefQuote: string;
}

export type ViewState = 'HOME' | 'ABOUT' | 'GALLERY' | 'ORDER' | 'RECIPES' | 'ADMIN' | 'CONTACT';