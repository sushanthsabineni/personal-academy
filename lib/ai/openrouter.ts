// OpenRouter AI Service Integration
// Unified API for 100+ AI models through a single endpoint
// Documentation: https://openrouter.ai/docs

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterOptions {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
    index: number;
  }>;
}

export interface OpenRouterStreamEvent {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  error?: string;
  totalTokens?: number;
}

/**
 * Call OpenRouter API with specified model and fallback support
 * @param apiKey OpenRouter API key
 * @param options Request options
 * @param fallbackModels Optional array of fallback models to try
 * @returns OpenRouter response
 */
export async function callOpenRouter(
  apiKey: string,
  options: OpenRouterOptions,
  fallbackModels: string[] = []
): Promise<OpenRouterResponse> {
  const modelsToTry = [options.model, ...fallbackModels];
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://personalacademy.app',
          'X-Title': 'Personal Academy',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          top_p: options.topP ?? 1,
          frequency_penalty: options.frequencyPenalty ?? 0,
          presence_penalty: options.presencePenalty ?? 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        const errorMessage = (errorData.error as Record<string, unknown>)?.message || response.statusText;
        lastError = new Error(
          `OpenRouter API error (${model}): ${response.status} - ${errorMessage}`
        );
        console.warn(`Failed with ${model}, trying fallback...`, lastError);
        continue;
      }

      const data = await response.json() as OpenRouterResponse;
      return data;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Error with model ${model}:`, lastError);
      continue;
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
}

/**
 * Stream responses from OpenRouter API
 * Yields partial responses as they arrive
 * @param apiKey OpenRouter API key
 * @param options Request options
 * @param onChunk Callback for each chunk received
 * @param fallbackModels Optional array of fallback models to try
 */
export async function* streamOpenRouter(
  apiKey: string,
  options: OpenRouterOptions,
  fallbackModels: string[] = []
): AsyncGenerator<OpenRouterStreamEvent> {
  const modelsToTry = [options.model, ...fallbackModels];
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://personalacademy.app',
          'X-Title': 'Personal Academy',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          top_p: options.topP ?? 1,
          frequency_penalty: options.frequencyPenalty ?? 0,
          presence_penalty: options.presencePenalty ?? 0,
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        const errorMessage = (errorData.error as Record<string, unknown>)?.message || response.statusText;
        lastError = new Error(
          `OpenRouter API error (${model}): ${response.status} - ${errorMessage}`
        );
        console.warn(`Failed with ${model}, trying fallback...`, lastError);
        continue;
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;

            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6)) as Record<string, unknown>;
                const choices = data.choices as Array<Record<string, unknown>>;
                const chunk = (choices?.[0]?.delta as Record<string, unknown>)?.content;
                if (chunk) {
                  yield {
                    type: 'chunk',
                    content: chunk as string,
                  };
                }
              } catch (e) {
                console.warn('Failed to parse stream chunk:', e);
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim() && !buffer.trim().startsWith('data: [DONE]')) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6)) as Record<string, unknown>;
              const choices = data.choices as Array<Record<string, unknown>>;
              const chunk = (choices?.[0]?.delta as Record<string, unknown>)?.content;
              if (chunk) {
                yield {
                  type: 'chunk',
                  content: chunk as string,
                };
              }
            } catch (e) {
              console.warn('Failed to parse final stream chunk:', e);
            }
          }
        }

        yield { type: 'done' };
        return;
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      lastError = error as Error;
      console.warn(`Stream error with model ${model}:`, lastError);
      continue;
    }
  }

  yield {
    type: 'error',
    error: lastError?.message || 'All OpenRouter streaming attempts failed',
  };
}

/**
 * Get list of available models on OpenRouter
 * Note: This is a static list for demo purposes
 * In production, you might fetch this from the OpenRouter API
 */
export function getAvailableModels(): Array<{
  value: string;
  label: string;
  provider: string;
  pricing: { input: number; output: number };
  description: string;
}> {
  return [
    // OpenAI Models
    {
      value: 'openai/gpt-4o',
      label: 'GPT-4 Omni',
      provider: 'OpenAI',
      pricing: { input: 0.0025, output: 0.0075 },
      description: 'Latest GPT-4 model, best for quality',
    },
    {
      value: 'openai/gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: 'OpenAI',
      pricing: { input: 0.001, output: 0.003 },
      description: 'Fast GPT-4 variant',
    },
    {
      value: 'openai/gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      pricing: { input: 0.0005, output: 0.0015 },
      description: 'Fast and cost-effective',
    },

    // Anthropic Models
    {
      value: 'anthropic/claude-3-opus',
      label: 'Claude 3 Opus',
      provider: 'Anthropic',
      pricing: { input: 0.015, output: 0.075 },
      description: 'Anthropic\'s most capable model',
    },
    {
      value: 'anthropic/claude-3-sonnet',
      label: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      pricing: { input: 0.003, output: 0.015 },
      description: 'Balanced speed and quality',
    },
    {
      value: 'anthropic/claude-3-haiku',
      label: 'Claude 3 Haiku',
      provider: 'Anthropic',
      pricing: { input: 0.00025, output: 0.00125 },
      description: 'Fast and compact',
    },

    // Google Models
    {
      value: 'google/gemini-pro',
      label: 'Gemini Pro',
      provider: 'Google',
      pricing: { input: 0.00005, output: 0.00015 },
      description: 'Very fast and efficient',
    },
    {
      value: 'google/gemini-1.5-pro',
      label: 'Gemini 1.5 Pro',
      provider: 'Google',
      pricing: { input: 0.00075, output: 0.003 },
      description: 'Enhanced Gemini with better reasoning',
    },

    // Meta Models
    {
      value: 'meta-llama/llama-2-70b',
      label: 'Llama 2 70B',
      provider: 'Meta',
      pricing: { input: 0.0007, output: 0.0009 },
      description: 'Open-source, high quality',
    },
    {
      value: 'meta-llama/llama-2-13b',
      label: 'Llama 2 13B',
      provider: 'Meta',
      pricing: { input: 0.0002, output: 0.0003 },
      description: 'Smaller, faster model',
    },

    // Mistral Models
    {
      value: 'mistral/mistral-large',
      label: 'Mistral Large',
      provider: 'Mistral',
      pricing: { input: 0.00027, output: 0.00081 },
      description: 'Strong multi-language support',
    },
    {
      value: 'mistral/mistral-medium',
      label: 'Mistral Medium',
      provider: 'Mistral',
      pricing: { input: 0.000270, output: 0.000810 },
      description: 'Balanced performance',
    },

    // Other Models
    {
      value: 'gryphe/mythomist-7b',
      label: 'Mythomist 7B',
      provider: 'Gryphe',
      pricing: { input: 0.0002, output: 0.0002 },
      description: 'Creative writing focused',
    },
  ];
}

/**
 * Estimate cost for a request
 * @param model Model identifier
 * @param inputTokens Number of input tokens
 * @param outputTokens Number of output tokens
 * @returns Estimated cost in USD
 */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const models = getAvailableModels();
  const modelInfo = models.find(m => m.value === model);

  if (!modelInfo) {
    return 0;
  }

  return (
    (inputTokens / 1000) * modelInfo.pricing.input +
    (outputTokens / 1000) * modelInfo.pricing.output
  );
}

/**
 * Convert cost in USD to INR
 * @param usdAmount Amount in USD
 * @param exchangeRate USD to INR exchange rate (default: 83)
 * @returns Amount in INR
 */
export function usdToINR(usdAmount: number, exchangeRate: number = 83): number {
  return usdAmount * exchangeRate;
}

/**
 * Format cost for display
 * @param usdAmount Amount in USD
 * @param exchangeRate Exchange rate
 * @returns Formatted string
 */
export function formatCost(usdAmount: number, exchangeRate: number = 83): string {
  const inr = usdToINR(usdAmount, exchangeRate);
  if (inr < 1) {
    return `$${usdAmount.toFixed(4)}`;
  }
  return `₹${inr.toFixed(2)}`;
}
