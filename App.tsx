import React, { useState } from 'react';
import { VenueRequest, AnalysisState } from './types';
import { analyzeVenue } from './services/gemini';
import AnalysisResult from './components/AnalysisResult';
import LoadingView from './components/LoadingView';

const App: React.FC = () => {
  const [request, setRequest] = useState<VenueRequest>({ name: '', city: '' });
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.name || !request.city) return;

    setState({ status: 'analyzing', data: null, error: null });

    try {
      const result = await analyzeVenue(request.name, request.city);
      setState({ status: 'complete', data: result, error: null });
    } catch (err: any) {
      setState({ 
        status: 'error', 
        data: null, 
        error: err.message || 'Something went wrong.' 
      });
    }
  };

  const reset = () => {
    setState({ status: 'idle', data: null, error: null });
    setRequest({ name: '', city: '' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-gold-500 selection:text-slate-900 pb-20">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
             <span className="text-2xl text-gold-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/ > <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M12 17v.01"/><path d="M12 7v.01"/></svg>
             </span>
             <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-white">
                HoReCa <span className="text-gold-500">God Mode</span>
             </h1>
          </div>
          <div className="text-xs text-gray-500 hidden md:block border border-slate-700 rounded-full px-3 py-1">
             AI Elite Consultant v1.0
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 md:pt-16">
        
        {/* Intro / Hero */}
        {state.status === 'idle' && (
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-16 animation-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
              Domină Piața Locală.
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Primește o analiză strategică de nivel "World Class". Viziune de CEO, rigoare financiară și pragmatism operațional. Introdu numele locației pentru a începe auditul.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-xl bg-slate-800 p-2 rounded-2xl shadow-2xl border border-slate-700 flex flex-col md:flex-row gap-2">
              <input
                type="text"
                placeholder="Nume Locație (ex: The Saint)"
                value={request.name}
                onChange={(e) => setRequest({ ...request, name: e.target.value })}
                className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-500 text-lg"
                required
              />
              <div className="w-px bg-slate-700 hidden md:block"></div>
              <input
                type="text"
                placeholder="Oraș (ex: București)"
                value={request.city}
                onChange={(e) => setRequest({ ...request, city: e.target.value })}
                className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-500 text-lg"
                required
              />
              <button
                type="submit"
                className="bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20 whitespace-nowrap"
              >
                Analizează
              </button>
            </form>
            
            <div className="mt-12 flex gap-8 text-sm text-gray-500 font-serif opacity-70">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold-500"></span> Competitor Scan
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold-500"></span> Global Trends
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold-500"></span> SWOT Analysis
                </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {state.status === 'analyzing' && (
          <div className="animate-fade-in">
             <LoadingView />
          </div>
        )}

        {/* Error State */}
        {state.status === 'error' && (
          <div className="max-w-xl mx-auto text-center p-8 bg-red-900/20 border border-red-800 rounded-xl">
            <h3 className="text-xl font-bold text-red-500 mb-2">Eroare de Analiză</h3>
            <p className="text-gray-300 mb-6">{state.error}</p>
            <button 
                onClick={reset}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
            >
                Încearcă din nou
            </button>
          </div>
        )}

        {/* Results */}
        {state.status === 'complete' && state.data && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-sm text-gold-500 font-bold uppercase tracking-widest mb-1">Raport Strategic</h2>
                    <h3 className="text-3xl font-serif font-bold text-white">{request.name}, {request.city}</h3>
                </div>
                <button 
                    onClick={reset}
                    className="text-sm text-gray-400 hover:text-white underline decoration-gold-500/50 hover:decoration-gold-500 underline-offset-4 transition-all"
                >
                    Analizează altă locație
                </button>
             </div>
             <AnalysisResult rawText={state.data} />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 text-center pointer-events-none">
          <p className="text-[10px] text-gray-700 font-mono">POWERED BY GEMINI 3 PRO</p>
      </footer>
    </div>
  );
};

export default App;