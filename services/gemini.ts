import { GoogleGenAI } from "@google/genai";
import { AdviceRequest } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client only if the key exists to avoid runtime crashes on init, 
// though the app won't function fully without it.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getFinancialAdvice = async (data: AdviceRequest, query: string): Promise<string> => {
  if (!ai) return "API Key is missing. Please check your configuration.";

  try {
    const prompt = `
      You are a wise and practical financial advisor for an Indian user.
      
      **User's Financial Context:**
      1. **Saving Goals:** ${JSON.stringify(data.goals)}
      2. **Current Investment Portfolio:** ${JSON.stringify(data.investments)}
      3. **Recent Spending:** ${JSON.stringify(data.transactions.slice(0, 20))}
      4. **Budgets:** ${JSON.stringify(data.budgets)}
      
      **User's Question:** "${query}"

      **Advisor Guidelines:**
      1. **Goal-Based Investing:** If the query relates to investing or saving, you MUST analyze the user's 'Saving Goals'.
         - **Short-term Goals** (e.g., Vacation, Gadgets, Emergency Fund): Recommend low-risk instruments like Liquid Funds, Recurring Deposits (RD), or High-yield Savings Accounts. Explain that capital protection is key here.
         - **Medium-term Goals** (e.g., Car, Wedding, 3-5 years): Recommend balanced options like Hybrid Funds, Corporate Bonds, or Conservative Equity.
         - **Long-term Goals** (e.g., Retirement, House, Children's Education, >5 years): Recommend growth-oriented assets like Nifty 50 Index Funds, Flexi-cap Funds, Sovereign Gold Bonds (SGB), or Stocks. Explain that these beat inflation over time.
      
      2. **Personalization:** Explicitly reference their specific goals by name in your advice (e.g., "Since you are saving for '${data.goals.find(g => g.priority === 1)?.name || 'your goals'}', consider...").
      
      3. **Risk Profile:** If the user has no 'Emergency Fund' goal or investment, prioritize suggesting that before high-risk equity.
      
      4. **Tone:** Encouraging, educational, and professional. Use Markdown with bullet points for readability.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I couldn't generate advice at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while analyzing your finances.";
  }
};

export const analyzeSpendingHabits = async (data: AdviceRequest): Promise<string> => {
  if (!ai) return "API Key is missing.";

  try {
    const prompt = `
      Analyze this user's spending habits and investment portfolio based on the data provided.
      Transactions: ${JSON.stringify(data.transactions.slice(0, 50))}
      Investments: ${JSON.stringify(data.investments)}
      
      Identify 3 key areas where they can save money or improve investment returns.
      Identify if they are on track for their saving goals: ${JSON.stringify(data.goals)}.
      
      Output format: Markdown. Brief and high impact.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Could not complete analysis.";
  }
};

export const generateFinancialReport = async (data: AdviceRequest, userName: string): Promise<string> => {
  if (!ai) return "API Key is missing.";

  try {
    const estimatedBalance = data.budgets.reduce((acc, b) => acc + b.limit - b.spent, 0);

    const prompt = `
      Generate a formal, professional Monthly Financial Health Report for ${userName}.
      Date: ${new Date().toLocaleDateString()}
      
      **Financial Data Overview:**
      - Estimated Remaining Budget: ₹${estimatedBalance}
      - Total Investments: ₹${data.investments.reduce((acc, i) => acc + i.currentValue, 0)}
      - Savings Goals Active: ${data.goals.length}
      - Recent Transactions: ${JSON.stringify(data.transactions.slice(0, 20))}
      - Budgets Breakdown: ${JSON.stringify(data.budgets)}
      - Goals Progress: ${JSON.stringify(data.goals)}

      **Report Structure:**
      1. **Executive Summary**: A high-level assessment of the user's financial month.
      2. **Cash Flow Analysis**: Analyze spending vs budget limits. Highlight overspent categories.
      3. **Savings & Goals Tracker**: Progress report on top priority goals.
      4. **Investment Portfolio Health**: Brief comment on asset allocation.
      5. **Strategic Recommendations**: 3 concrete steps for next month.

      **Formatting:**
      - Use strictly Markdown.
      - Use Tables for data presentation where effective.
      - Use ## for section headers.
      - Tone: Professional, authoritative yet supportive.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Report Error:", error);
    return "Could not generate report due to an error.";
  }
};

export const processVoiceCommand = async (transcript: string, categories: string[], currentData: AdviceRequest) => {
  if (!ai) return { type: 'ERROR', message: "API Key Missing" };

  try {
    const estimatedBalance = currentData.budgets.reduce((acc, b) => acc + b.limit - b.spent, 0);
    
    const prompt = `
      You are an intelligent financial assistant specializing in Indian contexts.
      You must understand English, **Hinglish** (Hindi + English), and **Thanglish** (Tamil + English).

      **User Voice Input:** "${transcript}"
      
      **Context:**
      - **Available Categories:** ${JSON.stringify(categories)}
      - **Estimated Balance:** ₹${estimatedBalance}
      - **Recent Transactions:** ${JSON.stringify(currentData.transactions.slice(0, 3).map(t => `${t.description} (₹${t.amount})`))}

      **Goal:** Classify the user's intent and extract structured JSON data.

      **INTENT 1: ADD_TRANSACTION**
      - **Trigger:** User mentions spending money, buying something, or a cost.
      - **Common Words:** "spent", "paid", "bought", "kharch", "gaye", "diya", "uda diye", "aachu", "pannen", "koduthen", "selavu".
      - **Action:**
        1. **Amount:** Extract the number. Handle suffixes like "k" (e.g., "1.5k" -> 1500, "2k" -> 2000).
        2. **Description:** Extract what was bought. Translate Hindi/Tamil words to English (e.g., "Khana" -> "Food", "Padam" -> "Movie").
        3. **Category:** Map to the *strictly* closest match from the Available Categories list.

      **INTENT 2: QUERY**
      - **Trigger:** User asks about their financial status, balance, or spending habits.
      - **Common Words:** "how much", "balance", "total", "waste", "kitna", "bacha", "evlo", "status", "report".
      - **Action:** Provide a short, friendly, text-based answer using the Context data.

      **Examples for Training:**
      - Input: "I spent 120 on coffee" 
        -> {"type": "ADD_TRANSACTION", "amount": 120, "description": "Coffee", "category": "Food & Groceries"}
      - Input: "Aaj taxi mein 500 lag gaye" (Hinglish)
        -> {"type": "ADD_TRANSACTION", "amount": 500, "description": "Taxi Ride", "category": "Transportation"}
      - Input: "Movie ku 300 aachu" (Thanglish)
        -> {"type": "ADD_TRANSACTION", "amount": 300, "description": "Movie Ticket", "category": "Entertainment"}
      - Input: "Shopping ke liye 2k diya"
        -> {"type": "ADD_TRANSACTION", "amount": 2000, "description": "Shopping", "category": "Shopping"}
      - Input: "How much did I waste this week?"
        -> {"type": "QUERY", "answer": "You have recently spent on [Recent Transaction Items]. Your remaining budget across categories is approx ₹${estimatedBalance}."}

      **Output Format:** Return ONLY raw JSON. No markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);

  } catch (error) {
    console.error("Voice Processing Error:", error);
    return { type: 'ERROR', message: "Could not understand command." };
  }
};
