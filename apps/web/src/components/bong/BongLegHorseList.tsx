import React, { useState } from 'react';
import { Sparkles, Clock, MapPin, Flag, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BongRaceLeg, HorseRank, BongHorseInput } from '@stallbacken/shared';

interface BongLegHorseListProps {
  leg: BongRaceLeg;
  selectedIds: string[];
  ranks: Record<string, HorseRank>;
  onToggleHorse: (horseId: string) => void;
  onSetRank: (horseId: string, rank: HorseRank) => void;
  onClearLeg: () => void;
  onOpenHorseInfo?: (horse: BongHorseInput) => void;
}

const RANK_OPTIONS: HorseRank[] = ['A', 'B', 'C', 'D'];

export const BongLegHorseList: React.FC<BongLegHorseListProps> = ({
  leg,
  selectedIds,
  ranks,
  onToggleHorse,
  onSetRank,
  onClearLeg,
  onOpenHorseInfo,
}) => {
  const [showRankHelp, setShowRankHelp] = useState(false);
  const startMethodText = leg.startMethod === 'auto' ? 'autostart' : 'voltstart';
  const distanceText = leg.distance ? `${leg.distance.toLocaleString('sv-SE')} m` : undefined;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
      {}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                Avd {leg.legIndex + 1}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-950">
                {leg.trackName ? `${leg.trackName} · ` : ''}Lopp{' '}
                {leg.raceNumber || leg.legIndex + 1}
              </h2>
              {leg.raceName && (
                <span className="text-sm font-semibold text-slate-600 italic">
                  — {leg.raceName}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-slate-600">
              {leg.trackName && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{leg.trackName}</span>
                </span>
              )}
              {leg.startTime && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Start kl. {leg.startTime}</span>
                </span>
              )}
              {(distanceText || leg.startMethod) && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Flag className="w-3.5 h-3.5 text-slate-500" />
                  <span>{[distanceText, startMethodText].filter(Boolean).join(' ')}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              {selectedIds.length} hästar markerade
            </span>
            <button
              type="button"
              onClick={onClearLeg}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
            >
              Rensa avdelning
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowRankHelp((prev) => !prev)}
            aria-expanded={showRankHelp}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Vad betyder A, B, C, D vid varje häst?</span>
            {showRankHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showRankHelp && (
          <div className="mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-800 space-y-1.5">
            <p>
              <strong>A, B, C och D</strong> är din egen betygssättning av hästarna om du vill använda reduceringsmotorn:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs">
              <div><strong className="text-emerald-800">A-hästar:</strong> Dina favoriter/bästa spikar som du tror mest på.</div>
              <div><strong className="text-blue-800">B-hästar:</strong> Bra reserver och garderingar.</div>
              <div><strong className="text-amber-800">C-hästar:</strong> Skrällar och outsider-bud.</div>
              <div><strong className="text-slate-600">D-hästar:</strong> Långskott som du sällan vill betala för på alla rader.</div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Om du inte använder reduceringsmotorn spelas alla dina markerade hästar precis som på en vanlig bong!
            </p>
          </div>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {leg.horses.map((horse) => {
          const isSelected = selectedIds.includes(horse.id);
          const rank = ranks[horse.id] || 'A';
          const streckPct = Math.round(horse.betDistribution * 100);
          const isValue = horse.winOdds
            ? 0.85 / horse.winOdds > horse.betDistribution * 1.15
            : false;

          return (
            <div
              key={horse.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleHorse(horse.id)}
                className="flex items-center gap-3 text-left flex-1 min-w-0 mr-2 cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {horse.startNumber}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm sm:text-base text-slate-950 truncate flex items-center gap-1.5">
                    <span>{horse.name}</span>
                    {isValue && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Spelvärde</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {horse.driverName} · {streckPct} % ·{' '}
                    {horse.winOdds ? `${horse.winOdds} odds` : ''}
                  </div>
                </div>
              </button>

              {isSelected ? (
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                  {RANK_OPTIONS.map((r) => {
                    const isRankActive = rank === r;
                    const colorClass =
                      r === 'A'
                        ? isRankActive
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-emerald-700 hover:bg-emerald-50'
                        : r === 'B'
                          ? isRankActive
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-blue-700 hover:bg-blue-50'
                          : r === 'C'
                            ? isRankActive
                              ? 'bg-amber-600 text-white font-bold'
                              : 'text-amber-700 hover:bg-amber-50'
                            : isRankActive
                              ? 'bg-slate-600 text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-100';

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onSetRank(horse.id, r)}
                        className={`w-7 h-7 rounded text-xs transition-colors cursor-pointer ${colorClass}`}
                      >
                        {r}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenHorseInfo?.(horse);
                    }}
                    title={`Information och analys för ${horse.name || `häst ${horse.startNumber}`}`}
                    aria-label={`Information och analys för ${horse.name || `häst ${horse.startNumber}`}`}
                    className="w-7 h-7 rounded text-xs font-serif font-black italic transition-colors cursor-pointer flex items-center justify-center bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-900 border border-sky-200/80"
                  >
                    i
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenHorseInfo?.(horse);
                    }}
                    title={`Information och analys för ${horse.name || `häst ${horse.startNumber}`}`}
                    aria-label={`Information och analys för ${horse.name || `häst ${horse.startNumber}`}`}
                    className="w-7 h-7 rounded text-xs font-serif font-black italic transition-colors cursor-pointer flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 hover:border-sky-300"
                  >
                    i
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleHorse(horse.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Välj
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
