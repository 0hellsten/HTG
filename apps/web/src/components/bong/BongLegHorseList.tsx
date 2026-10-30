import React, { useState } from 'react';
import { Sparkles, Clock, MapPin, Flag, HelpCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
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
  const [activePickerHorseId, setActivePickerHorseId] = useState<string | null>(null);

  const startMethodText = leg.startMethod === 'auto' ? 'autostart' : 'voltstart';
  const distanceText = leg.distance ? `${leg.distance.toLocaleString('sv-SE')} m` : undefined;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Avdelningshuvud */}
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
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors cursor-pointer min-h-[44px] py-1"
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

      {/* Hästlista */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {leg.horses.map((horse) => {
          const isSelected = selectedIds.includes(horse.id);
          const rank = ranks[horse.id] || 'A';
          const streckPct = Math.round(horse.betDistribution * 100);
          const isValue = horse.winOdds
            ? 0.85 / horse.winOdds > horse.betDistribution * 1.15
            : false;
          const isPickerOpen = activePickerHorseId === horse.id;

          return (
            <div
              key={horse.id}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-1 ring-amber-300/40'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Klickbar yta för hela hästkortet -> snabbmarkerar / avmarkerar som etta (A) */}
              <div
                onClick={() => {
                  if (isPickerOpen) {
                    setActivePickerHorseId(null);
                    return;
                  }
                  onToggleHorse(horse.id);
                }}
                className="flex items-center gap-3 text-left flex-1 min-w-0 mr-2 sm:mr-3 cursor-pointer py-1 select-none min-h-[44px]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleHorse(horse.id);
                  }
                }}
                aria-pressed={isSelected}
                aria-label={`${horse.name || `Häst ${horse.startNumber}`}, tryck för att ${
                  isSelected ? 'avmarkera' : 'markera som etta'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-2xs ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
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
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {horse.driverName ? `${horse.driverName} · ` : ''}
                    {streckPct} %
                    {horse.winOdds ? ` · ${horse.winOdds} odds` : ''}
                  </div>
                </div>
              </div>

              {/* Högersektion: Vald bokstav / Välj-knapp + Informationsknapp (alltid fast längst till höger) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Bokstavsväljare eller Bokstavsvisning */}
                <div className="relative">
                  {isPickerOpen ? (
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 shadow-md">
                      {RANK_OPTIONS.map((r) => {
                        const isRankActive = isSelected && rank === r;
                        let btnClass = 'text-slate-700 hover:bg-slate-100';
                        if (r === 'A')
                          btnClass = isRankActive
                            ? 'bg-emerald-600 text-white font-black'
                            : 'text-emerald-700 hover:bg-emerald-50';
                        if (r === 'B')
                          btnClass = isRankActive
                            ? 'bg-blue-600 text-white font-black'
                            : 'text-blue-700 hover:bg-blue-50';
                        if (r === 'C')
                          btnClass = isRankActive
                            ? 'bg-amber-600 text-white font-black'
                            : 'text-amber-700 hover:bg-amber-50';
                        if (r === 'D')
                          btnClass = isRankActive
                            ? 'bg-slate-600 text-white font-black'
                            : 'text-slate-600 hover:bg-slate-100';

                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSelected) {
                                onToggleHorse(horse.id);
                              }
                              onSetRank(horse.id, r);
                              setActivePickerHorseId(null); // Stänger direkt efter val!
                            }}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-h-[32px] ${btnClass}`}
                            title={`Välj ${r}-häst`}
                          >
                            {r}
                          </button>
                        );
                      })}
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleHorse(horse.id);
                            setActivePickerHorseId(null);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-md cursor-pointer ml-0.5 min-h-[32px]"
                          title="Ta bort häst från kupongen"
                        >
                          Ta bort
                        </button>
                      )}
                    </div>
                  ) : isSelected ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePickerHorseId(horse.id);
                      }}
                      className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-2xs border transition-transform active:scale-95 ${
                        rank === 'A'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                          : rank === 'B'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                          : rank === 'C'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500'
                          : 'bg-slate-700 hover:bg-slate-800 text-white border-slate-600'
                      }`}
                      title="Klicka för att ändra bokstav (A, B, C, D)"
                      aria-label={`Bokstav ${rank}. Klicka för att ändra`}
                    >
                      <span>{rank}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePickerHorseId(horse.id);
                      }}
                      className="min-h-[44px] px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                      title="Välj häst med specifik bokstav"
                    >
                      Välj
                    </button>
                  )}
                </div>

                {/* FAST INFORMATIONS-KNAPP LÄNGST TILL HÖGER MED EGEN RUND DESIGN */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenHorseInfo?.(horse);
                  }}
                  title={`Information och analys för ${horse.name || `häst ${horse.startNumber}`}`}
                  aria-label={`Information och analys för ${horse.name || `häst ${horse.startNumber}`}`}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-900 border border-sky-200/90 shadow-2xs transition-all cursor-pointer shrink-0 min-h-[44px] min-w-[44px]"
                >
                  <Info className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
