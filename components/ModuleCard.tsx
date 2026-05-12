import React, { useState } from 'react';
import { ModuleDefinition } from '../modules/types';
import { ModuleState } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface Props {
  mod: ModuleDefinition;
  state: ModuleState;
  onRetry: () => void;
}

const formatDuration = (start: number | null, end: number | null): string => {
  if (!start) return '';
  const ms = (end ?? Date.now()) - start;
  return `${(ms / 1000).toFixed(1)}s`;
};

const ModuleCard: React.FC<Props> = ({ mod, state, onRetry }) => {
  const [showSources, setShowSources] = useState(false);

  const statusColor =
    state.status === 'complete'
      ? 'bg-emerald-500'
      : state.status === 'streaming'
      ? 'bg-gold-500 animate-pulse'
      : state.status === 'error'
      ? 'bg-red-500'
      : 'bg-slate-600';

  const statusLabel =
    state.status === 'complete'
      ? 'gata'
      : state.status === 'streaming'
      ? 'în lucru…'
      : state.status === 'error'
      ? 'eroare'
      : 'în coadă';

  return (
    <article className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 flex flex-col gap-3 backdrop-blur-sm hover:border-slate-600 transition-colors">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="text-2xl flex-shrink-0 mt-0.5">{mod.icon}</div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm leading-tight">{mod.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{mod.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">
            {statusLabel}
            {state.startedAt && state.status !== 'idle' && (
              <span className="ml-1 text-gray-600">
                {formatDuration(state.startedAt, state.finishedAt)}
              </span>
            )}
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-[80px]">
        {state.status === 'idle' && (
          <p className="text-xs text-gray-600 italic">Așteaptă în coadă…</p>
        )}

        {state.status === 'streaming' && !state.text && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-slate-700/50 rounded w-3/4"></div>
            <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
            <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
          </div>
        )}

        {state.text && <MarkdownRenderer text={state.text} />}

        {state.status === 'error' && (
          <div className="text-xs">
            <p className="text-red-400 mb-2">⚠️ {state.error}</p>
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs transition-colors"
            >
              Reîncearcă
            </button>
          </div>
        )}
      </div>

      {state.sources.length > 0 && (
        <footer className="border-t border-slate-700/50 pt-2 mt-1">
          <button
            onClick={() => setShowSources((s) => !s)}
            className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-gold-400 transition-colors flex items-center gap-1"
          >
            {showSources ? '▼' : '▶'} {state.sources.length} surse
          </button>
          {showSources && (
            <ul className="mt-2 space-y-1">
              {state.sources.map((s, i) => (
                <li key={i} className="text-[11px] truncate">
                  <a
                    href={s.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gold-400 truncate"
                    title={s.title}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </footer>
      )}
    </article>
  );
};

export default ModuleCard;
