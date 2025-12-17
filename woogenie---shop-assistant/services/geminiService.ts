import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Product, KnowledgeDocument } from '../types';

const MODEL_NAME = 'gemini-3-flash-preview';

export const createChatSession = (
  products: Product[],
  documents: KnowledgeDocument[],
  storeName: string
): Chat => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct the knowledge base string
  const productContext = products.length > 0 
    ? `PRODUCT CATALOG (CSV DATA):\n${JSON.stringify(products.slice(0, 200), null, 2)}` // Limit to 200 for safety in this demo, though 3-flash handles 1M tokens.
    : "No products uploaded yet.";

  const docContext = documents.length > 0
    ? `ADDITIONAL STORE POLICIES & DOCS:\n${documents.map(d => `--- ${d.name} ---\n${d.content}`).join('\n\n')}`
    : "No additional documents.";

  const systemInstruction = `
    You are WooGenie, a helpful and polite AI customer support assistant for an online store named "${storeName}".
    
    YOUR KNOWLEDGE BASE:
    ${productContext}
    
    ${docContext}

    INSTRUCTIONS:
    1. Answer customer questions specifically based on the provided Product Catalog and Documents.
    2. If a customer asks about a product, check the catalog for price, stock status, and description.
    3. If the stock_status is 'outofstock', kindly inform them it is unavailable.
    4. If the answer is not in the provided data, politely say you don't have that information and suggest they contact support manually.
    5. Keep answers concise, friendly, and professional.
    6. Do not make up product details.
    7. Format prices nicely (e.g., add currency symbol if missing).
  `;

  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.4, // Keep it relatively factual
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the server right now. Please try again later.";
  }
};
