
import { AIProvider, AIConfig, AIMessage, AIProviderType } from "./types";
import { GeminiProvider } from "./gemini";
import { AzureOpenAIProvider } from "./azure";

export class AIService {
  private provider: AIProvider;
  private static instance: AIService;

  private constructor(config: AIConfig) {
    if (config.provider === 'azure' && config.azureEndpoint && config.azureApiKey && config.azureDeployment) {
      this.provider = new AzureOpenAIProvider(
        config.azureEndpoint,
        config.azureApiKey,
        config.azureDeployment,
        config.azureApiVersion || '2023-05-15'
      );
    } else if (config.provider === 'gemini' && config.geminiApiKey) {
      this.provider = new GeminiProvider(config.geminiApiKey);
    } else {
      throw new Error("Invalid AI Configuration");
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      const provider = (import.meta.env.VITE_AI_DEFAULT_PROVIDER as AIProviderType) || 'gemini';
      
      AIService.instance = new AIService({
        provider,
        geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
        azureApiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
        azureEndpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
        azureDeployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME,
        azureApiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION,
      });
    }
    return AIService.instance;
  }

  public async sendMessage(messages: AIMessage[]): Promise<string> {
    return this.provider.generateResponse(messages);
  }
}

export const aiService = AIService.getInstance();
