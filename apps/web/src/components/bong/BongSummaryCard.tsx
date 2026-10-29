import React from 'react';
import { TrendingUp, Copy, Check, Download, Save } from 'lucide-react';
import { BongCalculationResult, BongGameType } from '@stallbacken/shared';

interface BongSummaryCardProps {
  calculationResult: BongCalculationResult;
  flerbongMultiplier: number;
  sharesCount: number;
  onlyTopPool: boolean;
  gameType: BongGameType;
  copied: boolean;
  saveMessage: string | null;
  onCopyRows: () => void;
  onDownloadFile: () => void;
  onSaveBong: () => void;
}

export const BongSummaryCard: React.FC<BongSummaryCardProps> = ({
  calculationResult,
  flerbongMultiplier,
  sharesCount,
  onlyTopPool,
  gameType,
  copied,
  saveMessage,
  onCopyRows,
  onDownloadFile,
  onSaveBong,
}) => {
  const {
    mathRows,
    reducedRows,
    reductionPercentage,
    totalCost,
    radpris,
    costPerShare,
    payoutDistribution,
  } = calculationResult;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-700/80">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Matematiska rader
          </div>
          <div className="text-xl sm:text-2xl font-extrabold mt-0.5 text-slate-100">
            {mathRows.toLocaleString('sv-SE')}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
            Reducerade rader
          </div>
          <div className="text-xl sm:text-2xl font-extrabold mt-0.5 text-amber-300">
            {reducedRows.toLocaleString('sv-SE')}
            {reductionPercentage > 0 && (
              <span className="text-xs font-normal text-emerald-400 ml-1.5">
                (-{reductionPercentage} %)
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Total kostnad
          </div>
          <div className="text-xl sm:text-2xl font-black mt-0.5 text-white">
            {totalCost.toLocaleString('sv-SE')} kr
          </div>
          <div className="text-[11px] text-slate-400">
            {radpris.toFixed(2)} kr/rad
            {flerbongMultiplier > 1 && ` · ${flerbongMultiplier}x`}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Per andel ({sharesCount} st)
          </div>
          <div className="text-xl sm:text-2xl font-extrabold mt-0.5 text-slate-100">
            {costPerShare.toLocaleString('sv-SE')} kr
          </div>
          <div className="text-[11px] text-slate-400">
            {onlyTopPool ? (gameType === 'V75' ? 'V7 (2.5x)' : 'V8 (2.5x)') : 'Alla vinster'}
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
        {reducedRows > 0 ? (
          <div className="flex items-center gap-4 flex-wrap text-slate-300">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Utdelningsestimering:</span>
            </span>
            <span>
              Lägst:{' '}
              <strong className="text-slate-100">
                {payoutDistribution.minPayout.toLocaleString('sv-SE')} kr
              </strong>
            </span>
            <span>
              Median:{' '}
              <strong className="text-amber-300">
                {payoutDistribution.medianPayout.toLocaleString('sv-SE')} kr
              </strong>
            </span>
            <span>
              Högst:{' '}
              <strong className="text-emerald-400">
                {payoutDistribution.maxPayout.toLocaleString('sv-SE')} kr
              </strong>
            </span>
          </div>
        ) : (
          <div className="text-slate-400 italic">
            {mathRows === 0
              ? 'Markera minst en häst i varje avdelning för att beräkna rader.'
              : 'Inga rader matchar de valda villkoren.'}
          </div>
        )}

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onCopyRows}
            disabled={reducedRows === 0}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              reducedRows > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer'
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
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              reducedRows > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm cursor-pointer'
                : 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
            title="Ladda ned fil för inlämning"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Fil</span>
          </button>

          <button
            type="button"
            onClick={onSaveBong}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
            title="Spara bong"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Spara</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="mt-3 text-xs text-emerald-300 font-semibold">{saveMessage}</div>
      )}
    </div>
  );
};
