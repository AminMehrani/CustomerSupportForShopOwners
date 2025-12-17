import { Product, StoreContext } from './types';

export const parseCSV = (csvText: string): Product[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  
  const products: Product[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length < headers.length) continue;

    const product: any = {
      id: `prod-${i}`,
      imageUrl: `https://picsum.photos/200/200?random=${i}` // Default placeholder
    };

    headers.forEach((header, index) => {
      if (header.includes('name') || header.includes('title')) product.name = values[index];
      if (header.includes('price')) product.price = values[index];
      if (header.includes('category')) product.category = values[index];
      if (header.includes('desc')) product.description = values[index];
      if (header.includes('stock')) product.stockStatus = values[index];
      if (header.includes('image')) product.imageUrl = values[index];
      if (header.includes('id') || header.includes('sku')) product.id = values[index];
    });

    // Fallbacks
    if (!product.name) product.name = `Unknown Product ${i}`;
    if (!product.price) product.price = "0.00";
    if (!product.description) product.description = "No description available.";
    if (!product.stockStatus) product.stockStatus = "In Stock";

    products.push(product as Product);
  }

  return products;
};

export const generateDemoProducts = (): Product[] => [
  { id: '101', name: 'Vintage Leather Jacket', price: '199.99', category: 'Clothing', description: 'Genuine leather, classic fit, brown.', stockStatus: 'In Stock', imageUrl: 'https://picsum.photos/seed/jacket/200/200' },
  { id: '102', name: 'Wireless Noise-Canceling Headphones', price: '249.50', category: 'Electronics', description: '40hr battery life, active noise cancellation.', stockStatus: 'In Stock', imageUrl: 'https://picsum.photos/seed/headphones/200/200' },
  { id: '103', name: 'Organic Matcha Tea Powder', price: '24.00', category: 'Grocery', description: 'Premium ceremonial grade from Japan.', stockStatus: 'Low Stock', imageUrl: 'https://picsum.photos/seed/tea/200/200' },
  { id: '104', name: 'Minimalist Desk Lamp', price: '45.00', category: 'Home', description: 'LED, adjustable brightness, matte black.', stockStatus: 'Out of Stock', imageUrl: 'https://picsum.photos/seed/lamp/200/200' },
];

export const generateDemoPolicies = () => `
**Return Policy:** You can return items within 30 days of receipt. Items must be unused and in original packaging.
**Shipping:** Free shipping on orders over $50. Standard shipping takes 3-5 business days.
**Contact:** Support email is support@woogemini.com.
`;

const STORAGE_KEY = 'woogemini_config';

export const saveConfig = (context: StoreContext) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch (e) {
    console.error("Failed to save config", e);
  }
};

export const loadConfig = (): StoreContext | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load config", e);
    return null;
  }
};