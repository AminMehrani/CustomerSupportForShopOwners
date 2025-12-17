import React, { useState, useRef } from 'react';
import { Product, StoreContext } from '../types';
import { parseCSV, generateDemoProducts, generateDemoPolicies } from '../utils';

interface AdminPanelProps {
  onSaveConfig: (context: StoreContext) => void;
  currentContext: StoreContext;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSaveConfig, currentContext }) => {
  const [storeName, setStoreName] = useState(currentContext.storeName);
  const [policies, setPolicies] = useState(currentContext.policies);
  const [products, setProducts] = useState<Product[]>(currentContext.products);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'integration'>('config');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedProducts = parseCSV(text);
        if (parsedProducts.length === 0) {
          setCsvError("Could not find valid products in CSV. Ensure headers include 'name', 'price', etc.");
        } else {
          setProducts(parsedProducts);
          setCsvError(null);
        }
      } catch (err) {
        setCsvError("Error parsing CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const loadDemoData = () => {
    setProducts(generateDemoProducts());
    setPolicies(generateDemoPolicies());
    setStoreName("WooGemini Demo Shop");
    setCsvError(null);
  };

  const handleSave = () => {
    onSaveConfig({
      storeName,
      policies,
      products
    });
    alert("Configuration saved! You can now check the Integration tab.");
  };

  // Generate embed code assuming the current URL is the deploy URL
  const deployUrl = window.location.origin;
  const embedCode = `<iframe 
  src="${deployUrl}/?mode=embed" 
  width="100%" 
  height="600px" 
  style="position: fixed; bottom: 20px; right: 20px; border: none; z-index: 9999; width: 400px; height: 600px; pointer-events: none;"
></iframe>
<!-- Note: The iframe is styled to be invisible (pointer-events: none) until the chat opens. 
     For a production implementation, you might want a small JS loader instead. -->`;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          className={`flex-1 py-4 text-sm font-medium ${activeTab === 'config' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button
          className={`flex-1 py-4 text-sm font-medium ${activeTab === 'integration' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('integration')}
        >
          Integration (WordPress)
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-gray-800">Store Settings</h2>
               <button 
                onClick={loadDemoData}
                className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors font-medium"
              >
                Load Demo Data
              </button>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="e.g. My Awesome Shop"
              />
            </div>

            {/* Product Upload */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Catalog (CSV)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100
                  "
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {products.length} products loaded
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Required headers: name, price. Optional: category, description, stock, image.
              </p>
              {csvError && (
                <p className="text-sm text-red-500 mt-2">{csvError}</p>
              )}
            </div>

            {/* Policies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Policies & Context</label>
              <textarea
                value={policies}
                onChange={(e) => setPolicies(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="Enter return policies, shipping info, or any other context the bot needs..."
              />
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={handleSave}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-all transform active:scale-95 font-medium shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Save & Update Bot
              </button>
            </div>
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Add to WordPress</h2>
            <p className="text-gray-600 text-sm">
              To add this chatbot to your WordPress site, simply copy the code below and paste it into a 
              <strong> Custom HTML</strong> widget or right before the closing <code>&lt;/body&gt;</code> tag in your theme's <code>footer.php</code>.
            </p>
            
            <div className="bg-gray-900 rounded-lg p-4 relative group">
              <code className="text-green-400 font-mono text-xs break-all whitespace-pre-wrap">
                {embedCode}
              </code>
              <button 
                onClick={() => navigator.clipboard.writeText(embedCode)}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                Copy
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="text-yellow-800 font-bold text-sm mb-1">Important Note</h4>
              <p className="text-yellow-700 text-xs">
                Since this is a client-side demo, your configuration is saved in your browser's local storage. 
                For the embed to work with your specific data, you must configure the bot on the <strong>same domain</strong> where this app is hosted, 
                and the user's browser must be able to access local storage. In a real production app, we would use a database ID in the URL.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;