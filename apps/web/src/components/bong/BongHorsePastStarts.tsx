import React from 'react';
import { HorsePastStart } from '@stallbacken/shared';
import { formatCurrency } from '../../lib/format';

interface BongHorsePastStartsProps {
  pastStarts: HorsePastStart[];
  earningsTotal?: number;
}

export const BongHorsePastStarts: React.FC<BongHorsePastStartsProps> = ({
  pastStarts,
  earningsTotal,
}) => {
  if (!pastStarts || pastStarts.length === 0) return null;

  return (
    <div className="space-y-2 border-t border-slate-200 pt-3">
      <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
        <span>Form i backspegeln</span>
        {earningsTotal ? <span>{formatCurrency(earningsTotal)} intjänat</span> : null}
      </div>

      <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden text-xs">
        {pastStarts.slice(0, 4).map((r) => (
          <div key={r.id} className="p-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="font-bold text-slate-900">{r.date}</span> ·{' '}
              <span className="text-slate-700">{r.trackName}</span>
              <div className="text-slate-500 truncate">
                {r.distanceM}m · {r.startMethod === 'auto' ? 'auto' : 'volt'} · {r.driverName}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`inline-block px-2 py-0.5 rounded font-black text-xs ${
                  r.place === '1'
                    ? 'bg-amber-100 text-amber-900'
                    : r.place === '2'
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-slate-600'
                }`}
              >
                Plac {r.place}
              </span>
              <div className="text-slate-500 text-[11px] font-mono mt-0.5">{r.kmTime || '–'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
