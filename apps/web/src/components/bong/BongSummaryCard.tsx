import React, { useState } from 'react';
import { Sparkles, RotateCcw, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BongCalculationResult } from '@stallbacken/shared';

export type QuickCouponPreset = 'small' | 'medium' | 'large' | 'spikar';

interface BongSummaryCardProps {
  calculationResult: BongCalculationResult;
  onApplyPreset: (preset: QuickCouponPreset) => void;
  onResetCoupon: () => void;
}

export const BongSummaryCard: React.FC<BongSummaryCardProps> = ({
  calculationResult,
  onApplyPreset,
  onResetCoupon,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const { mathRows, reducedRows, reductionPercentage, totalCost, radpris } = calculationResult;
  const isReduced = reductionPercentage > 0 && reducedRows !== mathRows;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-3.5 shadow-sm border border-slate-800 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2.5 flex-wrap">
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
              Reducerat (-{reductionPercentage} %)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            aria-expanded={showHelp}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hur gör jag?</span>
            {showHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={onResetCoupon}
            className="min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rensa</span>
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
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

      {showHelp && (
        <div className="mt-2 p-3.5 rounded-lg bg-slate-800/95 border border-slate-700 text-slate-200 text-xs sm:text-sm space-y-2 leading-relaxed">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Så här fungerar Bong-maskinen:</span>
          </div>
          <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
            <li>
              <strong>Välj hästar:</strong> Tryck på flikarna (Avd 1, Avd 2 osv.) och kryssa för de
              hästar du tror på i varje lopp.
            </li>
            <li>
              <strong>Snabbkupong:</strong> Vill du slippa välja själv trycker du bara på en av
              knapparna ovanför (t.ex. <em>"Lagom (~100 kr)"</em>) så fylls kupongen i automatiskt.
            </li>
            <li>
              <strong>Kupongpris:</strong> Priset räknas om direkt när du lägger till eller tar bort
              hästar.
            </li>
            <li>
              <strong>Bong-knappen:</strong> Tryck på den runda Bong-ikonen längst ned till höger
              när du vill se hela den ifyllda bongen.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
