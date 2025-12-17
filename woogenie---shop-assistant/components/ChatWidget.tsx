import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Loader2, Bot, RefreshCw } from 'lucide-react';
import { Product, KnowledgeDocument, ChatMessage } from '../types';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { Chat } from '@google/genai';

interface ChatWidgetProps {
  products: Product[];
  documents: KnowledgeDocument[];
  storeName: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ products, documents, storeName }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: `Hi there! Welcome to ${storeName}. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or Reset Chat Session when data changes
  useEffect(() => {
    try {
      if (process.env.API_KEY) {
        const session = createChatSession(products, documents, storeName);
        setChatSession(session);
        // Reset messages if data significantly changed? Maybe optional.
        // For this demo, let's keep history but update session context for new turns.
      }
    } catch (e) {
      console.error("Failed to init chat session", e);
    }
  }, [products, documents, storeName]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToGemini(chatSession, userMsg.text);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const resetChat = () => {
    setMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: `Hi there! Welcome to ${storeName}. How can I help you today?`,
        timestamp: new Date()
    }]);
    if(process.env.API_KEY) {
        const session = createChatSession(products, documents, storeName);
        setChatSession(session);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center justify-center z-50 animate-bounce"
      >
        <MessageSquare className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-50">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
             <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Customer Support</h3>
            <p className="text-xs text-indigo-100 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
            <button onClick={resetChat} className="p-1.5 hover:bg-white/10 rounded-full transition" title="Reset Chat">
                <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                 <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
              <div className={`text-[10px] mt-1 text-right opacity-70 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-500">Typing...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm text-slate-700"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400">Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};