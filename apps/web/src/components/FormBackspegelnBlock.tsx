import React from 'react';
import { HorsePastStart, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from './FarskhetsPrick';
import { BlockErrorBoundary } from './BlockErrorBoundary';
import { SkoVisare } from './SkoVisare';
import { formatDateShort, formatOdds, formatDistance } from '../lib/format';
import { History } from 'lucide-react';

interface FormBackspegelnBlockProps {
  starts: HorsePastStart[];
  status: SourceStatus;
  statusMessage?: string;
  onRetry?: () => void;
  title?: string;
}

export const FormBackspegelnBlock: React.FC<FormBackspegelnBlockProps> = ({
  starts,
  status,
  statusMessage,
  onRetry,
  title = 'Form i backspegeln',
}) => {
  const isFailed = status === 'failed';

  return (
    <BlockErrorBoundary fallbackTitle={title} onRetry={onRetry}>
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <span className="text-xs text-slate-500">De 10 senaste starterna</span>
            </div>
          </div>
          <FarskhetsPrick
            status={status}
            explanation={
              statusMessage ||
              'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.'
            }
            onRetry={onRetry}
          />
        </div>

        {starts.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-center text-base">
            {isFailed
              ? 'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.'
              : 'Vi har inga tidigare lopp sparade för den här hästen än.'}
          </div>
        ) : (
          <div>
            {}
            <div className="lg:hidden space-y-3">
              {starts.map((s) => (
                <MobilLoppKort key={s.id} item={s} />
              ))}
            </div>

            {}
            <div className="hidden lg:block overflow-hidden border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                    <th className="py-3 px-3">Datum</th>
                    <th className="py-3 px-3">Bana & lopp</th>
                    <th className="py-3 px-3">Distans & spår</th>
                    <th className="py-3 px-3">Kusk</th>
                    <th className="py-3 px-3 text-center">Plac</th>
                    <th className="py-3 px-3 text-right">Km-tid</th>
                    <th className="py-3 px-3 text-right">Odds</th>
                    <th className="py-3 px-3">Skor & vagn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-base">
                  {starts.map((s) => (
                    <LaptopLoppRad key={s.id} item={s} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </BlockErrorBoundary>
  );
};

const MobilLoppKort: React.FC<{ item: HorsePastStart }> = ({ item }) => {
  const isWin = item.place === '1';
  const isPodium = item.place === '2' || item.place === '3';
  const isGallop = item.place === 'g' || item.place === 'd';

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {formatDateShort(item.date)} · {item.trackName}{' '}
            {item.raceNumber ? `lopp ${item.raceNumber}` : ''}
          </span>
          <span className="text-sm text-slate-700">
            {item.postPosition ? `Spår ${item.postPosition}` : ''} ·{' '}
            {formatDistance(item.distanceM)} ({item.startMethod})
          </span>
        </div>

        {}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${
            isWin
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : isPodium
                ? 'bg-slate-200 text-slate-900'
                : isGallop
                  ? 'bg-red-100 text-red-800'
                  : 'bg-white border border-slate-300 text-slate-700'
          }`}
        >
          {item.place || '–'}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 flex flex-wrap justify-between items-center text-sm">
        <div className="text-slate-800">
          <span className="text-slate-500 text-xs block">Kusk</span>
          <span className="font-medium">{item.driverName || '–'}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 text-xs block">Km-tid / Odds</span>
          <span className="font-semibold text-slate-900">
            {item.kmTime || '–'} · {formatOdds(item.odds)}
          </span>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between text-xs text-slate-600">
        <SkoVisare shoesFront={item.shoesFront} shoesBack={item.shoesBack} />
        <span>{item.sulkyType || '–'}</span>
      </div>
    </div>
  );
};

const LaptopLoppRad: React.FC<{ item: HorsePastStart }> = ({ item }) => {
  const isWin = item.place === '1';
  const isPodium = item.place === '2' || item.place === '3';
  const isGallop = item.place === 'g' || item.place === 'd';

  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-3 px-3 font-medium text-slate-900">{formatDateShort(item.date)}</td>
      <td className="py-3 px-3">
        <span className="font-semibold text-slate-950">{item.trackName}</span>
        {item.raceNumber && (
          <span className="text-slate-500 text-sm ml-1.5">lopp {item.raceNumber}</span>
        )}
      </td>
      <td className="py-3 px-3 text-slate-700">
        {formatDistance(item.distanceM)} {item.postPosition ? `(spår ${item.postPosition})` : ''} ·{' '}
        {item.startMethod}
      </td>
      <td className="py-3 px-3 text-slate-800 font-medium">{item.driverName || '–'}</td>
      <td className="py-3 px-3 text-center">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded font-bold text-sm ${
            isWin
              ? 'bg-amber-400 text-slate-950'
              : isPodium
                ? 'bg-slate-200 text-slate-900'
                : isGallop
                  ? 'bg-red-100 text-red-800'
                  : 'text-slate-700'
          }`}
        >
          {item.place || '–'}
        </span>
      </td>
      <td className="py-3 px-3 text-right font-semibold text-slate-900">{item.kmTime || '–'}</td>
      <td className="py-3 px-3 text-right font-medium text-slate-800">{formatOdds(item.odds)}</td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <SkoVisare shoesFront={item.shoesFront} shoesBack={item.shoesBack} />
          <span className="text-xs text-slate-500 truncate max-w-[120px]">
            {item.sulkyType || ''}
          </span>
        </div>
      </td>
    </tr>
  );
};
