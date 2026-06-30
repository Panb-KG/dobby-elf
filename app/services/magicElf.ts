import { error } from '../lib/console';
import { DOBI_SYSTEM_INSTRUCTION, DOBI_TOOLS } from './dobi-config';

export interface Message {
  role: "user" | "model";
  text: string;
  files?: { mimeType: string; data: string }[];
  timestamp?: number;
}

export interface ChatOptions {
  messages: { role: string; content: string; files?: { mimeType: string; data: string }[] }[];
  signal?: AbortSignal;
}

export interface ChatResponse {
  text: string;
}

export class DobiService {
  async chat(options: ChatOptions): Promise<ChatResponse> {
    const { messages, signal } = options;
    let fullText = '';
    for await (const chunk of this.chatStream(
      messages.map(m => ({ role: m.role as 'user' | 'model', text: m.content, files: m.files }))
    )) {
      if (typeof chunk === 'string') fullText += chunk;
    }
    return { text: fullText };
  }

  async generateMagicImage(prompt: string): Promise<string | null> {
    try {
      let token: string | null = null;
      if (typeof window !== 'undefined') token = localStorage.getItem('dobi_auth_token');
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Image generation failed');
      const data = await response.json();
      return data.url;
    } catch (error) {
      error("Image generation failed:", error);
      return null;
    }
  }

  async *chatStream(messages: Message[]) {
    try {
      let token: string | null = null;
      if (typeof window !== 'undefined') token = localStorage.getItem('dobi_auth_token');

      const hasImages = messages.some(m => m.files && m.files.some(f => f.mimeType.startsWith('image/')));
      const model = hasImages ? 'qwen3.6-flash' : 'qwen3.6-flash';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.text, files: m.files })),
          model,
          systemInstruction: DOBI_SYSTEM_INSTRUCTION,
          tools: DOBI_TOOLS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        error('Chat API error - Status:', response.status, response.statusText);
        error('Chat API error - Text:', errorText || '(empty response)');
        let errorMessage = `Chat failed: ${response.status} ${response.statusText}`;
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            error('Chat API error - JSON:', errorJson);
            if (errorJson.error) errorMessage = `API Error: ${errorJson.error}`;
            else if (errorJson.message) errorMessage = `API Error: ${errorJson.message}`;
          } catch (e) {
            if (errorText.trim()) errorMessage = `API Error: ${errorText.substring(0, 200)}`;
          }
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          let jsonStr = trimmed;
          if (trimmed.startsWith('data: ')) jsonStr = trimmed.slice(6);
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);
            if (data.choices && data.choices[0]) {
              const delta = data.choices[0].delta;
              if (delta && delta.content) yield delta.content;
              if (data.choices[0].delta?.tool_calls) {
                const toolCalls = data.choices[0].delta.tool_calls;
                yield { functionCalls: toolCalls.map((tc: { function?: { name?: string; arguments?: string } }) => ({
                  name: tc.function?.name,
                  args: tc.function?.arguments ? JSON.parse(tc.function.arguments) : {}
                })) };
              }
            } else if (data.output && data.output.text) {
              yield data.output.text;
            } else if (data.output?.tool_calls) {
              yield { functionCalls: data.output.tool_calls.map((tc: { function: { name: string; arguments: string } }) => ({
                name: tc.function.name,
                args: JSON.parse(tc.function.arguments)
              })) };
            }
          } catch (e) { /* ignore parse errors */ }
        }
      }
    } catch (error) {
      error('Chat stream error:', error);
      yield '哎呀,多比的魔法出了一点小状况... 请稍后再试。🪄';
    }
  }
}

export const dobi = new DobiService();
