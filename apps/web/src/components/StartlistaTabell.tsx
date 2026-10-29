import React from 'react';
import { Start, SourceStatus } from '@stallbacken/shared';
import { SkoVisare } from './SkoVisare';
import {
  formatCurrency,
  formatKmTime,
  formatDistance,
  formatOdds,
  formatPercent,
} from '../lib/format';

export interface HorseOddsMap {
  [startNumber: number]: {
    winOdds?: number;
    placeOdds?: number;
    stakePercent?: number;
  };
}

interface StartlistaTabellProps {
  starts: Start[];
  oddsMap?: HorseOddsMap;
  oddsTimestamp?: string;
  oddsStatus?: SourceStatus;
  onSelectHorse?: (horseId: string) => void;
}

export const StartlistaTabell: React.FC<StartlistaTabellProps> = ({
  starts,
  oddsMap,
  oddsTimestamp,
  oddsStatus,
  onSelectHorse,
}) => {
  if (!starts || starts.length === 0) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-center text-base">
        Den här uppgiften saknas just nu.
      </div>
    );
  }

  const isOddsFailed = oddsStatus === 'failed';

  return (
    <div className="space-y-3">
      {/* Tidsstämpel / info för odds i startlistan */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1">
        <span>
          {isOddsFailed
            ? 'Oddsen uppdateras inte just nu'
            : oddsTimestamp
            ? `Odds från ${oddsTimestamp}`
            : 'Vinnarodds och streckprocent'}
        </span>
        <span className="hidden sm:inline">
          {starts.filter((s) => !s.scratched).length} startande hästar
        </span>
      </div>

      {/* Mobil: Tydliga startkort (visas under 1024px) */}
      <div className="lg:hidden space-y-3">
        {starts.map((start) => (
          <MobilStartKort
            key={start.id}
            start={start}
            oddsInfo={oddsMap?.[start.startNumber]}
            isOddsFailed={isOddsFailed}
            onSelectHorse={onSelectHorse}
          />
        ))}
      </div>

      {/* Laptop: Lugn tabell (visas från 1024px) */}
      <div className="hidden lg:block overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-sm font-semibold border-b border-slate-200">
              <th className="py-3 px-3 w-12 text-center">Nr</th>
              <th className="py-3 px-3">Häst & härstamning</th>
              <th className="py-3 px-3">Kusk / Tränare</th>
              <th className="py-3 px-3">Skor & vagn</th>
              <th className="py-3 px-3 text-right">Odds</th>
              <th className="py-3 px-3 text-right">Streck</th>
              <th className="py-3 px-3 text-right">Rekord</th>
              <th className="py-3 px-3 text-right">Intjänat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-base">
            {starts.map((start) => (
              <LaptopStartRad
                key={start.id}
                start={start}
                oddsInfo={oddsMap?.[start.startNumber]}
                isOddsFailed={isOddsFailed}
                onSelectHorse={onSelectHorse}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface CardProps {
  start: Start;
  oddsInfo?: {
    winOdds?: number;
    placeOdds?: number;
    stakePercent?: number;
  };
  isOddsFailed?: boolean;
  onSelectHorse?: (horseId: string) => void;
}

const MobilStartKort: React.FC<CardProps> = ({
  start,
  oddsInfo,
  isOddsFailed,
  onSelectHorse,
}) => {
  const isScratched = Boolean(start.scratched);

  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        isScratched
          ? 'bg-slate-100/70 border-slate-200 opacity-60'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Startnummer */}
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl font-bold shrink-0 ${
              isScratched
                ? 'bg-slate-300 text-slate-600 line-through'
                : 'bg-slate-900 text-white'
            }`}
          >
            {start.startNumber}
          </div>

          <div>
            {onSelectHorse && !isScratched ? (
              <button
                type="button"
                onClick={() => onSelectHorse(start.horseId)}
                className="text-lg font-bold text-slate-950 text-left hover:text-amber-700 transition-colors focus:outline-none focus:underline"
              >
                {start.horseName}
              </button>
            ) : (
              <h3
                className={`text-lg font-bold ${
                  isScratched ? 'text-slate-500 line-through' : 'text-slate-950'
                }`}
              >
                {start.horseName}
              </h3>
            )}
            <p className="text-sm text-slate-600 mt-0.5">
              Spår {start.postPosition} · {formatDistance(start.distanceM)}
            </p>
          </div>
        </div>

        {isScratched && (
          <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-md uppercase tracking-wider">
            Struken
          </span>
        )}
      </div>

      {isScratched && start.scratchReason && (
        <p className="text-sm text-red-700 mt-2 italic">
          Orsak: {start.scratchReason}
        </p>
      )}

      {!isScratched && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm sm:text-base">
          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500">Kusk:</span>
            <span className="font-medium text-slate-900">
              {start.driverName || '–'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500">Tränare:</span>
            <span>{start.trainerName || '–'}</span>
          </div>

          <div className="flex justify-between items-center text-slate-700 pt-1">
            <span className="text-slate-500">Utrustning:</span>
            <SkoVisare
              shoesFront={start.shoesFront}
              shoesBack={start.shoesBack}
              shoesChanged={start.shoesChanged}
              sulkyType={start.sulkyType}
            />
          </div>

          {/* Odds och streckrad för mobil */}
          <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Vinnarodds</span>
              <span className="text-base font-bold text-slate-900">
                {isOddsFailed ? '–' : formatOdds(oddsInfo?.winOdds)}
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-500 font-medium block">Streck</span>
              <span className="text-base font-bold text-slate-900">
                {isOddsFailed ? '–' : formatPercent(oddsInfo?.stakePercent)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Rekord</span>
              <span className="font-medium text-slate-900">
                {formatKmTime(start.record)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LaptopStartRad: React.FC<CardProps> = ({
  start,
  oddsInfo,
  isOddsFailed,
  onSelectHorse,
}) => {
  const isScratched = Boolean(start.scratched);

  return (
    <tr
      className={`transition-colors hover:bg-slate-50/80 ${
        isScratched ? 'bg-slate-50/60 opacity-60' : ''
      }`}
    >
      <td className="py-3.5 px-3 text-center font-bold">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded ${
            isScratched
              ? 'bg-slate-200 text-slate-500 line-through'
              : 'bg-slate-900 text-white'
          }`}
        >
          {start.startNumber}
        </span>
      </td>

      <td className="py-3.5 px-3">
        <div className="flex items-center gap-2">
          {onSelectHorse && !isScratched ? (
            <button
              type="button"
              onClick={() => onSelectHorse(start.horseId)}
              className="font-bold text-slate-950 text-left hover:text-amber-700 transition-colors focus:outline-none focus:underline"
            >
              {start.horseName}
            </button>
          ) : (
            <span
              className={`font-semibold ${
                isScratched ? 'line-through text-slate-500' : 'text-slate-950'
              }`}
            >
              {start.horseName}
            </span>
          )}
          {isScratched && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
              Struken {start.scratchReason ? `(${start.scratchReason})` : ''}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          Spår {start.postPosition} · {formatDistance(start.distanceM)}
        </div>
      </td>

      <td className="py-3.5 px-3 text-slate-800">
        <div className="font-medium">{start.driverName || '–'}</div>
        <div className="text-xs text-slate-500">
          Tränare: {start.trainerName || '–'}
        </div>
      </td>

      <td className="py-3.5 px-3">
        <SkoVisare
          shoesFront={start.shoesFront}
          shoesBack={start.shoesBack}
          shoesChanged={start.shoesChanged}
          sulkyType={start.sulkyType}
        />
      </td>

      {/* Vinnarodds kolumn */}
      <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
        {isScratched || isOddsFailed ? '–' : formatOdds(oddsInfo?.winOdds)}
      </td>

      {/* Streckprocent kolumn */}
      <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
        {isScratched || isOddsFailed ? '–' : formatPercent(oddsInfo?.stakePercent)}
      </td>

      <td className="py-3.5 px-3 text-right font-medium text-slate-900">
        {formatKmTime(start.record)}
      </td>

      <td className="py-3.5 px-3 text-right font-medium text-slate-900">
        {formatCurrency(start.earnings)}
      </td>
    </tr>
  );
};
