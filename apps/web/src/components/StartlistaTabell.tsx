import React from 'react';
import { Start, SourceStatus } from '@stallbacken/shared';
import { MobilStartKort, LaptopStartRad } from './StartlistaRad';

export interface HorseOddsMap {
  [startNumber: number]: {
    winOdds?: number;
    placeOdds?: number;
    stakePercent?: number;
  };
}

interface StartlistaTabellProps {
  starts: Start[];
  oddsMap?: HorseOddsMap;
  oddsTimestamp?: string;
  oddsStatus?: SourceStatus;
  selectedForCompare?: string[];
  onToggleCompare?: (horseId: string) => void;
  onSelectHorse?: (horseId: string) => void;
}

export const StartlistaTabell: React.FC<StartlistaTabellProps> = ({
  starts,
  oddsMap,
  oddsTimestamp,
  oddsStatus,
  selectedForCompare = [],
  onToggleCompare,
  onSelectHorse,
}) => {
  if (!starts || starts.length === 0) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-center text-base">
        Den här uppgiften saknas just nu.
      </div>
    );
  }

  const isOddsFailed = oddsStatus === 'failed';

  return (
    <div className="space-y-3">
      {/* Tidsstämpel / info för odds i startlistan */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1">
        <span>
          {isOddsFailed
            ? 'Oddsen uppdateras inte just nu'
            : oddsTimestamp
              ? `Odds från ${oddsTimestamp}`
              : 'Vinnarodds och streckprocent'}
        </span>
        <span className="hidden sm:inline">
          {starts.filter((s) => !s.scratched).length} startande hästar
        </span>
      </div>

      {/* Mobil: Tydliga startkort (visas under 1024px) */}
      <div className="lg:hidden space-y-3">
        {starts.map((start) => (
          <MobilStartKort
            key={start.id}
            start={start}
            oddsInfo={oddsMap?.[start.startNumber]}
            isOddsFailed={isOddsFailed}
            isSelectedForCompare={selectedForCompare.includes(start.horseId)}
            onToggleCompare={onToggleCompare}
            onSelectHorse={onSelectHorse}
          />
        ))}
      </div>

      {/* Laptop: Lugn tabell (visas från 1024px) */}
      <div className="hidden lg:block overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-sm font-semibold border-b border-slate-200">
              <th className="py-3 px-3 w-12 text-center">Jämför</th>
              <th className="py-3 px-3 w-12 text-center">Nr</th>
              <th className="py-3 px-3">Häst & härstamning</th>
              <th className="py-3 px-3">Kusk / Tränare</th>
              <th className="py-3 px-3">Skor & vagn</th>
              <th className="py-3 px-3 text-right">Odds</th>
              <th className="py-3 px-3 text-right">Streck</th>
              <th className="py-3 px-3 text-right">Rekord</th>
              <th className="py-3 px-3 text-right">Intjänat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-base">
            {starts.map((start) => (
              <LaptopStartRad
                key={start.id}
                start={start}
                oddsInfo={oddsMap?.[start.startNumber]}
                isOddsFailed={isOddsFailed}
                isSelectedForCompare={selectedForCompare.includes(start.horseId)}
                onToggleCompare={onToggleCompare}
                onSelectHorse={onSelectHorse}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
