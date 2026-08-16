
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category } from "../types";

const modelName = 'gemini-2.5-flash';

// Helper to get AI instance safely
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Parses a natural language string into structured expense/income data using Gemini.
 */
export const parseExpenseNaturalLanguage = async (input: string): Promise<Partial<Expense> | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Parse the following financial transaction description into structured data. 
      Today is ${new Date().toISOString().split('T')[0]}. 
      Default currency is INR (₹). If the user mentions "Salary" or "Received", it is likely Income.
      Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The numeric value of the transaction." },
            category: { 
              type: Type.STRING, 
              enum: Object.values(Category),
              description: "The category that best fits."
            },
            type: {
              type: Type.STRING,
              enum: ['income', 'expense'],
              description: "Whether this is money coming in (income) or going out (expense)."
            },
            date: { type: Type.STRING, description: "ISO 8601 date string (YYYY-MM-DD)." },
            description: { type: Type.STRING, description: "A brief, clean description." }
          },
          required: ["amount", "category", "description", "date", "type"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<Expense>;
    }
    return null;
  } catch (error) {
    console.error("Error parsing expense with Gemini:", error);
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
    // Summarize expenses for context to save tokens/complexity, or pass raw if list is small.
    // For this demo, we pass the last 50 expenses.
    const recentExpenses = expenses.slice(0, 50).map(e => 
      `- ${e.date}: ${e.type === 'income' ? '+' : '-'}₹${e.amount} [${e.category}] ${e.description}`
    ).join('\n');

    const systemInstruction = `
      You are a savvy, intelligent financial advisor for an Indian user.
      Currency: INR (₹).
      
      You have access to the user's recent transaction history:
      ${recentExpenses}
      
      Analyze the user's spending habits, answer their questions, and provide constructive feedback.
      If they are spending too much on Food or Shopping, gently warn them.
      Encourage savings and investments (SIPs, Mutual Funds) if appropriate context arises.
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