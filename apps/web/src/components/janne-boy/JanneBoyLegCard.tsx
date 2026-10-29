import React from 'react';
import { Sparkles, Lock, Unlock, Clock, MapPin, Flag, Zap } from 'lucide-react';
import { JanneBoyLegSuggestion } from '@stallbacken/shared';

interface JanneBoyLegCardProps {
  leg: JanneBoyLegSuggestion;
  isLocked: boolean;
  onToggleLock: (legIndex: number, horseId: string) => void;
}

export const JanneBoyLegCard: React.FC<JanneBoyLegCardProps> = ({
  leg,
  isLocked,
  onToggleLock,
}) => {
  const startMethodText = leg.startMethod === 'auto' ? 'autostart' : 'voltstart';
  const distanceText = leg.distance ? `${leg.distance.toLocaleString('sv-SE')} m` : undefined;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Avdelningsrubrik & loppdetaljer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                leg.isSpik ? 'bg-slate-950 text-amber-300' : 'bg-amber-500 text-slate-950'
              }`}
            >
              {leg.isSpik ? 'Spik' : `Avd ${leg.legIndex + 1}`}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-950">
              {leg.trackName ? `${leg.trackName} · ` : ''}Lopp {leg.raceNumber}
            </h3>
            {leg.raceName && (
              <span className="text-xs sm:text-sm font-medium text-slate-600 italic">
                — {leg.raceName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
            {leg.trackName && (
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{leg.trackName}</span>
              </span>
            )}
            {leg.startTime && (
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Start kl. {leg.startTime}</span>
              </span>
            )}
            {(distanceText || leg.startMethod) && (
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <span>{[distanceText, startMethodText].filter(Boolean).join(' ')}</span>
              </span>
            )}
          </div>
        </div>

        <div className="self-start sm:self-center">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              leg.isSpik
                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {leg.isSpik ? 'Omsorgsfull spik' : `${leg.selectedHorses.length} hästar`}
          </span>
        </div>
      </div>

      {/* Jannes motivering */}
      <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/70 text-xs sm:text-sm text-amber-950 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">{leg.reason}</p>
      </div>

      {/* Valda hästar med djup travkunskap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {leg.selectedHorses.map((horse) => {
          const streckPct = Math.round(horse.betDistribution * 100);

          return (
            <div
              key={horse.id}
              className={`flex flex-col justify-between p-3 rounded-xl border transition-all ${
                leg.isSpik ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      leg.isSpik ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {horse.startNumber}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-slate-950 truncate flex items-center gap-1.5">
                      <span>{horse.name}</span>
                      {horse.isValueCandidate && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                          <Zap className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Spelvärde {horse.valueRatio ? `${horse.valueRatio}x` : ''}</span>
                        </span>
                      )}
                      {horse.isSpikCandidate && (
                        <span className="inline-flex items-center px-1 py-0.2 rounded bg-amber-200 text-slate-950 text-[9px] font-bold">
                          Spik-kandidat
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {horse.driverName} · Spår {horse.postPosition || horse.startNumber} ·{' '}
                      {streckPct} % · {horse.winOdds ? `${horse.winOdds} odds` : ''}
                    </div>
                  </div>
                </div>

                {/* Lås som spik-knapp */}
                <button
                  type="button"
                  onClick={() => onToggleLock(leg.legIndex, horse.id)}
                  title={isLocked ? 'Lås upp' : 'Lås som min spik'}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    isLocked
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Djup travinfo: Balans, vagn och analys */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] text-slate-600">
                <div className="flex flex-wrap items-center gap-1.5">
                  {horse.shoeInfo && (
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                      {horse.shoeInfo}
                    </span>
                  )}
                  {horse.sulkyInfo && (
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                      {horse.sulkyInfo}
                    </span>
                  )}
                  {horse.impliedProbability && (
                    <span className="text-slate-500 font-medium">
                      Chans: {horse.impliedProbability} %
                    </span>
                  )}
                </div>

                {horse.careAnalysis && (
                  <div className="w-full text-slate-600 italic text-[11px] pt-1">
                    "{horse.careAnalysis}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
