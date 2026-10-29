import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { HorseDetail, ApiResponse } from '@stallbacken/shared';
import { formatCurrency } from '../lib/format';

interface HastarScreenProps {
  onSelectHorse: (horseId: string) => void;
}

export const HastarScreen: React.FC<HastarScreenProps> = ({ onSelectHorse }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HorseDetail[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      // Hämta initiala hästar ur databasen (t.ex. med tom sträng eller q=)
      fetchInitialHorses();
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/hastar/sok?q=${encodeURIComponent(trimmed)}`);
        const json: ApiResponse<HorseDetail[]> = await res.json();
        setResults(json?.data || []);
        setHasSearched(true);
      } catch {
        setResults([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchInitialHorses = async () => {
    try {
      const res = await fetch('/api/hastar/sok?q=');
      const json: ApiResponse<HorseDetail[]> = await res.json();
      setResults(json?.data || []);
    } catch {
      setResults([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rubrik */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hästar
        </h1>
        <p className="text-slate-600 text-base mt-1">
          Sök upp en häst för att se stamtavla, formkurva och alla tidigare lopp.
        </p>
      </div>

      {/* Sökruta */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök häst..."
          className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Rensa sökning"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Resultatlista */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 text-base">
          Söker...
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block px-1">
            {hasSearched ? `Hittade ${results.length} hästar` : 'Sparade hästar i stallet'}
          </span>
          <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {results.map((horse) => (
              <button
                key={horse.id}
                type="button"
                onClick={() => onSelectHorse(horse.id)}
                className="w-full text-left p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:bg-slate-50"
              >
                <div className="space-y-1">
                  <div className="text-lg font-bold text-slate-900">
                    {horse.name}
                  </div>
                  <div className="text-sm text-slate-600 flex flex-wrap gap-x-2.5">
                    <span>{[horse.sex, horse.age ? `${horse.age} år` : ''].filter(Boolean).join(' · ')}</span>
                    {horse.trainerName && <span>Tränare: {horse.trainerName}</span>}
                  </div>
                  {horse.earningsTotal > 0 && (
                    <div className="text-xs text-slate-500 font-medium">
                      Intjänat: {formatCurrency(horse.earningsTotal)}
                    </div>
                  )}
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center space-y-2">
          <p className="text-slate-800 text-base font-medium">
            Hittade ingen häst med det namnet. Prova med en del av namnet.
          </p>
          <p className="text-slate-500 text-sm">
            Kontrollera stavningen eller sök på bara förnamnet.
          </p>
        </div>
      ) : (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-600 text-base">
          Skriv namnet på en häst för att söka i databasen.
        </div>
      )}
    </div>
  );
};
