import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// NOTE: In a real app, never expose API keys on the client side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProductDescription = async (name: string, category: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Write a short, catchy, and professional product description (max 15 words) for a product named "${name}" in the category "${category}".`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Description generation unavailable.";
  }
};

export const analyzeInventoryHealth = async (products: Product[]): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Simplify data for the prompt to save tokens
    const inventorySummary = products.map(p => ({
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      profitMargin: p.price - p.cost
    }));

    const prompt = `
      Analyze this inventory data:
      ${JSON.stringify(inventorySummary)}
      
      Provide 3 brief, actionable insights focusing on restock needs and profit opportunities. 
      Format as a simple HTML list (<ul><li>...</li></ul>) without markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "<ul><li>Unable to analyze inventory at this time.</li></ul>";
  }
};
