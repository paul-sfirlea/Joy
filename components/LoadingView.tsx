import React, { useEffect, useState } from 'react';
import { STEPS_ORDER, STEP_LABELS } from '../types';

const LoadingView: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Simulate progression through "steps" for visual feedback
    // The actual API call takes time, this just keeps user engaged
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS_ORDER.length - 1 ? prev + 1 : prev));
    }, 3500); // Change text every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-gold-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gold-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-serif text-white mb-2 font-bold tracking-wide">
        ANALIZĂ ÎN DESFĂȘURARE
      </h2>
      
      <div className="h-8 mb-2">
         <p className="text-gold-400 font-medium animate-pulse transition-all duration-500">
            {STEP_LABELS[STEPS_ORDER[currentStepIndex]]}...
         </p>
      </div>

      <p className="text-gray-500 text-sm max-w-md mt-4">
        Consultantul AI scanează universul digital, analizează concurența și formulează strategia. Acesta este un proces intensiv care poate dura până la 60 de secunde.
      </p>

      {/* Progress indicators */}
      <div className="flex gap-2 mt-8">
        {STEPS_ORDER.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 w-8 rounded-full transition-all duration-500 ${idx <= currentStepIndex ? 'bg-gold-500' : 'bg-slate-700'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingView;