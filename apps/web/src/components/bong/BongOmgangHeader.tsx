import React from 'react';
import { Calculator, Calendar, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { BongRaceDayData } from '@stallbacken/shared';
import { BongCompetition } from './competitions';
import { BongDateSelector } from './BongDateSelector';

interface BongOmgangHeaderProps {
  raceDay: BongRaceDayData;
  competitions: BongCompetition[];
  selectedDateIso: string;
  onSelectCompetition: (comp: BongCompetition) => void;
}

export const BongOmgangHeader: React.FC<BongOmgangHeaderProps> = ({
  raceDay,
  competitions,
  selectedDateIso,
  onSelectCompetition,
}) => {
  return (
    <div className="space-y-4 border-b border-slate-200 pb-5">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-amber-500 text-slate-950">
              <Calculator className="w-6 h-6 stroke-[2.2]" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Bong-maskinen
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            Professionell systemkalkylator, reduceringsmotor och radkalkyl för travet.
          </p>
        </div>
      </div>

      {}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
          <span>Kommande tävlingar (dra för att se längre fram)</span>
          <span className="text-slate-600 text-[11px] font-medium">14 dagar framåt</span>
        </div>

        <BongDateSelector
          competitions={competitions}
          selectedDateIso={selectedDateIso}
          onSelectCompetition={onSelectCompetition}
        />
      </div>

      {}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{raceDay.trackName || 'Bana ej vald'}</span>
          </span>

          <span className="flex items-center gap-1.5 text-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {raceDay.date ? `${raceDay.date} · ` : ''}
              {raceDay.startTime ? `Start kl. ${raceDay.startTime}` : ''}
            </span>
          </span>

          <span className="text-xs text-slate-400">({raceDay.races.length} avdelningar)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Omsättning: {raceDay.turnover.toLocaleString('sv-SE')} kr</span>
          </span>

          {Boolean(raceDay.jackpotPool && raceDay.jackpotPool > 0) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs">
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>Jackpot +{(raceDay.jackpotPool || 0).toLocaleString('sv-SE')} kr</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
