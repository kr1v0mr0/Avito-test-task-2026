function ollamaBase(): string {
  if (import.meta.env.VITE_OLLAMA_VIA_PROXY === 'true') return '/ollama';
  if (import.meta.env.DEV) return '/ollama';
  return import.meta.env.VITE_OLLAMA_URL || 'http://127.0.0.1:11434';
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function ollamaGenerate(
  prompt: string,
  options?: { model?: string; signal?: AbortSignal },
): Promise<string> {
  const model = options?.model ?? import.meta.env.VITE_OLLAMA_MODEL ?? 'llama3';
  const res = await fetch(`${ollamaBase()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
    signal: options?.signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Ollama error ${res.status}`);
  }
  const data = (await res.json()) as { response?: string };
  return data.response ?? '';
}

export async function ollamaChat(
  messages: ChatMessage[],
  options?: { model?: string; signal?: AbortSignal },
): Promise<string> {
  const model = options?.model ?? import.meta.env.VITE_OLLAMA_MODEL ?? 'llama3';
  const res = await fetch(`${ollamaBase()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
    signal: options?.signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Ollama chat error ${res.status}`);
  }
  const data = (await res.json()) as {
    message?: { content?: string };
  };
  return data.message?.content ?? '';
}

export function buildListingContextForPrompt(item: {
  title: string;
  category: string;
  price: number | null;
  description?: string;
  params: Record<string, unknown>;
}): string {
  return [
    `Категория: ${item.category}`,
    `Название: ${item.title}`,
    `Цена: ${item.price ?? 'не указана'}`,
    `Описание: ${item.description ?? ''}`,
    `Характеристики: ${JSON.stringify(item.params, null, 0)}`,
  ].join('\n');
}
