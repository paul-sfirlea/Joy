import React, { useMemo, useState, useEffect } from 'react';
import { VenueInput } from '../types';
import { MODULE_REGISTRY, getModulesByCategory } from '../modules/registry';
import { CATEGORY_LABELS, CATEGORY_TAGLINES, ModuleCategory, ModuleDefinition } from '../modules/types';
import { useModule } from '../hooks/useModule';
import ModuleCard from './ModuleCard';

interface Props {
  input: VenueInput;
  onModuleStateChange: (id: string, status: string) => void;
}

const CATEGORY_ORDER: ModuleCategory[] = ['reputation', 'market', 'strategy'];

const LiveModuleCard: React.FC<{
  mod: ModuleDefinition;
  input: VenueInput;
  delay: number;
  onStatusChange: (status: string) => void;
}> = ({ mod, input, delay, onStatusChange }) => {
  const { state, retry } = useModule(mod, input, delay);

  useEffect(() => {
    onStatusChange(state.status);
  }, [state.status, onStatusChange]);

  return <ModuleCard mod={mod} state={state} onRetry={retry} />;
};

const Dashboard: React.FC<Props> = ({ input, onModuleStateChange }) => {
  const modulesByCategory = useMemo(() => getModulesByCategory(), []);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {CATEGORY_ORDER.map((category) => {
        const mods = modulesByCategory[category] || [];
        if (!mods.length) return null;
        return (
          <section key={category}>
            <header className="mb-4 flex items-baseline justify-between border-b border-slate-800 pb-2">
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] text-gold-500 font-bold">
                  {CATEGORY_LABELS[category]}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {CATEGORY_TAGLINES[category]}
                </p>
              </div>
              <span className="text-[10px] text-gray-600 font-mono">
                {mods.length} module
              </span>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mods.map((mod) => {
                const globalIndex = MODULE_REGISTRY.findIndex((m) => m.id === mod.id);
                return (
                  <LiveModuleCard
                    key={mod.id}
                    mod={mod}
                    input={input}
                    delay={globalIndex * 250}
                    onStatusChange={(s) => onModuleStateChange(mod.id, s)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

interface ProgressBarProps {
  total: number;
  completed: number;
  errors: number;
  venueName: string;
  city: string;
}

export const DashboardProgressBar: React.FC<ProgressBarProps> = ({
  total,
  completed,
  errors,
  venueName,
  city,
}) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="sticky top-[65px] z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 py-3 -mx-6 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-xs text-gold-400 font-mono uppercase tracking-wider">
              Brain Activ
            </span>
            <span className="text-xs text-gray-500">
              {completed}/{total} module
              {errors > 0 && (
                <span className="text-red-400 ml-2">• {errors} erori</span>
              )}
            </span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white truncate max-w-[200px]">
            {venueName}
          </p>
          <p className="text-xs text-gray-500">{city}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
