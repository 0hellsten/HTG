import React from 'react';
import { Flag, Clock, Layers, ArrowUpRight } from 'lucide-react';
import { DagensBastaRace } from '@stallbacken/shared';
import { DagensBastaHastKort } from './DagensBastaHastKort';

interface DagensBastaLoppKortProps {
  race: DagensBastaRace;
  onSelectHorse?: (horseId: string) => void;
  onOpenRace?: (raceNumber: number) => void;
}

export const DagensBastaLoppKort: React.FC<DagensBastaLoppKortProps> = ({
  race,
  onSelectHorse,
  onOpenRace,
}) => {
  const isAuto = race.startMethod === 'auto';
  const startMethodText = isAuto ? 'Auto' : 'Voltstart';

  // Badge för öppenhet
  let opennessBg = 'bg-slate-100 text-slate-800';
  if (race.openness === 'tydlig_favorit') {
    opennessBg = 'bg-emerald-100 text-emerald-950 font-bold';
  } else if (race.openness === 'tvaspanslopp') {
    opennessBg = 'bg-sky-100 text-sky-950 font-bold';
  } else {
    opennessBg = 'bg-amber-100 text-amber-950 font-semibold';
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Lopphuvud */}
      <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-base shrink-0">
              {race.raceNumber}
            </span>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                Lopp {race.raceNumber}
                {race.raceName && (
                  <span className="text-slate-600 font-medium text-base sm:text-lg ml-2">
                    · {race.raceName}
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs sm:text-sm ${opennessBg}`}
            >
              {race.opennessLabel}
            </span>
          </div>
        </div>

        {/* Förutsättningar */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-600 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            Start {race.startTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-slate-400" />
            {race.distance} m ({startMethodText})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            {race.totalHorsesCount} hästar i loppet
          </span>
        </div>

        {/* Loppanalys i en mening */}
        <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200/80 text-sm sm:text-base text-slate-800 font-medium">
          {race.shortAnalysis}
        </div>
      </div>

      {/* Hästarna */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="text-sm sm:text-base font-extrabold text-slate-900">
          De bästa buden i loppet:
        </div>

        <div className="grid grid-cols-1 gap-4">
          {race.horses.map((horse) => (
            <DagensBastaHastKort
              key={horse.id}
              horse={horse}
              onSelectHorse={onSelectHorse}
            />
          ))}
        </div>

        {/* Länk för att visa hela startlistan i loppet */}
        {onOpenRace && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onOpenRace(race.raceNumber)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold min-h-[44px] cursor-pointer transition-colors"
            >
              <span>Se hela startlistan för Lopp {race.raceNumber}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
