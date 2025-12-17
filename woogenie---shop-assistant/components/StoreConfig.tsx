import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2, ShoppingBag, Code, Copy, Check } from 'lucide-react';
import { Product, KnowledgeDocument } from '../types';
import { parseCSV, parseDocument } from '../services/fileService';

interface StoreConfigProps {
  products: Product[];
  documents: KnowledgeDocument[];
  storeName: string;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setDocuments: React.Dispatch<React.SetStateAction<KnowledgeDocument[]>>;
  setStoreName: (name: string) => void;
}

export const StoreConfig: React.FC<StoreConfigProps> = ({
  products,
  documents,
  storeName,
  setProducts,
  setDocuments,
  setStoreName
}) => {
  const productInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleProductUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const parsedProducts = await parseCSV(file);
        setProducts(parsedProducts);
      } catch (err) {
        alert("Error parsing CSV");
      }
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const doc = await parseDocument(file);
        setDocuments(prev => [...prev, doc]);
      } catch (err) {
        alert("Error parsing document");
      }
    }
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleCopyCode = () => {
    const code = `<!-- WooGenie Embed Code -->
<script>
  window.wooGenieConfig = {
    storeName: "${storeName}",
    theme: "light"
  };
</script>
<div id="woogenie-widget-root"></div>
<script src="https://cdn.woogenie.ai/latest/widget.bundle.js" defer></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 p-6 pb-24">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Store Configuration</h2>
        <p className="text-slate-500 text-sm">Upload your WooCommerce export and policy documents to train the AI.</p>
      </div>

      {/* Store Name */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-2">Store Name</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          placeholder="e.g. My Awesome Shop"
        />
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Product Catalog</h3>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
            {products.length} Products
          </span>
        </div>
        
        <input
          type="file"
          accept=".csv"
          ref={productInputRef}
          onChange={handleProductUpload}
          className="hidden"
        />
        
        <button
          onClick={() => productInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
        >
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Upload Products CSV</span>
          <span className="text-xs text-slate-400 mt-1">Accepts WooCommerce Export Format</span>
        </button>

        {products.length > 0 && (
          <div className="mt-4 overflow-hidden border border-slate-200 rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 font-medium text-slate-600">Name</th>
                    <th className="px-4 py-2 font-medium text-slate-600">Price</th>
                    <th className="px-4 py-2 font-medium text-slate-600">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.slice(0, 5).map((p) => (
                    <tr key={p.id} className="bg-white">
                      <td className="px-4 py-2 text-slate-800 truncate max-w-[150px]">{p.name}</td>
                      <td className="px-4 py-2 text-slate-600">${p.price}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${p.stock_status.includes('stock') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length > 5 && (
                <div className="bg-slate-50 px-4 py-2 text-xs text-center text-slate-500 border-t border-slate-200">
                  + {products.length - 5} more products
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Knowledge Base</h3>
          </div>
        </div>

        <input
          type="file"
          accept=".txt,.md"
          ref={docInputRef}
          onChange={handleDocUpload}
          className="hidden"
        />

        <button
          onClick={() => docInputRef.current?.click()}
          className="w-full mb-4 py-3 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition shadow-sm bg-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          <span className="text-sm">Add Policy Document (TXT/MD)</span>
        </button>

        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 group">
              <div className="flex items-center overflow-hidden">
                <FileText className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                <span className="text-sm text-slate-700 truncate">{doc.name}</span>
              </div>
              <button
                onClick={() => removeDoc(doc.id)}
                className="text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="text-center py-4 text-slate-400 text-sm italic">
              No documents uploaded (e.g., Returns Policy, Shipping Info).
            </div>
          )}
        </div>
      </div>

      {/* Integration Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-800">WordPress Integration</h3>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
            To install the chat widget, copy the code below and paste it into your theme's 
            <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 mx-1 font-mono">footer.php</code> 
            file, just before the closing <code>&lt;/body&gt;</code> tag.
        </p>

        <div className="relative bg-slate-900 rounded-lg p-4 group">
            <button 
                onClick={handleCopyCode}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition flex items-center space-x-2 border border-slate-700"
            >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-xs font-medium">{copied ? 'Copied!' : 'Copy Snippet'}</span>
            </button>
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto p-2 pt-1 leading-relaxed">
{`<!-- WooGenie Embed Code -->
<script>
  window.wooGenieConfig = {
    storeName: "${storeName}",
    theme: "light",
    position: "bottom-right"
  };
</script>
<div id="woogenie-widget-root"></div>
<script src="https://cdn.woogenie.ai/latest/widget.bundle.js" defer></script>`}
            </pre>
        </div>
      </div>

    </div>
  );
};