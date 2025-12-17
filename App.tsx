import React, { useState } from 'react';
import { StoreConfig } from './components/StoreConfig';
import { ChatWidget } from './components/ChatWidget';
import { Product, KnowledgeDocument } from './types';
import { LayoutDashboard, MessageSquareText } from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [storeName, setStoreName] = useState('My WooCommerce Store');

  // Check for API Key
  if (!process.env.API_KEY) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 p-4">
              <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100">
                  <h2 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h2>
                  <p className="text-sm text-slate-600 mb-4">
                      The <code className="bg-slate-100 px-2 py-1 rounded">API_KEY</code> environment variable is missing. 
                      This application requires a valid Google Gemini API key to function.
                  </p>
                  <p className="text-xs text-slate-400">
                      Please restart the environment with the API key configured.
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      
      {/* Sidebar - Visual only for this demo */}
      <div className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
             <span className="text-white font-bold text-lg">W</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">WooGenie</span>
        </div>
        <div className="p-4 space-y-2">
            <div className="flex items-center px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-lg cursor-pointer">
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">Dashboard</span>
            </div>
            <div className="flex items-center px-4 py-3 hover:bg-slate-800 rounded-lg cursor-not-allowed opacity-50">
                <MessageSquareText className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">Chat Logs</span>
            </div>
        </div>
        <div className="mt-auto p-6 text-xs text-slate-500">
            v1.0.0
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-800">Plugin Dashboard</h1>
            <div className="flex items-center space-x-4">
               <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                   Active
               </div>
               <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                   A
               </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
                <StoreConfig 
                    products={products}
                    documents={documents}
                    storeName={storeName}
                    setProducts={setProducts}
                    setDocuments={setDocuments}
                    setStoreName={setStoreName}
                />
            </div>
        </main>

      </div>

      {/* Floating Chat Widget Overlay */}
      <ChatWidget 
        products={products}
        documents={documents}
        storeName={storeName}
      />
      
    </div>
  );
};

export default App;