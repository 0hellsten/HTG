import React from 'react';
import { X } from 'lucide-react';
import { Race, Start, HorseProfileResponse } from '@stallbacken/shared';
import {
  parseKmTimeToSeconds,
  getBestKmTime,
  calculateRestDays,
  formatRestDays,
  formatFormRecent,
  calculateFormScore,
  formatTrackPositionStat,
  getShoeDescription,
  getBestIndices,
} from '../lib/jamfor';
import { formatCurrency, formatPercent, formatOdds } from '../lib/format';
import { HorseOddsMap } from './StartlistaTabell';
import { SkoVisare } from './SkoVisare';

interface JamforTabellProps {
  race: Race;
  starts: Start[];
  profiles: Record<string, HorseProfileResponse | null>;
  oddsMap: HorseOddsMap;
  onSelectHorse?: (horseId: string) => void;
  onRemoveHorse?: (horseId: string) => void;
}

interface RowItem {
  id: string;
  label: string;
  sublabel?: string;
  render: (start: Start, profile: HorseProfileResponse | null) => React.ReactNode;
  bestIndices: Set<number>;
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

  // 1. Form senaste 5
  const formScores = starts.map((s) =>
    calculateFormScore(profiles[s.horseId]?.pastStarts)
  );
  const bestForm = getBestIndices(formScores, 'high');

  // 2. Bästa km-tid (lägst i sekunder är bäst)
  const bestKmTimes = starts.map((s) => {
    const raw = getBestKmTime(profiles[s.horseId]);
    return { raw, sec: parseKmTimeToSeconds(raw) };
  });
  const bestKmTimeIndices = getBestIndices(
    bestKmTimes.map((b) => b.sec),
    'low'
  );

  // 3. Rekord för loppets startsätt (auto eller volt)
  const isAuto = race.startMethod === 'auto';
  const methodRecords = starts.map((s) => {
    const prof = profiles[s.horseId];
    const recStr = isAuto ? prof?.horse?.records?.auto : prof?.horse?.records?.volt;
    return { raw: recStr, sec: parseKmTimeToSeconds(recStr) };
  });
  const bestRecordIndices = getBestIndices(
    methodRecords.map((r) => r.sec),
    'low'
  );

  // 4. Spårets utfall
  const trackStats = starts.map((s) => {
    const prof = profiles[s.horseId];
    return prof?.positionStats?.find(
      (st) => st.postPosition === s.postPosition && st.startMethod === race.startMethod
    );
  });
  const trackPercents = trackStats.map((t) => (t && t.starts > 0 ? t.winPercent : null));
  const bestTrackIndices = getBestIndices(trackPercents, 'high');

  // 5. Intjänat per start
  const earningsPerStart = starts.map(
    (s) => profiles[s.horseId]?.horse?.earningsPerStart || null
  );
  const bestEarningsIndices = getBestIndices(earningsPerStart, 'high');

  // 6. Segerprocent
  const winPercents = starts.map(
    (s) => profiles[s.horseId]?.horse?.winPercentage || null
  );
  const bestWinIndices = getBestIndices(winPercents, 'high');

  // 8. Kuskens form
  const driverForms = starts.map(
    (s) => profiles[s.horseId]?.trainingForm?.driverWinPercent ?? null
  );
  const bestDriverIndices = getBestIndices(driverForms, 'high');

  // 9. Tränarens form
  const trainerForms = starts.map(
    (s) => profiles[s.horseId]?.trainingForm?.trainerWinPercent ?? null
  );
  const bestTrainerIndices = getBestIndices(trainerForms, 'high');

  // 13. Odds och streck
  const stakePercents = starts.map((s) => oddsMap[s.startNumber]?.stakePercent ?? null);
  const bestStakeIndices = getBestIndices(stakePercents, 'high');

