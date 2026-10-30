import React from 'react';
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
} from '../../lib/jamfor';
import { formatCurrency, formatPercent, formatOdds } from '../../lib/format';
import { HorseOddsMap } from '../StartlistaTabell';
import { SkoVisare } from '../SkoVisare';

export interface RowItem {
  id: string;
  label: string;
  sublabel?: string;
  render: (start: Start, profile: HorseProfileResponse | null) => React.ReactNode;
  bestIndices: Set<number>;
}

export function buildJamforRows(
  race: Race,
  starts: Start[],
  profiles: Record<string, HorseProfileResponse | null>,
  oddsMap: HorseOddsMap
): RowItem[] {
  const formScores = starts.map((s) => calculateFormScore(profiles[s.horseId]?.pastStarts));
  const bestForm = getBestIndices(formScores, 'high');

  const bestKmTimes = starts.map((s) => {
    const raw = getBestKmTime(profiles[s.horseId]);
    return { raw, sec: parseKmTimeToSeconds(raw) };
  });
  const bestKmTimeIndices = getBestIndices(
    bestKmTimes.map((b) => b.sec),
    'low'
  );

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

  const trackStats = starts.map((s) => {
    const prof = profiles[s.horseId];
    return prof?.positionStats?.find(
      (st) => st.postPosition === s.postPosition && st.startMethod === race.startMethod
    );
  });
  const trackPercents = trackStats.map((t) => (t && t.starts > 0 ? t.winPercent : null));
  const bestTrackIndices = getBestIndices(trackPercents, 'high');

  const earningsPerStart = starts.map((s) => profiles[s.horseId]?.horse?.earningsPerStart || null);
  const bestEarningsIndices = getBestIndices(earningsPerStart, 'high');

  const winPercents = starts.map((s) => profiles[s.horseId]?.horse?.winPercentage || null);
  const bestWinIndices = getBestIndices(winPercents, 'high');

  const driverForms = starts.map(
    (s) => profiles[s.horseId]?.trainingForm?.driverWinPercent ?? null
  );
  const bestDriverIndices = getBestIndices(driverForms, 'high');

  const trainerForms = starts.map(
    (s) => profiles[s.horseId]?.trainingForm?.trainerWinPercent ?? null
  );
  const bestTrainerIndices = getBestIndices(trainerForms, 'high');

  const stakePercents = starts.map((s) => oddsMap[s.startNumber]?.stakePercent ?? null);
  const bestStakeIndices = getBestIndices(stakePercents, 'high');

  return [
    {
      id: 'form',
      label: 'Form senaste 5',
      sublabel: 'Placering i lopp',
      bestIndices: bestForm,
      render: (_s, prof) => (
        <span className="font-semibold tracking-wide">{formatFormRecent(prof?.pastStarts)}</span>
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
            <span className="text-xs text-slate-600 block">{desc.text}</span>
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
}
