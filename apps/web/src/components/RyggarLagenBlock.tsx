import React from 'react';
import { TrackPositionStat, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from './FarskhetsPrick';
import { BlockErrorBoundary } from './BlockErrorBoundary';
import { formatPercent } from '../lib/format';
import { LayoutGrid } from 'lucide-react';

interface RyggarLagenBlockProps {
  stats: TrackPositionStat[];
  status: SourceStatus;
  statusMessage?: string;
  onRetry?: () => void;
}

export const RyggarLagenBlock: React.FC<RyggarLagenBlockProps> = ({
  stats,
  status,
  statusMessage,
  onRetry,
}) => {
  const autoStats = stats.filter((s) => s.startMethod === 'auto');
  const voltStats = stats.filter((s) => s.startMethod === 'volt');

  const renderStatGroup = (groupTitle: string, list: TrackPositionStat[]) => {
    if (list.length === 0) {
      return (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 text-sm text-center">
          Inga registrerade starter med {groupTitle.toLowerCase()}.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          {groupTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {list.map((st) => (
            <div
              key={`${st.startMethod}_${st.postPosition}`}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center"
            >
              <div className="text-xs font-semibold text-slate-500 uppercase">
                Spår {st.postPosition}
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {st.wins}-{st.places - st.wins}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {st.starts} starter ({formatPercent(st.winPercent)})
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <BlockErrorBoundary fallbackTitle="Ryggar och lägen" onRetry={onRetry}>
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Ryggar och lägen</h2>
              <span className="text-xs text-slate-500">Resultat per spår och startsätt</span>
            </div>
          </div>
          <FarskhetsPrick
            status={status}
            explanation={statusMessage || 'Spårstatistik beräknad ur historiken.'}
            onRetry={onRetry}
          />
        </div>

        {stats.length === 0 ? (
          <p className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-center text-sm">
            För få sparade lopp för att beräkna spårmönster.
          </p>
        ) : (
          <div className="space-y-5">
            {renderStatGroup('Autostart', autoStats)}
            {renderStatGroup('Voltstart', voltStats)}
          </div>
        )}
      </section>
    </BlockErrorBoundary>
  );
};
