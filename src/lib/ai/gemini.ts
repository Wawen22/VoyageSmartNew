import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIMessage, AIResponse } from "./types";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });
  }

  async generateResponse(messages: AIMessage[], tools?: any[]): Promise<AIResponse> {
    try {
      const systemMessage = messages.find(m => m.role === 'system');
      
      const modelConfig: any = {
        model: "gemini-2.5-flash",
        ...(systemMessage && { systemInstruction: systemMessage.content })
      };

      if (tools && tools.length > 0) {
        modelConfig.tools = [{ functionDeclarations: tools }];
      }

      // Re-initialize model with config
      this.model = this.client.getGenerativeModel(modelConfig);

      const formatMessageParts = (m: AIMessage) => {
        const parts: any[] = [{ text: m.content }];
        if (m.images && m.images.length > 0) {
          m.images.forEach(img => {
            let mimeType = "image/jpeg";
            let data = img;
            
            if (img.startsWith("data:")) {
              const matches = img.match(/^data:(.*?);base64,(.*)$/);
              if (matches) {
                mimeType = matches[1];
                data = matches[2];
              }
            }

            parts.push({
              inlineData: {
                data: data,
                mimeType: mimeType
              }
            });
          });
        }
        return parts;
      };

      const chatHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: formatMessageParts(m),
        }));

      const chat = this.model.startChat({
        history: chatHistory.slice(0, -1), // All except last
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(formatMessageParts(lastMessage));
      const response = await result.response;
      
      // Extract function calls
      const functionCalls = response.functionCalls();
      
      // Safely extract text
      let content = "";
      try {
        if (response.candidates && response.candidates[0].content.parts[0].text) {
           content = response.text();
        }
      } catch (e) {
        // Ignore if no text
      }

      return {
        content: content,
        toolCalls: functionCalls?.map(fc => ({
          name: fc.name,
          args: fc.args
        }))
      };

    } catch (error) {
      console.error("Gemini AI Error:", error);
      throw error;
    }
  }
}

