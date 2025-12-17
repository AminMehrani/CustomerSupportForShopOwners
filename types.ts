export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  description: string;
  stock_status: string;
  [key: string]: string; // Allow flexible CSV columns
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'markdown';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AppState {
  products: Product[];
  documents: KnowledgeDocument[];
  storeName: string;
  systemInstruction: string;
}
