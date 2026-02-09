export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[]; // Base64 strings
}

export interface ToolCall {
  id?: string;
  name: string;
  args: any;
}

export interface AIResponse {
  content: string;
  toolCalls?: ToolCall[];
}

export interface AIProvider {
  generateResponse(messages: AIMessage[], tools?: any[]): Promise<AIResponse>;
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