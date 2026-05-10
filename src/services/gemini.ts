import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type ToolType = 'writer' | 'summarizer' | 'coder' | 'translator' | 'ideator' | 'image';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function generateContent(prompt: string, systemInstruction?: string, history: ChatMessage[] = []) {
  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateImage(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image API Error:", error);
    throw error;
  }
}
