import React from 'react';
import { BongRaceDayData } from '@stallbacken/shared';

interface BongLegTabsProps {
  races: BongRaceDayData['races'];
  selectedHorses: Record<number, string[]>;
  activeLegIndex: number;
  onSelectLeg: (legIndex: number) => void;
}

export const BongLegTabs: React.FC<BongLegTabsProps> = ({
  races,
  selectedHorses,
  activeLegIndex,
  onSelectLeg,
}) => {
  return (
    <div
      className="flex items-stretch gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="Avdelningar"
    >
      {races.map((leg) => {
        const selectedInLeg = selectedHorses[leg.legIndex] || [];
        const isSpik = selectedInLeg.length === 1;
        const isActive = activeLegIndex === leg.legIndex;

        return (
          <button
            key={leg.legIndex}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectLeg(leg.legIndex)}
            className={`flex-1 min-w-[76px] sm:min-w-[100px] py-2 px-1.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col justify-between items-center ${
              isActive
                ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-600 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="w-full">
              <div className="text-xs uppercase tracking-wider font-bold">
                Avd {leg.legIndex + 1}
              </div>
              <div
                className={`text-[11px] truncate leading-tight ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'
                }`}
              >
                {leg.trackName && races.length === 8
                  ? `${leg.trackName.split(' ')[0]} L${leg.raceNumber || leg.legIndex + 1}`
                  : `Lopp ${leg.raceNumber || leg.legIndex + 1}`}
              </div>
              {leg.startTime && (
                <div className={`text-[10px] ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  kl. {leg.startTime}
                </div>
              )}
            </div>

            <div className="text-xs font-bold mt-1">
              {isSpik ? (
                <span className="inline-block px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] uppercase font-bold">
                  Spik
                </span>
              ) : selectedInLeg.length > 0 ? (
                <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 text-[11px]">
                  {selectedInLeg.length} st
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">0 st</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
