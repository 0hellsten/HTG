import React from 'react';
import { HorseDetail, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from './FarskhetsPrick';
import { BlockErrorBoundary } from './BlockErrorBoundary';
import { formatCurrency, formatPercent } from '../lib/format';
import { Info } from 'lucide-react';

interface HastOmBlockProps {
  horse: HorseDetail;
  status: SourceStatus;
  statusMessage?: string;
  onRetry?: () => void;
}

export const HastOmBlock: React.FC<HastOmBlockProps> = ({
  horse,
  status,
  statusMessage,
  onRetry,
}) => {
  return (
    <BlockErrorBoundary fallbackTitle="Om hästen" onRetry={onRetry}>
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="text-xl font-bold text-slate-900">Om hästen</h2>
          </div>
          <FarskhetsPrick
            status={status}
            explanation={statusMessage || 'Grunduppgifter och stamtavla är färska.'}
            onRetry={onRetry}
          />
        </div>

        {/* Grunduppgifter i grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-base">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Färg & kön
            </span>
            <span className="font-semibold text-slate-900">
              {[horse.color, horse.sex].filter(Boolean).join(', ') || '–'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Tränare & hemmabana
            </span>
            <span className="font-semibold text-slate-900">
              {horse.trainerName || '–'} {horse.homeTrack ? `(${horse.homeTrack})` : ''}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Ägare
            </span>
            <span className="font-semibold text-slate-900">{horse.owner || '–'}</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Uppfödare
            </span>
            <span className="font-semibold text-slate-900">{horse.breeder || '–'}</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Rekord auto / volt
            </span>
            <span className="font-semibold text-slate-900">
              {horse.records.auto || '–'} / {horse.records.volt || '–'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Totalt intjänat
            </span>
            <span className="font-semibold text-slate-900 text-lg">
              {formatCurrency(horse.earningsTotal)}
            </span>
          </div>
        </div>

        {/* Karriärsiffror & Stamtavla */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          {/* Karriärsiffror */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Karriär i siffror
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-base">
              <span className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-lg font-bold">
                {horse.starts} starter: {horse.wins}-{horse.seconds}-{horse.thirds}
              </span>
              <span className="text-slate-600 font-medium">
                Segerprocent:{' '}
                <strong className="text-slate-900">{formatPercent(horse.winPercentage)}</strong>
              </span>
              <span className="text-slate-600 font-medium">
                Platsprocent:{' '}
                <strong className="text-slate-900">{formatPercent(horse.placePercentage)}</strong>
              </span>
            </div>
            {horse.earningsPerStart > 0 && (
              <p className="text-sm text-slate-500">
                Snitt per start: {formatCurrency(horse.earningsPerStart)}
              </p>
            )}
          </div>

          {/* Stamtavla */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Stamtavla</h3>
            <div className="space-y-1.5 text-base">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Far:</span>
                <span className="font-semibold text-slate-900">{horse.pedigree.father || '–'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Mor:</span>
                <span className="font-semibold text-slate-900">{horse.pedigree.mother || '–'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 text-sm">Morfar:</span>
                <span className="font-semibold text-slate-900">
                  {horse.pedigree.grandfather || '–'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BlockErrorBoundary>
  );
};
