import React, { useCallback, useState } from 'react';
import { VenueInput } from './types';
import { MODULE_REGISTRY } from './modules/registry';
import InputForm from './components/InputForm';
import Dashboard, { DashboardProgressBar } from './components/Dashboard';

const App: React.FC = () => {
  const [input, setInput] = useState<VenueInput | null>(null);
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, string>>({});

  const reset = () => {
    setInput(null);
    setModuleStatuses({});
  };

  const handleStatusChange = useCallback((id: string, status: string) => {
    setModuleStatuses((prev) =>
      prev[id] === status ? prev : { ...prev, [id]: status }
    );
  }, []);

  const completed = Object.values(moduleStatuses).filter((s) => s === 'complete').length;
  const errors = Object.values(moduleStatuses).filter((s) => s === 'error').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-gold-500 selection:text-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <button
            onClick={reset}
            className="flex items-center gap-2.5 group"
            aria-label="Acasă"
          >
            <span className="text-2xl text-gold-500 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 15.5v.01" />
                <path d="M12 12v.01" />
                <path d="M12 17v.01" />
                <path d="M12 7v.01" />
              </svg>
            </span>
            <div className="text-left">
              <h1 className="font-serif text-xl font-bold tracking-tight text-white leading-none">
                BoB <span className="text-gold-500">Business Brain</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">
                HoReCa Edition • Elite AI Consultant
              </p>
            </div>
          </button>
          {input && (
            <button
              onClick={reset}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-gold-500/50 transition-all"
            >
              Analiză nouă
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        {!input && <InputForm onSubmit={setInput} />}

        {input && (
          <>
            <DashboardProgressBar
              total={MODULE_REGISTRY.length}
              completed={completed}
              errors={errors}
              venueName={input.name}
              city={input.city}
            />
            <div className="pt-6">
              <Dashboard input={input} onModuleStateChange={handleStatusChange} />
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-12 py-6 text-center">
        <p className="text-[10px] text-gray-700 font-mono uppercase tracking-widest">
          BoB Business Brain — Powered by Gemini, citește în 5 minute
        </p>
      </footer>
    </div>
  );
};

export default App;
