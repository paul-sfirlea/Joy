import { useEffect, useRef, useState } from 'react';
import { streamModule } from '../services/gemini';
import { ModuleDefinition } from '../modules/types';
import { ModuleState, VenueInput } from '../types';

const INITIAL_STATE: ModuleState = {
  status: 'idle',
  text: '',
  sources: [],
  error: null,
  startedAt: null,
  finishedAt: null,
};

export function useModule(
  mod: ModuleDefinition,
  input: VenueInput | null,
  startDelayMs: number = 0
): { state: ModuleState; retry: () => void } {
  const [state, setState] = useState<ModuleState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!input) {
      setState(INITIAL_STATE);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled || ac.signal.aborted) return;
      setState({
        status: 'streaming',
        text: '',
        sources: [],
        error: null,
        startedAt: Date.now(),
        finishedAt: null,
      });

      streamModule(
        {
          model: mod.model,
          systemInstruction: mod.buildSystemInstruction(input),
          prompt: mod.buildPrompt(input),
          thinkingBudget: mod.thinkingBudget,
        },
        {
          onChunk: (delta) =>
            setState((s) => ({ ...s, text: s.text + delta })),
          onSource: (source) =>
            setState((s) =>
              s.sources.some((x) => x.uri === source.uri)
                ? s
                : { ...s, sources: [...s.sources, source] }
            ),
          onDone: () =>
            setState((s) => ({
              ...s,
              status: 'complete',
              finishedAt: Date.now(),
            })),
          onError: (msg) =>
            setState((s) => ({
              ...s,
              status: 'error',
              error: msg,
              finishedAt: Date.now(),
            })),
          signal: ac.signal,
        }
      );
    }, startDelayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ac.abort();
    };
  }, [input?.name, input?.city, input?.venueType, mod.id, retryKey, startDelayMs]);

  return {
    state,
    retry: () => setRetryKey((k) => k + 1),
  };
}
