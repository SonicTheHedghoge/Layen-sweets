import { Product, Order, Recipe, SiteContent } from '../types';
import { supabase } from './supabaseClient';

// --- FALLBACK INITIAL DATA (Used if DB is empty or not connected) ---

const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "m1",
    "name": "Rose & Litchi",
    "description": "Crème délicate aux pétales de rose avec un cœur de litchi.",
    "price": 3.5,
    "image": "https://picsum.photos/id/431/600/600",
    "category": "Macaron",
    "ingredients": ["Poudre d'amande", "Eau de rose", "Litchi"],
    "available": true
  },
  {
    "id": "m2",
    "name": "Pistache Suprême",
    "description": "Pistaches siciliennes torréfiées.",
    "price": 4,
    "image": "https://picsum.photos/id/493/600/600",
    "category": "Macaron",
    "ingredients": ["Pistache"],
    "available": true
  },
  {
    "id": "c1",
    "name": "Royal Chocolat",
    "description": "Sept couches de textures au chocolat noir.",
    "price": 45,
    "image": "https://picsum.photos/id/292/600/600",
    "category": "Cake",
    "ingredients": ["Chocolat Noir", "Feuille d'Or"],
    "available": true
  }
];

const INITIAL_RECIPES: Recipe[] = [
  {
    "id": "r1",
    "title": "L'Art du Macaronage",
    "content": "Le macaronage est l'étape la plus critique. Vous voulez obtenir une consistance semblable à de la lave en fusion...",
    "image": "https://picsum.photos/id/292/800/600"
  }
];

export const INITIAL_CONTENT: SiteContent = {
  "logoText": "LAYEN SWEETS",
  "logoImage": "",
  "contactPhone": "96948548",
  "facebookUrl": "https://www.facebook.com/Lazuritedjerba",
  "heroTitle": "Douceurs Artisanales,\nFaites avec Amour",
  "heroSubtitle": "Excellence Tunisienne",
  "heroButtonText": "Commander",
  "heroImage": "https://picsum.photos/id/429/600/600",
  "heroImage2": "https://picsum.photos/id/431/500/500",
  "heroImage3": "https://picsum.photos/id/488/500/500",
  "heroVideo": "",
  "aboutTitle": "L'Art de la Douceur Délicate",
  "aboutText": "Chez Layen Sweets, nous croyons qu'un dessert est plus que du sucre. C'est un moment de pure joie.",
  "aboutImage": "https://picsum.photos/id/225/800/1000",
  "chefQuote": "\"La patience est l'ingrédient le plus important du macaronage.\""
};

// --- SECURITY (Admin Password Hash) ---
// SHA-256 of '99601272'
const SECURE_HASH = 'b63d27457788390710606f2382021670404a742058525c5675c91e1700683050';

// --- DB HELPERS ---
// We use a simple Key-Value store pattern in Supabase table 'storage' (key: text, value: jsonb)

const fetchFromSupabase = async <T>(key: string, defaultValue: T): Promise<T> => {
  if (!supabase) {
    console.warn("Supabase not configured. Using local defaults.");
    return defaultValue;
  }
  try {
    const { data, error } = await supabase
      .from('storage')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error || !data) return defaultValue;
    return data.value as T;
  } catch (e) {
    console.error("Supabase Fetch Error:", e);
    return defaultValue;
  }
};

const saveToSupabase = async <T>(key: string, value: T): Promise<void> => {
  if (!supabase) {
    alert("Database not connected. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.");
    return;
  }
  try {
    const { error } = await supabase
      .from('storage')
      .upsert({ key, value });
    
    if (error) throw error;
  } catch (e: any) {
    console.error("Supabase Save Error:", e);
    // 413 = Payload Too Large (usually huge images)
    if (e.message?.includes('413') || e.code === '413') {
      alert("Error: Image size too big for database. Please use smaller images (under 1MB).");
    } else {
      alert("Error saving to cloud. Check internet connection.");
    }
    throw e;
  }
};

export const dataService = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    return fetchFromSupabase<Product[]>('products', INITIAL_PRODUCTS);
  },
  saveProducts: async (products: Product[]) => {
    await saveToSupabase('products', products);
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    return fetchFromSupabase<Order[]>('orders', []);
  },
  submitOrder: async (order: Order) => {
    // Orders need to be appended safely.
    // In a real high-traffic app we'd use a real table row per order.
    // For this simple Key-Value setup, we fetch-modify-save.
    const currentOrders = await dataService.getOrders();
    const newOrders = [order, ...currentOrders];
    await saveToSupabase('orders', newOrders);
  },
  updateOrderStatus: async (id: string, status: Order['status']) => {
    const current = await dataService.getOrders();
    const updated = current.map(o => o.id === id ? { ...o, status } : o);
    await saveToSupabase('orders', updated);
  },

  // Recipes
  getRecipes: async (): Promise<Recipe[]> => {
    return fetchFromSupabase<Recipe[]>('recipes', INITIAL_RECIPES);
  },
  saveRecipes: async (recipes: Recipe[]) => {
    await saveToSupabase('recipes', recipes);
  },

  // Content
  getSiteContent: async (): Promise<SiteContent> => {
    return fetchFromSupabase<SiteContent>('content', INITIAL_CONTENT);
  },
  updateSiteContent: async (content: SiteContent) => {
    await saveToSupabase('content', content);
  },

  // Security (Client Side Check)
  verifyPassword: async (password: string): Promise<boolean> => {
    const cleanPassword = password.trim(); 
    if (typeof btoa === 'function' && btoa(cleanPassword) === 'OTk2MDEyNzI=') return true;

    try {
        if (!crypto || !crypto.subtle) return false;
        const encoder = new TextEncoder();
        const data = encoder.encode(cleanPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex === SECURE_HASH;
    } catch (e) {
        return false;
    }
  }
};