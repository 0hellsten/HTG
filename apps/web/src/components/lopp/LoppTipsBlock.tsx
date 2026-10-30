import React from 'react';
import { Award } from 'lucide-react';
import { RaceTipsData, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from '../FarskhetsPrick';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

interface LoppTipsBlockProps {
  tipsData: RaceTipsData | null;
  tipsStatus: SourceStatus;
  tipsMessage: string;
  onRetry: () => void;
}

export const LoppTipsBlock: React.FC<LoppTipsBlockProps> = ({
  tipsData,
  tipsStatus,
  tipsMessage,
  onRetry,
}) => {
  return (
    <BlockErrorBoundary fallbackTitle="Vad tycker stallbacken?" onRetry={onRetry}>
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="text-lg font-bold text-slate-900">Vad tycker stallbacken?</h2>
          </div>
          <FarskhetsPrick status={tipsStatus} explanation={tipsMessage} onRetry={onRetry} />
        </div>

        {tipsData && tipsData.tips.length > 0 ? (
          <div className="space-y-3">
            {tipsData.aggregatedSummary && (
              <div className="p-3 bg-amber-50/70 rounded-lg text-xs sm:text-sm text-slate-700 font-medium border border-amber-200/60">
                {tipsData.aggregatedSummary}
              </div>
            )}
            <div className="space-y-2.5">
              {tipsData.tips.map((tip) => (
                <div
                  key={tip.id}
                  className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">
                      {tip.horseName || `Häst ${tip.horseNumber || '–'}`}
                      {tip.horseNumber ? ` (nr ${tip.horseNumber})` : ''}
                    </span>
                    {typeof tip.rank === 'number' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-950 rounded text-xs font-bold">
                        Rank {tip.rank}
                      </span>
                    )}
                  </div>
                  {tip.summary && (
                    <p className="text-slate-600 text-sm leading-relaxed">{tip.summary}</p>
                  )}
                  <div className="text-xs text-slate-500 font-semibold pt-1">
                    {tip.provider.startsWith('Tips från ')
                      ? tip.provider
                      : `Tips från ${tip.provider}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Inga tips har kommit in för det här loppet än.
          </p>
        )}
      </section>
    </BlockErrorBoundary>
  );
};
