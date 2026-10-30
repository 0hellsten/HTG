import React from 'react';
import { MapPin, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { BongRaceDayData } from '@stallbacken/shared';

interface JanneBoyOmgangBannerProps {
  raceDay: BongRaceDayData;
}

export const JanneBoyOmgangBanner: React.FC<JanneBoyOmgangBannerProps> = ({ raceDay }) => {
  return (
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
  );
};
