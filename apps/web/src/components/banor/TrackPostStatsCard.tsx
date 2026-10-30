import React from 'react';
import { TrackStats, PostPositionStat } from '@stallbacken/shared';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

interface TrackPostStatsCardProps {
  stats: TrackStats | null;
  currentTrackName: string;
  startMethodTab: 'auto' | 'volt';
  setStartMethodTab: (tab: 'auto' | 'volt') => void;
  postStats: PostPositionStat[];
}

export const TrackPostStatsCard: React.FC<TrackPostStatsCardProps> = ({
  stats,
  currentTrackName,
  startMethodTab,
  setStartMethodTab,
  postStats,
}) => {
  return (
    <BlockErrorBoundary fallbackTitle="Spårstatistik saknas">
      <section
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5"
        aria-labelledby="spar-rubrik"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 id="spar-rubrik" className="text-xl font-bold text-slate-950">
              Så brukar spåren gå
            </h2>
            <p className="text-base text-slate-600 mt-0.5">
              Vinstprocent per startspår på {currentTrackName}.
            </p>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStartMethodTab('auto')}
              className={`min-h-[44px] px-4 py-2 rounded-md text-base font-bold transition-all cursor-pointer ${
                startMethodTab === 'auto'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Autostart
            </button>
            <button
              type="button"
              onClick={() => setStartMethodTab('volt')}
              className={`min-h-[44px] px-4 py-2 rounded-md text-base font-bold transition-all cursor-pointer ${
                startMethodTab === 'volt'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Voltstart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {postStats.map((p) => {
            const percent = p.winPercent !== null ? `${p.winPercent} %` : '–';
            const isTop = (p.winPercent || 0) >= 15;
            return (
              <div
                key={p.postPosition}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isTop ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Spår {p.postPosition}
                  </span>
                  {isTop && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-200 text-amber-950 rounded">
                      Bäst
                    </span>
                  )}
                </div>
                <div className="text-xl font-extrabold text-slate-950 mb-1">{percent}</div>
                <div className="text-xs text-slate-500">
                  {p.starts > 0 ? `${p.wins} vinster / ${p.starts} lopp` : 'Inga starter'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-sm text-slate-500 italic pt-2 border-t border-slate-100">
          {stats?.isLowSample
            ? 'För få lopp för att säga något säkert.'
            : `Bygger på ${stats?.basedOnRaces || 0} lopp.`}
        </div>
      </section>
    </BlockErrorBoundary>
  );
};
