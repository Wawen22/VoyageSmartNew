export interface AIAttachment {
  url: string;
  name: string;
  type: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[]; // Base64 strings (legacy/simple)
  attachments?: AIAttachment[];
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