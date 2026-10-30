import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import {
  HorseDetail,
  ApiResponse,
  HorseRankingCategory,
  HorseRankingsResponse,
  HorseRankingItem,
} from '@stallbacken/shared';
import { formatCurrency } from '../lib/format';
import { HastarSokHistorik } from '../components/hastar/HastarSokHistorik';
import { HastarRankingLista } from '../components/hastar/HastarRankingLista';
import { apiFetch } from '../lib/api';

interface HastarScreenProps {
  onSelectHorse: (horseId: string) => void;
}

const STORAGE_KEY = 'tangitza_hastsok_historik';

export const HastarScreen: React.FC<HastarScreenProps> = ({ onSelectHorse }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HorseDetail[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [rankingCategory, setRankingCategory] = useState<HorseRankingCategory>('elit');
  const [rankingItems, setRankingItems] = useState<HorseRankingItem[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRemoveSearch = (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  useEffect(() => {
    let isCancelled = false;
    const fetchRankings = async () => {
      setRankingLoading(true);
      try {
        const json: ApiResponse<HorseRankingsResponse> = await apiFetch<HorseRankingsResponse>(
          `/api/hastar/ranking?kategori=${rankingCategory}`
        );
        if (!isCancelled && json?.data?.items) {
          setRankingItems(json.data.items);
        }
      } catch {
        if (!isCancelled) setRankingItems([]);
      } finally {
        if (!isCancelled) setRankingLoading(false);
      }
    };

    fetchRankings();
    return () => {
      isCancelled = true;
    };
  }, [rankingCategory]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const json: ApiResponse<HorseDetail[]> = await apiFetch<HorseDetail[]>(
          `/api/hastar/sok?q=${encodeURIComponent(trimmed)}`
        );
        setResults(json?.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectHorse = (horseId: string, horseName?: string) => {
    if (horseName) saveSearchTerm(horseName);
    onSelectHorse(horseId);
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hästar
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Sök upp valfri häst eller bläddra bland topprankade hästar och dagens startande.
        </p>
      </div>

      {}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök häst på namn, tränare eller bana..."
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

        {}
        <HastarSokHistorik
          searches={recentSearches}
          onSelectSearch={(term) => setQuery(term)}
          onRemoveSearch={handleRemoveSearch}
          onClearAll={handleClearAllSearches}
        />
      </div>

      {}
      {isSearching ? (
        searchLoading ? (
          <div className="py-12 text-center text-slate-500 text-base">Söker hästar...</div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block px-1">
              Hittade {results.length} hästar för &rdquo;{query.trim()}&rdquo;
            </span>
            <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {results.map((horse) => (
                <button
                  key={horse.id}
                  type="button"
                  onClick={() => handleSelectHorse(horse.id, horse.name)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <div className="font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors text-base truncate">
                      {horse.name}
                    </div>
                    <div className="text-sm text-slate-500 truncate mt-0.5">
                      {horse.trainerName
                        ? `Tränare: ${horse.trainerName}`
                        : horse.homeTrack || 'Travhäst'}
                      {horse.age && horse.sex && ` · ${horse.age} år ${horse.sex.toLowerCase()}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm sm:text-base">
                        {formatCurrency(horse.earningsTotal)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {horse.winPercentage}% segrar ({horse.starts} st)
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            Hittade ingen häst med &rdquo;{query.trim()}&rdquo;. Kontrollera stavningen eller prova
            ett kortare ord.
          </div>
        )
      ) : (
        <HastarRankingLista
          category={rankingCategory}
          items={rankingItems}
          loading={rankingLoading}
          onChangeCategory={setRankingCategory}
          onSelectHorse={(id) => {
            const h = rankingItems.find((item) => item.id === id);
            handleSelectHorse(id, h?.name);
          }}
        />
      )}
    </div>
  );
};
