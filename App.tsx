import React, { useState, useEffect } from 'react';
import { StoreContext, AppMode } from './types';
import AdminPanel from './components/AdminPanel';
import ChatWidget from './components/ChatWidget';
import { initializeChat } from './services/geminiService';
import { saveConfig, loadConfig } from './utils';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.ADMIN);
  const [storeContext, setStoreContext] = useState<StoreContext>({
    storeName: "My WooCommerce Store",
    policies: "",
    products: []
  });
  const [isBotReady, setIsBotReady] = useState(false);

  // Initialize from storage or URL params
  useEffect(() => {
    // 1. Check for persisted config
    const savedContext = loadConfig();
    if (savedContext) {
      setStoreContext(savedContext);
      initializeChat(savedContext);
      setIsBotReady(true);
    }

    // 2. Check for Embed Mode in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'embed') {
      setMode(AppMode.EMBED);
      // In a real app, we would fetch config by ID here
      // For this demo, we rely on the localStorage loaded above
    }
  }, []);

  const handleSaveConfig = (newContext: StoreContext) => {
    setStoreContext(newContext);
    saveConfig(newContext); // Persist
    initializeChat(newContext);
    setIsBotReady(true);
    // Don't auto-switch if we are just saving, let user choose
  };

  // RENDER FOR EMBED MODE (Transparent, just the widget)
  if (mode === AppMode.EMBED) {
    return (
        <div className="w-full h-full bg-transparent">
            {isBotReady ? (
                // Pass pointer-events-auto to ensure interaction works inside the iframe
                <div className="pointer-events-auto">
                    <ChatWidget storeName={storeContext.storeName} />
                </div>
            ) : (
                <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow text-xs">
                    Bot not configured
                </div>
            )}
        </div>
    );
  }

  // RENDER FOR STANDARD APP
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">WooGemini <span className="text-purple-600">Plugin</span></h1>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMode(AppMode.ADMIN)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              mode === AppMode.ADMIN 
                ? 'bg-white text-purple-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => setMode(AppMode.CUSTOMER)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              mode === AppMode.CUSTOMER 
                ? 'bg-white text-purple-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Customer View
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50 relative">
        {mode === AppMode.ADMIN && (
          <div className="container mx-auto py-10 px-4 animate-fade-in">
             <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    Turn your store into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Smart AI Assistant</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload your product CSV and store policies. We'll generate a custom AI chatbot that recommends products and answers support tickets instantly.
                </p>
             </div>
            <AdminPanel 
              onSaveConfig={handleSaveConfig} 
              currentContext={storeContext} 
            />
          </div>
        )}

        {mode === AppMode.CUSTOMER && (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-dot-pattern">
            {/* Mock Store Front */}
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden opacity-90 blur-[1px] hover:blur-none transition-all duration-500 min-h-[80vh] flex flex-col">
               <div className="border-b p-6 flex justify-between items-center bg-white">
                    <h2 className="text-2xl font-bold font-serif">{storeContext.storeName}</h2>
                    <div className="flex gap-6 text-sm font-medium text-gray-500">
                        <span>Home</span>
                        <span>Shop</span>
                        <span>About</span>
                        <span>Contact</span>
                    </div>
               </div>
               
               <div className="p-8 bg-gray-50 flex-1">
                   <div className="h-64 bg-gray-200 rounded-xl mb-8 flex items-center justify-center text-gray-400">
                       Hero Banner Placeholder
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {storeContext.products.slice(0, 3).map((p) => (
                             <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                 <div className="h-48 bg-gray-100 rounded-md mb-4 bg-cover bg-center" style={{backgroundImage: `url(${p.imageUrl})`}}></div>
                                 <h3 className="font-semibold text-gray-800">{p.name}</h3>
                                 <p className="text-purple-600 font-bold mt-1">${p.price}</p>
                             </div>
                        ))}
                        {storeContext.products.length === 0 && (
                             [1,2,3].map(i => (
                                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                             ))
                        )}
                   </div>
               </div>
            </div>

            {/* The Actual Widget */}
            {isBotReady ? (
                <ChatWidget storeName={storeContext.storeName} />
            ) : (
                <div className="fixed bottom-10 right-10 bg-black/80 text-white px-6 py-4 rounded-lg backdrop-blur-md z-50">
                    <p>Please configure the bot in <strong>Admin Dashboard</strong> first.</p>
                </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} WooGemini Plugin. Optimized for Netlify.
      </footer>
    </div>
  );
};

export default App;