  const rows: RowItem[] = [
    {
      id: 'form',
      label: 'Form senaste 5',
      sublabel: 'Placering i lopp',
      bestIndices: bestForm,
      render: (_s, prof) => (
        <span className="font-semibold tracking-wide">
          {formatFormRecent(prof?.pastStarts)}
        </span>
      ),
    },
    {
      id: 'bestKm',
      label: 'Bästa kilometertid',
      bestIndices: bestKmTimeIndices,
      render: (_s, prof) => {
        const time = getBestKmTime(prof);
        return <span>{time || '–'}</span>;
      },
    },
    {
      id: 'records',
      label: 'Rekord auto / volt',
      sublabel: isAuto ? 'Auto prioriterat' : 'Volt prioriterat',
      bestIndices: bestRecordIndices,
      render: (_s, prof) => {
        const auto = prof?.horse?.records?.auto;
        const volt = prof?.horse?.records?.volt;
        if (!auto && !volt) return <span>–</span>;
        return (
          <div className="text-sm space-y-0.5">
            <div>
              <span className="text-slate-500 font-medium">a: </span>
              <span className={isAuto ? 'font-bold' : ''}>{auto || '–'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">v: </span>
              <span className={!isAuto ? 'font-bold' : ''}>{volt || '–'}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'track',
      label: 'Spårets utfall',
      sublabel: `Spår ${race.startMethod}`,
      bestIndices: bestTrackIndices,
      render: (s, prof) => {
        const stat = prof?.positionStats?.find(
          (st) => st.postPosition === s.postPosition && st.startMethod === race.startMethod
        );
        return <span>{formatTrackPositionStat(stat)}</span>;
      },
    },
    {
      id: 'earnings',
      label: 'Intjänat per start',
      bestIndices: bestEarningsIndices,
      render: (_s, prof) => {
        const val = prof?.horse?.earningsPerStart;
        return <span>{val !== undefined && val !== null ? formatCurrency(val) : '–'}</span>;
      },
    },
    {
      id: 'winPercent',
      label: 'Segerprocent',
      sublabel: 'Totalt i karriären',
      bestIndices: bestWinIndices,
      render: (_s, prof) => {
        const val = prof?.horse?.winPercentage;
        return <span>{val !== undefined && val !== null ? formatPercent(val) : '–'}</span>;
      },
    },
    {
      id: 'driver',
      label: 'Kusk',
      bestIndices: new Set(),
      render: (s) => <span>{s.driverName || '–'}</span>,
    },
    {
      id: 'driverForm',
      label: 'Kuskens form',
      sublabel: 'Seger % senaste 30 dgr',
      bestIndices: bestDriverIndices,
      render: (_s, prof) => {
        const val = prof?.trainingForm?.driverWinPercent;
        return <span>{val !== undefined && val !== null ? formatPercent(val) : '–'}</span>;
      },
    },
    {
      id: 'trainerForm',
      label: 'Tränarens form',
      sublabel: 'Seger % senaste 30 dgr',
      bestIndices: bestTrainerIndices,
      render: (_s, prof) => {
        const val = prof?.trainingForm?.trainerWinPercent;
        return <span>{val !== undefined && val !== null ? formatPercent(val) : '–'}</span>;
      },
    },
    {
      id: 'shoes',
      label: 'Skor',
      sublabel: 'Kommande lopp',
      bestIndices: new Set(),
      render: (s) => {
        const desc = getShoeDescription(s.shoesFront, s.shoesBack, s.shoesChanged);
        if (desc.text === '–') return <span>–</span>;
        return (
          <div className="space-y-1">
            <SkoVisare
              shoesFront={s.shoesFront}
              shoesBack={s.shoesBack}
              shoesChanged={s.shoesChanged}
            />
            <span className="text-xs text-slate-600 block">
              {desc.text}
            </span>
          </div>
        );
      },
    },
    {
      id: 'sulky',
      label: 'Sulky',
      bestIndices: new Set(),
      render: (s) => <span>{s.sulkyType || '–'}</span>,
    },
    {
      id: 'rest',
      label: 'Vila sedan start',
      bestIndices: new Set(),
      render: (_s, prof) => {
        const lastStart = prof?.pastStarts?.[0];
        const days = calculateRestDays(race.scheduledStart, lastStart?.date);
        return <span>{formatRestDays(days)}</span>;
      },
    },
    {
      id: 'odds',
      label: 'Odds och streck',
      bestIndices: bestStakeIndices,
      render: (s) => {
        const odds = oddsMap[s.startNumber];
        const oddsStr = formatOdds(odds?.winOdds);
        const stakeStr = formatPercent(odds?.stakePercent);
        if (oddsStr === '–' && stakeStr === '–') return <span>–</span>;
        return (
          <div className="space-y-0.5">
            <div className="font-bold text-slate-950">{stakeStr}</div>
            <div className="text-xs text-slate-500">Odds {oddsStr}</div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0 text-left text-base table-fixed min-w-full">
          <thead>
            <tr className="bg-slate-50">
              {/* Fast första kolumn: rubrik */}
              <th
                scope="col"
                className="sticky left-0 bg-slate-50 z-20 p-3 sm:p-4 text-sm font-bold text-slate-700 uppercase tracking-wider w-40 min-w-[160px] max-w-[160px] sm:w-52 sm:min-w-[200px] sm:max-w-[200px] border-r border-b border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
              >
                Jämförelse
              </th>
              {/* En kolumn per häst */}
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
                {/* Fast första kolumn: etikett */}
                <th
                  scope="row"
                  className="sticky left-0 bg-white z-10 p-3 sm:p-4 text-left border-r border-b border-slate-100 w-40 min-w-[160px] max-w-[160px] sm:w-52 sm:min-w-[200px] sm:max-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                >
                  <div className="font-semibold text-slate-900 text-sm sm:text-base">
                    {row.label}
                  </div>
                  {row.sublabel && (
                    <div className="text-xs text-slate-500 font-normal mt-0.5">
                      {row.sublabel}
                    </div>
                  )}
                </th>

                {/* Värden för varje häst */}
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
