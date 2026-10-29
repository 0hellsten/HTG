import React from 'react';
import { Award } from 'lucide-react';
import { HorseProbabilityAnalysis } from '@stallbacken/shared';

interface BongHorseAnalysisSectionProps {
  analysis: HorseProbabilityAnalysis;
  winOdds: string;
  streckPct: number;
  postPosition: number;
  startMethodText: string;
}

export const BongHorseAnalysisSection: React.FC<BongHorseAnalysisSectionProps> = ({
  analysis,
  winOdds,
  streckPct,
  postPosition,
  startMethodText,
}) => {
  return (
    <div className="space-y-4">
      {/* Odds, Streck och Spelvärde */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>Stallbackens analys och spelvärde</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center">
            <div className="text-xs text-slate-500">Vinnarodds</div>
            <div className="text-base sm:text-lg font-black text-slate-900">{winOdds}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center">
            <div className="text-xs text-slate-500">Streckprocent</div>
            <div className="text-base sm:text-lg font-black text-slate-900">{streckPct} %</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center">
            <div className="text-xs text-slate-500">Spelvärde</div>
            <div
              className={`text-base sm:text-lg font-black ${
                analysis.valueRatio >= 1.25
                  ? 'text-emerald-700'
                  : analysis.valueRatio < 0.8
                    ? 'text-amber-700'
                    : 'text-slate-900'
              }`}
            >
              {analysis.valueRatio}x
            </div>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
          {analysis.travSummary}
        </div>
      </div>

      {/* Taktiska förutsättningar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="font-bold text-slate-950">Spår och startsätt</div>
          <div className="text-slate-600 mt-0.5">
            Spår {postPosition} ({startMethodText})
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {analysis.postAdvantage > 1.15
              ? 'Fördelaktigt startspår med god spets-/ledningsposition.'
              : analysis.postAdvantage < 0.85
                ? 'Svårt läge med ökad risk för dryga spår.'
                : 'Neutralt startspår med bra valmöjligheter.'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="font-bold text-slate-950">Balans och sulky</div>
          <div className="text-slate-600 mt-0.5">
            {analysis.shoeInfo}
            {analysis.sulkyInfo ? ` · ${analysis.sulkyInfo}` : ''}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {analysis.equipmentBonus > 0.15
              ? 'Maximerad utrustning för högsta fartresurs.'
              : 'Standardbalans.'}
          </div>
        </div>
      </div>
    </div>
  );
};
