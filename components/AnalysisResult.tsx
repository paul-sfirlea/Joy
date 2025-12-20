import React, { useState, useMemo } from 'react';
import { STEP_LABELS, AnalysisStep } from '../types';

interface Props {
  rawText: string;
}

const AnalysisResult: React.FC<Props> = ({ rawText }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Parse the text into sections based on the delimiter requested in the system prompt
  // We asked for "===STEP [numumb]===" separators or headers.
  // However, the model might use headers like "PASUL 1: ...". 
  // Let's implement a robust parser that splits by "PASUL [1-6]"
  
  const sections = useMemo(() => {
    // Regex to split by PASUL X or STEP X
    const parts = rawText.split(/(?:===STEP \d===|PASUL \d:?)/i);
    // Remove the first empty part if it exists (before the first step)
    if (parts[0].trim().length < 50 && parts.length > 6) parts.shift();
    
    // Map to specific steps, fallback to raw text if parsing fails nicely
    if (parts.length < 6) {
        return [{ title: 'Raport Complet', content: rawText }];
    }

    return [
      { title: STEP_LABELS[AnalysisStep.Audit], content: parts[1] || parts[0] },
      { title: STEP_LABELS[AnalysisStep.Competition], content: parts[2] || '' },
      { title: STEP_LABELS[AnalysisStep.DeepDive], content: parts[3] || '' },
      { title: STEP_LABELS[AnalysisStep.Benchmarking], content: parts[4] || '' },
      { title: STEP_LABELS[AnalysisStep.SWOT], content: parts[5] || '' },
      { title: STEP_LABELS[AnalysisStep.Recommendations], content: parts[6] || '' },
    ];
  }, [rawText]);

  // Simple Markdown Renderer
  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">Lipsesc date pentru această secțiune.</p>;

    return text.split('\n').map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-serif text-gold-400 mt-6 mb-3 font-bold border-b border-gray-700 pb-2">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-serif text-white mt-8 mb-4 font-bold">{line.replace('## ', '')}</h2>;
      if (line.startsWith('# ')) return <h1 key={idx} className="text-3xl font-serif text-gold-500 mt-8 mb-6 font-bold">{line.replace('# ', '')}</h1>;
      
      // Bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);
      if (parts.length > 1) {
          return (
              <p key={idx} className="mb-2 leading-relaxed text-gray-300">
                  {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part)}
              </p>
          )
      }

      // Lists
      if (line.trim().startsWith('- ')) {
        return <li key={idx} className="ml-4 mb-2 text-gray-300 list-disc pl-2 marker:text-gold-500">{line.replace('- ', '')}</li>;
      }
      
      // Regular Paragraph
      if (line.trim() === '') return <div key={idx} className="h-2"></div>;

      return <p key={idx} className="mb-2 leading-relaxed text-gray-300">{line}</p>;
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Mobile Tabs (Dropdown or Scroll) / Desktop Tabs */}
      <div className="bg-slate-900 border-b border-slate-700 p-2 overflow-x-auto flex lg:flex-wrap gap-2 sticky top-0 z-10">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeStep === index
                ? 'bg-gold-500 text-slate-900 shadow-lg shadow-gold-500/20'
                : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {section.title.split(' ')[0]} <span className="hidden md:inline">{section.title.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10 min-h-[60vh] bg-slate-800">
        <div className="max-w-4xl mx-auto animation-fade-in">
             <h2 className="text-2xl font-serif text-gold-400 mb-6">{sections[activeStep]?.title}</h2>
             <div className="prose prose-invert max-w-none">
                {renderMarkdown(sections[activeStep]?.content)}
             </div>
        </div>
      </div>
      
      <div className="bg-slate-900 p-6 border-t border-slate-700 text-center">
        <p className="text-gray-400 italic mb-4">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
      </div>
    </div>
  );
};

export default AnalysisResult;