import {
  GoogleGenerativeAI
} from "@google/generative-ai";
import { AIProvider, AIMessage } from "./types";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });
  }

  async generateResponse(messages: AIMessage[]): Promise<string> {
    try {
      const systemMessage = messages.find(m => m.role === 'system');
      
      // Configure model with system instruction if present
      const model = this.client.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        ...(systemMessage && { systemInstruction: systemMessage.content })
      });

      const chatHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

      const chat = model.startChat({
        history: chatHistory.slice(0, -1), // All except last
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini AI Error:", error);
      throw error;
    }
  }
}
