// Loppranking-kort med markering för läst/öppnat läge
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import React from 'react';
import { TipItem } from '@stallbacken/shared';

interface LoppRankingKortProps {
  tip: TipItem;
  isRead: boolean;
  onOpenRace?: (raceId: string) => void;
  onMarkRead: (id: string) => void;
}

export const LoppRankingKort: React.FC<LoppRankingKortProps> = ({
  tip,
  isRead,
  onOpenRace,
  onMarkRead,
}) => {
  const handleOpen = () => {
    onMarkRead(tip.id);
    if (tip.raceId && onOpenRace) {
      onOpenRace(tip.raceId);
    }
  };

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isRead
          ? 'bg-slate-100/90 border-slate-300 text-slate-700 shadow-none'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-slate-300'
      } space-y-3`}
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <div>
          {tip.trackName && (
            <span
              className={`text-xs font-bold uppercase tracking-wider block ${
                isRead ? 'text-amber-800/80' : 'text-amber-700'
              }`}
            >
              {tip.trackName}
            </span>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-lg font-bold ${isRead ? 'text-slate-800' : 'text-slate-950'}`}>
              {tip.title}
            </h3>
            {isRead && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-600">
                Läst
              </span>
            )}
          </div>
        </div>

        {typeof tip.rank === 'number' && (
          <span
            className={`px-2.5 py-1 rounded-md text-sm font-extrabold shrink-0 ${
              isRead ? 'bg-amber-100/70 text-amber-900/80' : 'bg-amber-100 text-amber-950'
            }`}
          >
            Rank {tip.rank}
          </span>
        )}
      </div>

      {tip.summary && (
        <p className={`text-base leading-relaxed ${isRead ? 'text-slate-600' : 'text-slate-700'}`}>
          {tip.summary}
        </p>
      )}

      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 pt-1">
        <span className={isRead ? 'text-slate-600 font-medium' : 'text-slate-700 font-semibold'}>
          {tip.provider.startsWith('Tips från ') ? tip.provider : `Tips från ${tip.provider}`}
        </span>
        {tip.raceId && onOpenRace && (
          <button
            type="button"
            onClick={handleOpen}
            className="text-amber-800 hover:text-amber-950 font-bold min-h-[44px] py-2 px-1 cursor-pointer inline-flex items-center gap-1"
          >
            <span>{isRead ? 'Öppna lopp igen' : 'Öppna lopp'}</span>
            <span>&rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
};
