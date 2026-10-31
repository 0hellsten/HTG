import React from 'react';
import { RotateCcw } from 'lucide-react';
import { BongGameType, BongCalculationResult } from '@stallbacken/shared';

interface BongSettingsProps {
  gameType: BongGameType;
  onlyTopPool: boolean;
  flerbongMultiplier: number;
  sharesCount: number;
  histogram?: BongCalculationResult['payoutDistribution']['histogram'];
  hasReducedRows: boolean;
  onChangeOnlyTopPool: (val: boolean) => void;
  onChangeFlerbongMultiplier: (val: number) => void;
  onChangeSharesCount: (val: number) => void;
  onResetCoupon: () => void;
}

export const BongSettings: React.FC<BongSettingsProps> = ({
  gameType,
  onlyTopPool,
  flerbongMultiplier,
  sharesCount,
  histogram,
  hasReducedRows,
  onChangeOnlyTopPool,
  onChangeFlerbongMultiplier,
  onChangeSharesCount,
  onResetCoupon,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="min-h-[44px] flex-1 text-left flex items-center justify-between cursor-pointer"
          >
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Flerbong &amp; andelar (valfritt)
              </h3>
              <p className="text-xs text-slate-500">
                {onlyTopPool
                  ? gameType === 'V75'
                    ? 'Endast V7'
                    : 'Endast V8'
                  : 'Alla vinstpooler'}{' '}
                · {flerbongMultiplier}x · {sharesCount} andel(ar)
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-700 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
              {isOpen ? 'Dölj' : 'Visa'}
            </span>
          </button>

          <button
            type="button"
            onClick={onResetCoupon}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Töm kupong</span>
          </button>
        </div>

        {isOpen && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyTopPool}
                  onChange={(e) => onChangeOnlyTopPool(e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    Endast {gameType === 'V75' ? 'V7' : 'V8'} (2.5x utdelning)
                  </div>
                  <div className="text-xs text-slate-500">Avsäger lägre vinstpooler</div>
                </div>
              </label>

              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">Flerbong</div>
                  <div className="text-xs text-slate-500">Kupongmultiplikator</div>
                </div>
                <select
                  value={flerbongMultiplier}
                  onChange={(e) => onChangeFlerbongMultiplier(Number(e.target.value))}
                  className="p-1.5 border border-slate-300 rounded-lg text-sm font-bold bg-white"
                >
                  {[1, 2, 3, 4, 5, 10, 20].map((m) => (
                    <option key={m} value={m}>
                      {m}x
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">Andelar</div>
                  <div className="text-xs text-slate-500">För bolagsspel</div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={sharesCount}
                  onChange={(e) => onChangeSharesCount(Math.max(1, Number(e.target.value)))}
                  className="w-16 p-1.5 border border-slate-300 rounded-lg text-sm font-bold text-center bg-white"
                />
              </div>
            </div>

            {hasReducedRows && histogram && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500">&lt; 1 000 kr</div>
                  <div className="text-sm font-bold text-slate-800">{histogram.under1k} st</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500">1 000 – 10 000 kr</div>
                  <div className="text-sm font-bold text-slate-800">{histogram.from1kTo10k} st</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-[11px] text-amber-700 font-semibold">
                    10 000 – 100 000 kr
                  </div>
                  <div className="text-sm font-bold text-amber-900">
                    {histogram.from10kTo100k} st
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-[11px] text-emerald-700 font-semibold">&gt; 100 000 kr</div>
                  <div className="text-sm font-bold text-emerald-900">{histogram.over100k} st</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
