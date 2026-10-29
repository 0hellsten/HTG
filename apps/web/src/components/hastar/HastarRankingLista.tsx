import React from 'react';
import { ChevronRight, Calendar } from 'lucide-react';
import { HorseRankingCategory, HorseRankingItem } from '@stallbacken/shared';
import { formatCurrency } from '../../lib/format';

interface HastarRankingListaProps {
  category: HorseRankingCategory;
  items: HorseRankingItem[];
  loading: boolean;
  onChangeCategory: (cat: HorseRankingCategory) => void;
  onSelectHorse: (horseId: string) => void;
}

const CATEGORIES: { id: HorseRankingCategory; label: string }[] = [
  { id: 'vinstrikast', label: 'Vinstrikast' },
  { id: 'segerprocent', label: 'Segerprocent' },
  { id: 'segrar', label: 'Flest segrar' },
  { id: 'idag', label: 'Startar idag' },
];

export const HastarRankingLista: React.FC<HastarRankingListaProps> = ({
  category,
  items,
  loading,
  onChangeCategory,
  onSelectHorse,
}) => {
  return (
    <div className="space-y-4">
      {/* Flikrad för rankingkategorier */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChangeCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Innehåll */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-base">Hämtar ranking...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Inga hästar hittades i denna kategori just nu.
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Topprankade hästar ({items.length} st)</span>
            <span>Placering och statistik</span>
          </div>

          <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {items.map((horse) => {
              const isGold = horse.rankPosition === 1;
              const isSilver = horse.rankPosition === 2;
              const isBronze = horse.rankPosition === 3;

              return (
                <button
                  key={horse.id}
                  type="button"
                  onClick={() => onSelectHorse(horse.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-3">
                    {/* Rankningsnummer */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 ${
                        isGold
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : isSilver
                            ? 'bg-slate-300 text-slate-900 shadow-xs'
                            : isBronze
                              ? 'bg-amber-700/80 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {horse.rankPosition}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-950 group-hover:text-amber-800 transition-colors text-base truncate">
                          {horse.name}
                        </span>
                        {horse.age && horse.sex && (
                          <span className="text-xs text-slate-500 font-normal">
                            ({horse.age} år, {horse.sex})
                          </span>
                        )}
                        {horse.todayStart && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                            <Calendar className="w-3 h-3 text-amber-700" />
                            <span>
                              {horse.todayStart.trackName} L{horse.todayStart.raceNumber} · Nr{' '}
                              {horse.todayStart.startNumber}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
                        {horse.trainerName
                          ? `Tränare: ${horse.trainerName}`
                          : horse.homeTrack || 'Travhäst'}
                        {horse.starts > 0 &&
                          ` · ${horse.starts} st: ${horse.wins}-${horse.seconds}-${horse.thirds}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm sm:text-base">
                        {category === 'segerprocent'
                          ? `${horse.winPercentage} % segrar`
                          : category === 'segrar'
                            ? `${horse.wins} segrar`
                            : formatCurrency(horse.earningsTotal)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {category === 'segerprocent'
                          ? `${horse.wins} av ${horse.starts} st`
                          : `${horse.winPercentage} % segrar`}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
