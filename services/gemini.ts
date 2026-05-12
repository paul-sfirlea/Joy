import { GoogleGenAI } from '@google/genai';
import { GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DEFAULT_MODEL = 'gemini-2.5-flash';

export interface StreamHandlers {
  onChunk: (delta: string) => void;
  onSource: (source: GroundingSource) => void;
  onDone: () => void;
  onError: (msg: string) => void;
  signal?: AbortSignal;
}

export interface StreamOptions {
  model?: string;
  systemInstruction: string;
  prompt: string;
  thinkingBudget?: number;
  useGrounding?: boolean;
}

export async function streamModule(opts: StreamOptions, cb: StreamHandlers): Promise<void> {
  try {
    const config: Record<string, unknown> = {
      systemInstruction: opts.systemInstruction,
    };
    if (opts.thinkingBudget) {
      config.thinkingConfig = { thinkingBudget: opts.thinkingBudget };
    }
    if (opts.useGrounding !== false) {
      config.tools = [{ googleSearch: {} }];
    }

    const stream = await ai.models.generateContentStream({
      model: opts.model ?? DEFAULT_MODEL,
      contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
      config,
    });

    const seen = new Set<string>();
    for await (const chunk of stream) {
      if (cb.signal?.aborted) return;

      const text = chunk.text;
      if (text) cb.onChunk(text);

      const grounding = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (grounding) {
        for (const g of grounding) {
          const web = (g as { web?: { uri?: string; title?: string } }).web;
          if (web?.uri && !seen.has(web.uri)) {
            seen.add(web.uri);
            cb.onSource({ uri: web.uri, title: web.title ?? web.uri });
          }
        }
      }
    }
    if (cb.signal?.aborted) return;
    cb.onDone();
  } catch (e: unknown) {
    if (cb.signal?.aborted) return;
    const msg = e instanceof Error ? e.message : 'Eroare necunoscută la AI.';
    cb.onError(msg);
  }
}
