
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category } from "../types";
import { parseLocalSMS } from "./regexService";

const modelName = 'gemini-2.5-flash';

// Helper to get AI instance safely
const getAI = () => {
  // If API key is missing, return null to trigger fallback immediately
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper: Convert File to Base64 for Gemini
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Parses natural language text or Bank SMS dumps into structured expense/income data.
 */
export const parseTransactionsFromText = async (input: string): Promise<Partial<Expense>[] | null> => {
  try {
    const ai = getAI();
    
    // 1. Immediate Fallback: Use Regex if no API Key or for simple SMS inputs
    // This ensures the feature "works" even without backend AI
    if (!ai) {
        console.log("Using Local Regex Parser (No API Key)");
        const localResult = parseLocalSMS(input);
        return localResult.length > 0 ? localResult : null;
    }

    const today = new Date().toISOString().split('T')[0];
    
    const prompt = `
      You are an advanced financial transaction parser optimized for raw clipboard text from Indian SMS and Payment Apps.
      Today is ${today}. Currency: INR (₹).
      
      Input Text:
      "${input}"
      
      Task: Extract every financial transaction found.
      
      Heuristics:
      - 'Debited', 'Spent', 'Sent to', 'Paid to', 'Purchase' -> Expense
      - 'Credited', 'Received from', 'Deposit', 'Refund' -> Income
      - 'VPA', 'UPI', 'MMT', 'NEFT' -> Transfer indicators
      
      Rules:
      1. Parse MULTIPLE transactions if present.
      2. If date is missing, assume ${today}.
      3. Infer Category from merchant name (e.g. Swiggy->Food).
      4. IGNORE OTPs, balance inquiries, or spam.
      
      Output Schema (JSON Array):
      [{ amount: number, category: string, type: 'income'|'expense', date: 'YYYY-MM-DD', description: string }]
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING, enum: Object.values(Category) },
              type: { type: Type.STRING, enum: ['income', 'expense'] },
              date: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["amount", "category", "description", "date", "type"]
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    
    // If AI returns empty text, try regex as backup
    return parseLocalSMS(input);

  } catch (error) {
    console.warn("AI Parsing failed, falling back to Local Regex:", error);
    // Silent failover to local parser so user gets a result
    return parseLocalSMS(input);
  }
};

/**
 * Parses a screenshot of a transaction (GPay, Paytm, Bank App)
 */
export const parseTransactionFromImage = async (imageFile: File): Promise<Partial<Expense>[] | null> => {
  try {
    const ai = getAI();
    if (!ai) throw new Error("AI functionality unavailable");

    const imagePart = await fileToGenerativePart(imageFile);
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
      Analyze this image (Screenshot of Payment App or Bank SMS).
      Extract transaction details.
      Today is ${today}.
      
      - Look for 'Paid to', 'Sent to', 'Debited' (Expense).
      - Look for 'Received from', 'Credited' (Income).
      - Extract Amount and Date.
      - Infer Category from merchant logo/name.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: 'user',
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING, enum: Object.values(Category) },
              type: { type: Type.STRING, enum: ['income', 'expense'] },
              date: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["amount", "category", "description", "type"]
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return null;

  } catch (error) {
    console.error("Error parsing image:", error);
    throw error;
  }
};

/**
 * Generates financial advice or analysis based on current expenses and user query.
 */
export const getFinancialAdvice = async (
  history: { role: 'user' | 'model', text: string }[],
  expenses: Expense[],
  userMessage: string
): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "I need an internet connection and API key to provide advice. Please check your settings.";

    // Summarize expenses for context
    const recentExpenses = expenses.slice(0, 50).map(e => 
      `- ${e.date}: ${e.type === 'income' ? '+' : '-'}₹${e.amount} [${e.category}] ${e.description}`
    ).join('\n');

    const systemInstruction = `
      You are a savvy, intelligent financial advisor for an Indian user.
      Currency: INR (₹).
      
      You have access to the user's recent transaction history:
      ${recentExpenses}
      
      Analyze the user's spending habits, answer their questions, and provide constructive feedback.
      Be concise, encouraging, and data-driven.
      Formatting: Use Markdown.
    `;

    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I'm sorry, I couldn't generate a response.";

  } catch (error) {
    console.error("Error getting advice:", error);
    return "I'm having trouble connecting to my financial brain right now. Please try again later.";
  }
};
