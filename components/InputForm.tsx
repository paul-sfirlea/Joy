import React, { useState } from 'react';
import { VenueInput, VenueType, VENUE_TYPE_LABELS } from '../types';

interface Props {
  onSubmit: (input: VenueInput) => void;
}

const InputForm: React.FC<Props> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [venueType, setVenueType] = useState<VenueType>('restaurant');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;
    onSubmit({ name: name.trim(), city: city.trim(), venueType });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto pt-8 md:pt-16 pb-12">
      <div className="inline-block mb-4 px-3 py-1 rounded-full border border-gold-500/30 bg-gold-500/5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-mono">
          BoB Business Brain • HoReCa Edition
        </span>
      </div>

      <h1 className="text-4xl md:text-6xl font-serif font-bold mb-5 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent leading-tight">
        Domină Piața Locală.
      </h1>

      <p className="text-base md:text-lg text-gray-400 mb-10 max-w-2xl leading-relaxed">
        11 module AI scanează simultan reputația, concurența, piața și macro-trendurile locației tale.
        Citești totul în <strong className="text-gold-400">5 minute</strong>. Acționezi de luni dimineață.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-slate-800/80 border border-slate-700 rounded-2xl p-3 shadow-2xl backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Nume locație (ex: The Saint)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-slate-900/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-gold-500/50 placeholder-gray-500 text-base"
            required
          />
          <input
            type="text"
            placeholder="Oraș (ex: București)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 bg-slate-900/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-gold-500/50 placeholder-gray-500 text-base"
            required
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 mt-2">
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value as VenueType)}
            className="flex-1 bg-slate-900/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-gold-500/50 text-base appearance-none cursor-pointer"
          >
            {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-slate-900">
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20 whitespace-nowrap"
          >
            Pornește Analiza →
          </button>
        </div>
      </form>

      <div className="mt-10 grid grid-cols-3 gap-3 text-xs text-gray-500 max-w-2xl w-full">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
          <span>Date live, surse verificabile</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
          <span>11 module în paralel</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
          <span>Acțiuni concrete, nu teorie</span>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
