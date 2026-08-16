
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category } from "../types";

const modelName = 'gemini-2.5-flash';

// Helper to get AI instance safely
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Parses natural language text or Bank SMS dumps into structured expense/income data.
 * Can handle multiple transactions in a single block of text.
 */
export const parseTransactionsFromText = async (input: string): Promise<Partial<Expense>[] | null> => {
  try {
    const ai = getAI();
    const today = new Date().toISOString().split('T')[0];
    
    const prompt = `
      You are an advanced financial transaction parser optimized for Indian Bank SMS and Statement formats.
      Today is ${today}. Default currency is INR (₹).
      
      Task: Analyze the input text and extract ALL financial transactions.
      
      Input Text:
      "${input}"
      
      Rules:
      1. Detect multiple transactions if present.
      2. 'Debited', 'Spent', 'Sent', 'Paid' = type: 'expense'.
      3. 'Credited', 'Received', 'Deposit', 'Salary' = type: 'income'.
      4. Infer the Category based on the merchant name or description (e.g., 'Zomato' -> Food, 'Shell' -> Fuel, 'Netflix' -> Entertainment).
      5. If date is missing, use ${today}.
      6. If description is vague, use the merchant name (e.g., "Paid to UPI-12345" -> Description: "UPI Payment").
      
      Output JSON Schema: Array of objects.
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
              amount: { type: Type.NUMBER, description: "Transaction amount" },
              category: { 
                type: Type.STRING, 
                enum: Object.values(Category),
                description: "Inferred category"
              },
              type: {
                type: Type.STRING,
                enum: ['income', 'expense'],
                description: "Transaction type"
              },
              date: { type: Type.STRING, description: "YYYY-MM-DD" },
              description: { type: Type.STRING, description: "Merchant or Description" }
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
    return null;
  } catch (error) {
    console.error("Error parsing transactions with Gemini:", error);
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
