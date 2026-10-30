import React from 'react';
import { Sparkles, Check, Wand2 } from 'lucide-react';
import { BongGameType, JanneBoyStrategy, JANNE_BOY_STRATEGIES } from '@stallbacken/shared';

interface JanneBoyControlsProps {
  gameType: BongGameType;
  racesCount?: number;
  trackName?: string;
  strategy: JanneBoyStrategy;
  budget: number;
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
  onSelectStrategy,
  onChangeBudget,
  onGenerate,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
      {/* 1. Spelformsinformation och budget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Spelform för vald tävling
          </label>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white shadow-xs">
            <span className="font-black text-amber-400 text-base">{gameType}</span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-slate-200 text-sm font-semibold">{racesCount} avdelningar</span>
            {trackName && (
              <>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-slate-300 text-sm">{trackName}</span>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Önskad budget
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {BUDGET_PRESETS.map((p) => {
              const isActive = budget === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChangeBudget(p)}
                  className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p} kr
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Välj Jannes strategi */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
          Hur vill du att Janne tänker idag?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {JANNE_BOY_STRATEGIES.map((strat) => {
            const isSelected = strategy === strat.id;
            return (
              <button
                key={strat.id}
                type="button"
                onClick={() => onSelectStrategy(strat.id)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-base text-slate-950 flex items-center gap-1.5">
                    <span>{strat.label}</span>
                    {strat.id === 'miljondrag' && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Skräll
                      </span>
                    )}
                  </h3>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-amber-800 mt-0.5">{strat.tagline}</p>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{strat.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Genereringsknapp */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          className="w-full min-h-[52px] py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
        >
          <Wand2 className="w-5 h-5" />
          <span>Skapa systemförslag ({budget} kr)</span>
          <Sparkles className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
