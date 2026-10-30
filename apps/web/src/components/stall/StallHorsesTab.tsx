import React from 'react';
import { ChevronRight, Trash2, Search } from 'lucide-react';
import { TodaysEntry } from '@stallbacken/shared';
import { HastsKoIkon } from '../HastsKoIkon';
import { FavoriteItem } from '../../lib/favoriter';

interface StallHorsesTabProps {
  horses: FavoriteItem[];
  getHorseTodayEntry: (horseId: string) => TodaysEntry | undefined;
  onSelectHorse: (horseId: string) => void;
  onSelectRace: (raceId: string) => void;
  onRemoveFavoriteHorse: (horseId: string) => void;
  onGoToSearchHorses: () => void;
}

export const StallHorsesTab: React.FC<StallHorsesTabProps> = ({
  horses,
  getHorseTodayEntry,
  onSelectHorse,
  onSelectRace,
  onRemoveFavoriteHorse,
  onGoToSearchHorses,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
          Sparade favorithästar
        </span>
        <button
          type="button"
          onClick={onGoToSearchHorses}
          className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Sök fler hästar</span>
        </button>
      </div>

      {horses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
          <HastsKoIkon filled={false} className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
            Du har inte lagt till något än. Tryck på hästskon på en häst, kusk eller bana så hamnar
            den här.
          </p>
          <button
            type="button"
            onClick={onGoToSearchHorses}
            className="min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
          >
            Sök upp en häst
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {horses.map((horse) => {
            const todayEntry = getHorseTodayEntry(horse.id);
            return (
              <div
                key={horse.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <HastsKoIkon filled className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectHorse(horse.id)}
                      className="text-lg sm:text-xl font-bold text-slate-950 hover:text-amber-700 transition-colors text-left focus:outline-none focus:underline"
                    >
                      {horse.name}
                    </button>

                    {todayEntry ? (
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => onSelectRace(todayEntry.raceId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 text-sm font-bold hover:bg-emerald-100 transition-colors"
                        >
                          <span>
                            Anmäld idag — {todayEntry.trackName} lopp {todayEntry.raceNumber}
                            {todayEntry.formattedTime ? `, kl ${todayEntry.formattedTime}` : ''}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mt-0.5">Inga anmälda lopp idag</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onRemoveFavoriteHorse(horse.id)}
                    className="min-h-[44px] px-3 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                    title="Ta bort från Mitt stall"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Ta bort</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectHorse(horse.id)}
                    className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm font-bold transition-colors"
                  >
                    Öppna häst
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
