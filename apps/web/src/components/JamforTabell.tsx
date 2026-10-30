import React from 'react';
import { X } from 'lucide-react';
import { Race, Start, HorseProfileResponse } from '@stallbacken/shared';
import { HorseOddsMap } from './StartlistaTabell';
import { buildJamforRows } from './jamfor/buildJamforRows';

interface JamforTabellProps {
  race: Race;
  starts: Start[];
  profiles: Record<string, HorseProfileResponse | null>;
  oddsMap: HorseOddsMap;
  onSelectHorse?: (horseId: string) => void;
  onRemoveHorse?: (horseId: string) => void;
}

export const JamforTabell: React.FC<JamforTabellProps> = ({
  race,
  starts,
  profiles,
  oddsMap,
  onSelectHorse,
  onRemoveHorse,
}) => {
  const canRemove = starts.length > 2;
  const rows = buildJamforRows(race, starts, profiles, oddsMap);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0 text-left text-base table-fixed min-w-full">
          <thead>
            <tr className="bg-slate-50">
              <th
                scope="col"
                className="sticky left-0 bg-slate-50 z-20 p-3 sm:p-4 text-sm font-bold text-slate-700 uppercase tracking-wider w-40 min-w-[160px] max-w-[160px] sm:w-52 sm:min-w-[200px] sm:max-w-[200px] border-r border-b border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
              >
                Jämförelse
              </th>
              {starts.map((start) => (
                <th
                  key={start.id}
                  scope="col"
                  className="bg-slate-50 p-3 sm:p-4 w-48 min-w-[185px] max-w-[185px] sm:w-56 sm:min-w-[220px] sm:max-w-[220px] border-r border-b border-slate-200 last:border-r-0 align-top"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectHorse && onSelectHorse(start.horseId)}
                      className="text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-7 h-7 rounded-md bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                          {start.startNumber}
                        </span>
                        <span className="font-extrabold text-slate-950 text-base sm:text-lg group-hover:text-amber-800 underline decoration-slate-300 underline-offset-2">
                          {start.horseName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[130px]">
                        Spår {start.postPosition} · {start.driverName || 'Kusk saknas'}
                      </div>
                    </button>

                    {canRemove && onRemoveHorse && (
                      <button
                        type="button"
                        onClick={() => onRemoveHorse(start.horseId)}
                        title={`Ta bort ${start.horseName} ur jämförelsen`}
                        className="text-slate-400 hover:text-red-700 p-1 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                <th
                  scope="row"
                  className="sticky left-0 bg-white z-10 p-3 sm:p-4 text-left border-r border-b border-slate-100 w-40 min-w-[160px] max-w-[160px] sm:w-52 sm:min-w-[200px] sm:max-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                >
                  <div className="font-semibold text-slate-900 text-sm sm:text-base">
                    {row.label}
                  </div>
                  {row.sublabel && (
                    <div className="text-xs text-slate-500 font-normal mt-0.5">{row.sublabel}</div>
                  )}
                </th>

                {starts.map((start, idx) => {
                  const prof = profiles[start.horseId] || null;
                  const isBest = row.bestIndices.has(idx);

                  return (
                    <td
                      key={start.id}
                      className={`p-3 sm:p-4 text-sm sm:text-base border-r border-b border-slate-100 last:border-r-0 transition-colors w-48 min-w-[185px] max-w-[185px] sm:w-56 sm:min-w-[220px] sm:max-w-[220px] ${
                        isBest
                          ? 'bg-amber-50/70 text-slate-950 font-medium'
                          : 'bg-white text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>{row.render(start, prof)}</div>
                        {isBest && (
                          <span
                            title="Bästa värde på raden"
                            className="ml-1 text-[11px] font-bold text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                          >
                            Bäst
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
