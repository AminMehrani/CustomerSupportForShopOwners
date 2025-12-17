import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { StoreContext, ChatMessage } from "../types";

let chatSession: Chat | null = null;

const createSystemInstruction = (context: StoreContext): string => {
  const productCatalog = context.products.map(p => 
    `- ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, Category: ${p.category}, Stock: ${p.stockStatus}\n  Description: ${p.description}`
  ).join('\n');

  return `
You are a helpful and friendly AI sales assistant for an online store named "${context.storeName}".

YOUR KNOWLEDGE BASE:
1. **Store Policies**:
${context.policies}

2. **Product Catalog**:
${productCatalog}

INSTRUCTIONS:
- Answer customer questions accurately based *only* on the provided knowledge base.
- If a user asks about a product, provide details like price and stock status.
- If a user asks for recommendations, suggest products from the catalog that fit their needs.
- If the answer is not in the knowledge base, politely say you don't have that information and suggest they contact support.
- Keep answers concise (under 100 words) unless a detailed explanation is requested.
- Use a professional yet warm tone.
- Do not make up products or policies that are not listed.
`;
};

export const initializeChat = (context: StoreContext) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: createSystemInstruction(context),
      temperature: 0.4, // Lower temperature for more factual responses
      maxOutputTokens: 500,
    },
  });
};

export const sendMessageToGemini = async function* (
  message: string
): AsyncGenerator<string, void, unknown> {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const responseStream = await chatSession.sendMessageStream({ message });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "I'm having trouble connecting to the store's brain right now. Please try again later.";
  }
};