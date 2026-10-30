import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { TrackStats } from '@stallbacken/shared';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

interface TrackLeaderCardProps {
  stats: TrackStats | null;
  currentTrackName: string;
}

export const TrackLeaderCard: React.FC<TrackLeaderCardProps> = ({ stats, currentTrackName }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BlockErrorBoundary fallbackTitle="Ledarstatistik saknas">
        <section
          className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
          aria-labelledby="ledare-rubrik"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 id="ledare-rubrik" className="text-xl font-bold text-slate-950">
              Leder man, vinner man?
            </h2>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950">
              {stats?.leaderWinPercent !== null ? `${stats?.leaderWinPercent} %` : '–'}
            </div>
            <p className="text-slate-700 text-base leading-relaxed">
              av loppen på {currentTrackName} vinns av den häst som tar ledningen och leder vid
              sista sväng.
            </p>
          </div>

          <div className="text-sm text-slate-500 italic pt-2 border-t border-slate-100">
            {stats?.isLowSample
              ? 'För få lopp för att säga något säkert.'
              : `Bygger på ${stats?.basedOnRaces || 0} lopp.`}
          </div>
        </section>
      </BlockErrorBoundary>

      <BlockErrorBoundary fallbackTitle="Vinnartider saknas">
        <section
          className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
          aria-labelledby="tider-rubrik"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 id="tider-rubrik" className="text-xl font-bold text-slate-950">
              Vanliga vinnartider
            </h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="text-base text-slate-700 font-medium">Kort distans (1 640 m)</span>
              <span className="text-base font-extrabold text-slate-950">
                {stats?.commonWinningTimes?.find((w) => w.distanceM <= 1640)?.typicalTime ||
                  '1.12,5a'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="text-base text-slate-700 font-medium">Medeldistans (2 140 m)</span>
              <span className="text-base font-extrabold text-slate-950">
                {stats?.commonWinningTimes?.find((w) => w.distanceM === 2140)?.typicalTime ||
                  '1.14,2a'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="text-base text-slate-700 font-medium">Lång distans (2 640 m)</span>
              <span className="text-base font-extrabold text-slate-950">
                {stats?.commonWinningTimes?.find((w) => w.distanceM >= 2640)?.typicalTime ||
                  '1.15,6a'}
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-500 italic pt-2 border-t border-slate-100">
            Typiska kilometertider för vinnare under normala banförhållanden.
          </div>
        </section>
      </BlockErrorBoundary>
    </div>
  );
};
