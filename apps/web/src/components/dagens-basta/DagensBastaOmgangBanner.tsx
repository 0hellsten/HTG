import React from 'react';
import { Sparkles, Zap, Trophy, ShieldCheck } from 'lucide-react';
import { DagensBastaOmgang } from '@stallbacken/shared';

interface DagensBastaOmgangBannerProps {
  omgang: DagensBastaOmgang;
  onScrollToRace?: (raceNumber: number) => void;
}

export const DagensBastaOmgangBanner: React.FC<DagensBastaOmgangBannerProps> = ({
  omgang,
  onScrollToRace,
}) => {
  const { topSpik, topSkrall } = omgang;

  return (
    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 sm:p-7 text-slate-950 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
              {omgang.gameName || 'Dagens omgång'}
            </h2>
            <p className="text-sm sm:text-base font-bold text-amber-950">
              {omgang.trackName} · Start {omgang.startTime} · {omgang.races.length} lopp analyserade
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs sm:text-sm font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Lopp för lopp</span>
        </div>
      </div>

      {/* Dagens drag: Spik & Skräll */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Dagens spik */}
        {topSpik && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  Omgångens spik
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Lopp {topSpik.raceNumber}
                </span>
              </div>
              <h3 className="mt-2 text-lg sm:text-xl font-black text-slate-950">
                Nr {topSpik.startNumber} {topSpik.horseName}
              </h3>
              <p className="mt-1 text-sm sm:text-base text-slate-700 leading-snug">
                {topSpik.reason}
              </p>
            </div>

            {onScrollToRace && (
              <div className="mt-3 pt-2">
                <button
                  type="button"
                  onClick={() => onScrollToRace(topSpik.raceNumber)}
                  className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-950 cursor-pointer min-h-[44px] flex items-center"
                >
                  Gå till Lopp {topSpik.raceNumber} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dagens skräll */}
        {topSkrall && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-purple-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                  <Zap className="w-3.5 h-3.5" />
                  Omgångens skräll
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Lopp {topSkrall.raceNumber}
                </span>
              </div>
              <h3 className="mt-2 text-lg sm:text-xl font-black text-slate-950">
                Nr {topSkrall.startNumber} {topSkrall.horseName}
              </h3>
              <p className="mt-1 text-sm sm:text-base text-slate-700 leading-snug">
                {topSkrall.reason}
              </p>
            </div>

            {onScrollToRace && (
              <div className="mt-3 pt-2">
                <button
                  type="button"
                  onClick={() => onScrollToRace(topSkrall.raceNumber)}
                  className="text-xs sm:text-sm font-bold text-purple-900 hover:text-purple-950 cursor-pointer min-h-[44px] flex items-center"
                >
                  Gå till Lopp {topSkrall.raceNumber} →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
