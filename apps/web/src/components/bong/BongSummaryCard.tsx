import React from 'react';
import { Copy, Check, Download, Save, Sparkles, RotateCcw } from 'lucide-react';
import { BongCalculationResult } from '@stallbacken/shared';

export type QuickCouponPreset = 'small' | 'medium' | 'large' | 'spikar';

interface BongSummaryCardProps {
  calculationResult: BongCalculationResult;
  copied: boolean;
  saveMessage: string | null;
  onCopyRows: () => void;
  onDownloadFile: () => void;
  onSaveBong: () => void;
  onApplyPreset: (preset: QuickCouponPreset) => void;
  onResetCoupon: () => void;
  onOpenKupongModal: () => void;
}

export const BongSummaryCard: React.FC<BongSummaryCardProps> = ({
  calculationResult,
  copied,
  saveMessage,
  onCopyRows,
  onDownloadFile,
  onSaveBong,
  onApplyPreset,
  onResetCoupon,
  onOpenKupongModal,
}) => {
  const { mathRows, reducedRows, reductionPercentage, totalCost, radpris } = calculationResult;
  const isReduced = reductionPercentage > 0 && reducedRows !== mathRows;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-800 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Kupong:</span>
            <span className="text-lg sm:text-xl font-black text-amber-400">
              {totalCost.toLocaleString('sv-SE')} kr
            </span>
          </div>

          <span className="text-slate-600">·</span>

          <div className="text-xs sm:text-sm text-slate-200 font-semibold">
            <span>{reducedRows.toLocaleString('sv-SE')} rader</span>
            <span className="text-slate-400 font-normal ml-1">({radpris.toFixed(2)} kr/rad)</span>
          </div>

          <span className="sr-only">
            Matematiska rader: {mathRows} · Reducerade rader: {reducedRows}
          </span>

          {isReduced && (
            <span className="text-[11px] text-emerald-400 font-semibold">
              Reducerat från {mathRows.toLocaleString('sv-SE')} rader (-{reductionPercentage} %)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenKupongModal}
            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-colors cursor-pointer"
          >
            Visa kupong
          </button>

          <button
            type="button"
            onClick={onCopyRows}
            disabled={reducedRows === 0}
            className={`min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              reducedRows > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
            title="Kopiera enkelrader"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Kopierat!' : 'Kopiera'}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadFile}
            disabled={reducedRows === 0}
            className={`min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              reducedRows > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
            title="Ladda ned fil för inlämning"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Fil</span>
          </button>

          <button
            type="button"
            onClick={onSaveBong}
            className="min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Spara bong"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Spara</span>
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Snabbkupong:</span>
          </span>

          <button
            type="button"
            onClick={() => onApplyPreset('small')}
            className="min-h-[44px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Liten (~50 kr)
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('medium')}
            className="min-h-[44px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Lagom (~100 kr)
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('large')}
            className="min-h-[44px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Större (~200 kr)
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('spikar')}
            className="min-h-[44px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Favoritrad (1 häst/lopp)
          </button>
        </div>

        <button
          type="button"
          onClick={onResetCoupon}
          className="min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Rensa</span>
        </button>
      </div>

      {saveMessage && <div className="text-xs text-emerald-300 font-semibold">{saveMessage}</div>}
    </div>
  );
};
