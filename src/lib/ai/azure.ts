
import OpenAI from "openai";
import { AIProvider, AIMessage, AIResponse } from "./types";

export class AzureOpenAIProvider implements AIProvider {
  private client: OpenAI;
  private deployment: string;

  constructor(endpoint: string, apiKey: string, deployment: string, apiVersion: string) {
    this.deployment = deployment;
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: `${endpoint}/openai/deployments/${deployment}`,
      defaultQuery: { 'api-version': apiVersion },
      defaultHeaders: { 'api-key': apiKey },
      dangerouslyAllowBrowser: true // Enable client-side usage
    });
  }

  async generateResponse(messages: AIMessage[], tools?: any[]): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        messages: messages.map(m => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content
        })),
        model: this.deployment,
        // Tools implementation skipped for Azure for now
      });

      return {
        content: response.choices[0]?.message?.content || "No response generated.",
        toolCalls: []
      };
    } catch (error) {
      console.error("Azure OpenAI Error:", error);
      throw error;
    }
  }
}
