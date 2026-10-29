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
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
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
            className={`flex-1 min-w-[70px] sm:min-w-[90px] py-2.5 px-2 rounded-xl text-center border transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-600 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="text-xs uppercase tracking-wider">Avd {leg.legIndex + 1}</div>
            <div className="text-sm font-bold mt-0.5">
              {isSpik ? (
                <span className="inline-block px-1.5 py-0.2 rounded bg-slate-950 text-amber-300 text-[10px] uppercase font-bold">
                  Spik
                </span>
              ) : (
                <span>{selectedInLeg.length} st</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
