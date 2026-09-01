const API_KEY_STORAGE = 'nexus-hub-gemini-api-key';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function loadGeminiApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function saveGeminiApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key.trim());
}

const MODEL = 'gemini-3.7-flash';

/**
 * Streams a chat response from the Gemini API (free tier, no billing required).
 * Calls onChunk(textSoFar) as tokens arrive so the UI can render text appearing
 * live, the same way a normal chat product does.
 */
export async function streamGeminiChat(
  history: ChatMessage[],
  apiKey: string,
  onChunk: (textSoFar: string) => void
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(
    apiKey
  )}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: history.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message || `Gemini request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const piece = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (piece) {
          fullText += piece;
          onChunk(fullText);
        }
      } catch {
        // ignore partial/malformed chunk, next read will complete it
      }
    }
  }

  return fullText;
}
