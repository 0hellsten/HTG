import React from 'react';
import { Sparkles, Check, RefreshCw } from 'lucide-react';
import { JanneBoyIcon } from './JanneBoyIcon';
import { BongGameType, JanneBoyStrategy, JANNE_BOY_STRATEGIES } from '@stallbacken/shared';

interface JanneBoyControlsProps {
  gameType: BongGameType;
  racesCount?: number;
  trackName?: string;
  strategy: JanneBoyStrategy;
  budget: number;
  isCalculating?: boolean;
  onSelectStrategy: (strat: JanneBoyStrategy) => void;
  onChangeBudget: (b: number) => void;
  onGenerate: () => void;
}

const BUDGET_PRESETS = [50, 100, 200, 300, 500];

export const JanneBoyControls: React.FC<JanneBoyControlsProps> = ({
  gameType,
  racesCount = 7,
  trackName,
  strategy,
  budget,
  isCalculating = false,
  onSelectStrategy,
  onChangeBudget,
  onGenerate,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold">
            <span className="font-black text-amber-400 text-sm">{gameType}</span>
            <span className="text-slate-400">·</span>
            <span>{racesCount} lopp</span>
            {trackName && (
              <>
                <span className="text-slate-400">·</span>
                <span>{trackName}</span>
              </>
            )}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            Välj kupongstorlek:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {BUDGET_PRESETS.map((p) => {
            const isActive = budget === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onChangeBudget(p)}
                className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p} kr
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {JANNE_BOY_STRATEGIES.map((strat) => {
          const isSelected = strategy === strat.id;
          return (
            <button
              key={strat.id}
              type="button"
              onClick={() => onSelectStrategy(strat.id)}
              className={`min-h-[44px] text-left p-3 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/30'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="font-extrabold text-sm text-slate-950 flex items-center gap-1">
                  <span>{strat.label}</span>
                  {strat.id === 'miljondrag' && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Skräll
                    </span>
                  )}
                </h3>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-snug">{strat.tagline}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isCalculating}
        className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-[0.99] ${
          isCalculating
            ? 'bg-amber-300 text-slate-800 cursor-wait opacity-90'
            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
        }`}
      >
        {isCalculating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Janne tar fram nytt tips...</span>
          </>
        ) : (
          <>
            <JanneBoyIcon className="w-5 h-5" />
            <span>Ta fram nytt kupongtips ({budget} kr)</span>
            <Sparkles className="w-4 h-4 text-slate-950" />
          </>
        )}
      </button>
    </div>
  );
};
