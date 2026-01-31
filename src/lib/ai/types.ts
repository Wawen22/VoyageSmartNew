
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  generateResponse(messages: AIMessage[]): Promise<string>;
}

export type AIProviderType = 'gemini' | 'azure';

export interface AIConfig {
  provider: AIProviderType;
  geminiApiKey?: string;
  azureApiKey?: string;
  azureEndpoint?: string;
  azureDeployment?: string;
  azureApiVersion?: string;
}
