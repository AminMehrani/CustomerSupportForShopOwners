export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  description: string;
  stockStatus: string;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface StoreContext {
  products: Product[];
  policies: string;
  storeName: string;
}

export enum AppMode {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  EMBED = 'EMBED'
}