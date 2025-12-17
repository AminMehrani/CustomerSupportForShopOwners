import { Product, KnowledgeDocument } from '../types';

export const parseCSV = async (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        resolve([]);
        return;
      }

      // Simple CSV parser - handles basic comma separation and newlines
      // For production, a library like PapaParse is recommended
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        resolve([]);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_'));
      
      const products: Product[] = lines.slice(1).map((line, index) => {
        // Handle quoted strings containing commas roughly
        const values: string[] = [];
        let inQuote = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            values.push(currentValue.trim().replace(/^"|"$/g, ''));
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ''));

        const product: any = { id: `prod-${index}` };
        headers.forEach((header, i) => {
          if (values[i] !== undefined) {
            product[header] = values[i];
          }
        });

        // Ensure essential fields exist even if CSV is weird
        return {
          id: product.id,
          name: product.name || product.title || 'Unknown Product',
          price: product.price || product.regular_price || '0',
          category: product.category || product.categories || 'Uncategorized',
          description: product.description || product.short_description || '',
          stock_status: product.stock_status || product.in_stock || 'instock',
          ...product
        };
      });

      resolve(products);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const parseDocument = async (file: File): Promise<KnowledgeDocument> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        id: `doc-${Date.now()}`,
        name: file.name,
        content: e.target?.result as string,
        type: file.name.endsWith('.md') ? 'markdown' : 'text'
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};