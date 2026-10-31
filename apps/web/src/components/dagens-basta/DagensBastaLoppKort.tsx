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
  let opennessBg = 'bg-slate-800 text-slate-200 border-slate-700';
  if (race.openness === 'tydlig_favorit') {
    opennessBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
  } else if (race.openness === 'tvaspanslopp') {
    opennessBg = 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold';
  } else {
    opennessBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300/90 shadow-md overflow-hidden transition-all hover:shadow-lg">
      {/* Lopphuvud med mörk och distinkt kontrast */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white border-b-2 border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              {race.raceNumber}
            </span>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>Lopp {race.raceNumber}</span>
                {race.raceName && (
                  <span className="text-slate-300 font-semibold text-base sm:text-lg">
                    · {race.raceName}
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm border font-semibold ${opennessBg}`}
            >
              {race.opennessLabel}
            </span>
          </div>
        </div>

        {/* Förutsättningar */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-slate-300 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">Start {race.startTime}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-amber-400" />
            <span>{race.distance} m ({startMethodText})</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>{race.totalHorsesCount} hästar</span>
          </span>
        </div>

        {/* Loppanalys i en mening */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/95 border border-slate-700/80 text-sm sm:text-base text-amber-200 font-medium leading-relaxed">
          {race.shortAnalysis}
        </div>
      </div>

      {/* Hästarna i loppet */}
      <div className="p-5 sm:p-6 space-y-4 bg-slate-100/50">
        <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-600">
          De bästa buden i lopp {race.raceNumber}:
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
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => onOpenRace(race.raceNumber)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400 text-base font-bold min-h-[46px] cursor-pointer transition-colors shadow-2xs"
            >
              <span>Se alla loppets hästar och full startlista</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
