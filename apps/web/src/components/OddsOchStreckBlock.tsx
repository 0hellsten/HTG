import React from 'react';
import { TrendingUp } from 'lucide-react';
import { RaceOddsData, Start, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from './FarskhetsPrick';
import { BlockErrorBoundary } from './BlockErrorBoundary';
import { formatOdds, formatPercent } from '../lib/format';

interface OddsOchStreckBlockProps {
  oddsData: RaceOddsData | null;
  oddsStatus: SourceStatus;
  oddsMessage: string;
  starts: Start[];
  favoriteHorse: {
    startNumber: number;
    name: string;
    stakePercent?: number;
    winOdds?: number;
  } | null;
  onRetry: () => void;
}

export const OddsOchStreckBlock: React.FC<OddsOchStreckBlockProps> = ({
  oddsData,
  oddsStatus,
  oddsMessage,
  starts,
  favoriteHorse,
  onRetry,
}) => {
  return (
    <BlockErrorBoundary fallbackTitle="Odds och streck" onRetry={onRetry}>
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="text-lg font-bold text-slate-900">Odds och streck</h2>
          </div>
          <FarskhetsPrick
            status={oddsStatus}
            explanation={oddsMessage}
            onRetry={onRetry}
          />
        </div>

        {oddsStatus === 'failed' || !oddsData ? (
          <div className="space-y-3">
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.
            </p>
            <div>
              <button
                type="button"
                onClick={onRetry}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Försök igen
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 border-b border-slate-100 pb-2">
              <span>Spelform: {oddsData.gameType || 'Vinnare'}</span>
              <span>Odds från {oddsData.timeFormatted}</span>
            </div>

            {/* Dagens spik / mest streckade häst */}
            {favoriteHorse && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  Dagens spik (mest streckad)
                </span>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-base font-bold text-slate-950 truncate">
                    {favoriteHorse.startNumber}. {favoriteHorse.name}
                  </span>
                  <span className="text-sm font-semibold text-amber-950 whitespace-nowrap">
                    {formatPercent(favoriteHorse.stakePercent)} streck ·{' '}
                    {formatOdds(favoriteHorse.winOdds)}
                  </span>
                </div>
              </div>
            )}

            {/* Snabböversikt per häst */}
            <div className="divide-y divide-slate-100 pt-1 text-sm">
              {oddsData.odds.map((item) => {
                const start = starts.find((s) => s.startNumber === item.startNumber);
                const isScratched = Boolean(start?.scratched);
                const horseName = start?.horseName || `Häst ${item.startNumber}`;

                return (
                  <div
                    key={item.startNumber}
                    className={`py-2 px-1 flex items-center justify-between ${
                      isScratched ? 'opacity-50 line-through' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {item.startNumber}
                      </span>
                      <span className="font-medium text-slate-900 truncate">
                        {horseName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-600 font-medium">
                        {isScratched ? '–' : formatOdds(item.winOdds)}
                      </span>
                      <span className="text-slate-950 font-bold w-12 text-right">
                        {isScratched ? '–' : formatPercent(item.stakePercent)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </BlockErrorBoundary>
  );
};
