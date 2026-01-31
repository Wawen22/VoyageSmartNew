
import OpenAI from "openai";
import { AIProvider, AIMessage } from "./types";

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

  async generateResponse(messages: AIMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        model: this.deployment, // Azure uses deployment name as model usually, or strictly in URL
      });

      return response.choices[0]?.message?.content || "No response generated.";
    } catch (error) {
      console.error("Azure OpenAI Error:", error);
      throw error;
    }
  }
}
