import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { Start } from '@stallbacken/shared';
import { SkoVisare } from './SkoVisare';
import { HastsKoIkon } from './HastsKoIkon';
import {
  isFavoriteHorse,
  toggleFavoriteHorse,
  isFavoriteDriver,
  toggleFavoriteDriver,
  isFavoriteTrainer,
  toggleFavoriteTrainer,
} from '../lib/favoriter';
import {
  formatCurrency,
  formatKmTime,
  formatDistance,
  formatOdds,
  formatPercent,
} from '../lib/format';

export interface CardProps {
  start: Start;
  oddsInfo?: {
    winOdds?: number;
    placeOdds?: number;
    stakePercent?: number;
  };
  isOddsFailed?: boolean;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (horseId: string) => void;
  onSelectHorse?: (horseId: string) => void;
}

export const MobilStartKort: React.FC<CardProps> = ({
  start,
  oddsInfo,
  isOddsFailed,
  isSelectedForCompare,
  onToggleCompare,
  onSelectHorse,
}) => {
  const isScratched = Boolean(start.scratched);
  const [isHorseFav, setIsHorseFav] = useState(() => isFavoriteHorse(start.horseId));
  const [isDriverFav, setIsDriverFav] = useState(() =>
    start.driverName ? isFavoriteDriver(start.driverName) : false
  );
  const [isTrainerFav, setIsTrainerFav] = useState(() =>
    start.trainerName ? isFavoriteTrainer(start.trainerName) : false
  );

  const handleToggleHorseFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleFavoriteHorse(start.horseId, start.horseName);
    setIsHorseFav(next);
  };

  const handleToggleDriverFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!start.driverName) return;
    const next = toggleFavoriteDriver(start.driverName);
    setIsDriverFav(next);
  };

  const handleToggleTrainerFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!start.trainerName) return;
    const next = toggleFavoriteTrainer(start.trainerName);
    setIsTrainerFav(next);
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        isScratched
          ? 'bg-slate-100/70 border-slate-200 opacity-60'
          : isSelectedForCompare
            ? 'bg-amber-50/50 border-amber-300 shadow-sm'
            : isHorseFav || isDriverFav || isTrainerFav
              ? 'bg-amber-50/30 border-amber-200/80 shadow-sm'
              : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Startnummer */}
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl font-bold shrink-0 ${
              isScratched ? 'bg-slate-300 text-slate-600 line-through' : 'bg-slate-900 text-white'
            }`}
          >
            {start.startNumber}
          </div>

          <div>
            <div className="flex items-center gap-2">
              {onSelectHorse && !isScratched ? (
                <button
                  type="button"
                  onClick={() => onSelectHorse(start.horseId)}
                  className="text-lg font-bold text-slate-950 text-left hover:text-amber-700 transition-colors focus:outline-none focus:underline cursor-pointer"
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

              {!isScratched && (
                <button
                  type="button"
                  onClick={handleToggleHorseFav}
                  title={
                    isHorseFav ? 'Ta bort hästen från Mitt stall' : 'Spara hästen i Mitt stall'
                  }
                  aria-label={
                    isHorseFav
                      ? `Ta bort ${start.horseName} från Mitt stall`
                      : `Lägg till ${start.horseName} i Mitt stall`
                  }
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center -m-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <HastsKoIkon
                    filled={isHorseFav}
                    className={`w-4 h-4 ${isHorseFav ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                  />
                </button>
              )}
            </div>

            <p className="text-sm text-slate-600 mt-0.5">
              Spår {start.postPosition} · {formatDistance(start.distanceM)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isScratched ? (
            <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-md uppercase tracking-wider">
              Struken
            </span>
          ) : (
            onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(start.horseId)}
                aria-label={`Jämför ${start.horseName}`}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSelectedForCompare
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isSelectedForCompare ? 'Vald' : 'Jämför'}</span>
              </button>
            )
          )}
        </div>
      </div>

      {isScratched && start.scratchReason && (
        <p className="text-sm text-red-700 mt-2 italic">Orsak: {start.scratchReason}</p>
      )}

      {!isScratched && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm sm:text-base">
          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500">Kusk:</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-900">
              <span>{start.driverName || '–'}</span>
              {start.driverName && (
                <button
                  type="button"
                  onClick={handleToggleDriverFav}
                  title={isDriverFav ? 'Ta bort kusk från Mitt stall' : 'Spara kusk i Mitt stall'}
                  aria-label={
                    isDriverFav
                      ? `Ta bort ${start.driverName} från Mitt stall`
                      : `Lägg till ${start.driverName} i Mitt stall`
                  }
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center -m-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <HastsKoIkon
                    filled={isDriverFav}
                    className={`w-3.5 h-3.5 ${isDriverFav ? 'text-amber-500' : 'text-slate-300'}`}
                  />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500">Tränare:</span>
            <div className="flex items-center gap-1.5 text-slate-900">
              <span>{start.trainerName || '–'}</span>
              {start.trainerName && (
                <button
                  type="button"
                  onClick={handleToggleTrainerFav}
                  title={
                    isTrainerFav ? 'Ta bort tränare från Mitt stall' : 'Spara tränare i Mitt stall'
                  }
                  aria-label={
                    isTrainerFav
                      ? `Ta bort ${start.trainerName} från Mitt stall`
                      : `Lägg till ${start.trainerName} i Mitt stall`
                  }
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center -m-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <HastsKoIkon
                    filled={isTrainerFav}
                    className={`w-3.5 h-3.5 ${isTrainerFav ? 'text-amber-500' : 'text-slate-300'}`}
                  />
                </button>
              )}
            </div>
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
              <span className="font-medium text-slate-900">{formatKmTime(start.record)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LaptopStartRad: React.FC<CardProps> = ({
  start,
  oddsInfo,
  isOddsFailed,
  isSelectedForCompare,
  onToggleCompare,
  onSelectHorse,
}) => {
  const isScratched = Boolean(start.scratched);
  const [isHorseFav, setIsHorseFav] = useState(() => isFavoriteHorse(start.horseId));
  const [isDriverFav, setIsDriverFav] = useState(() =>
    start.driverName ? isFavoriteDriver(start.driverName) : false
  );
  const [isTrainerFav, setIsTrainerFav] = useState(() =>
    start.trainerName ? isFavoriteTrainer(start.trainerName) : false
  );

  const handleToggleHorseFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleFavoriteHorse(start.horseId, start.horseName);
    setIsHorseFav(next);
  };

  const handleToggleDriverFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!start.driverName) return;
    const next = toggleFavoriteDriver(start.driverName);
    setIsDriverFav(next);
  };

  const handleToggleTrainerFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!start.trainerName) return;
    const next = toggleFavoriteTrainer(start.trainerName);
    setIsTrainerFav(next);
  };

  return (
    <tr
      className={`transition-colors hover:bg-slate-50/80 ${
        isScratched
          ? 'bg-slate-50/60 opacity-60'
          : isSelectedForCompare
            ? 'bg-amber-50/60'
            : isHorseFav || isDriverFav || isTrainerFav
              ? 'bg-amber-50/20'
              : ''
      }`}
    >
      {/* Välj för jämför */}
      <td className="py-3.5 px-3 text-center">
        {onToggleCompare && !isScratched ? (
          <button
            type="button"
            onClick={() => onToggleCompare(start.horseId)}
            title={isSelectedForCompare ? 'Ta bort ur jämförelse' : 'Välj för att jämföra'}
            className={`w-9 h-9 rounded-md inline-flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${
              isSelectedForCompare
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-slate-300">–</span>
        )}
      </td>

      <td className="py-3.5 px-3 text-center font-bold">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded ${
            isScratched ? 'bg-slate-200 text-slate-500 line-through' : 'bg-slate-900 text-white'
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
              className="font-bold text-slate-950 text-left hover:text-amber-700 transition-colors focus:outline-none focus:underline cursor-pointer"
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

          {!isScratched && (
            <button
              type="button"
              onClick={handleToggleHorseFav}
              title={isHorseFav ? 'Ta bort hästen från Mitt stall' : 'Spara hästen i Mitt stall'}
              aria-label={
                isHorseFav
                  ? `Ta bort ${start.horseName} från Mitt stall`
                  : `Lägg till ${start.horseName} i Mitt stall`
              }
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center -m-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
            >
              <HastsKoIkon
                filled={isHorseFav}
                className={`w-4 h-4 ${isHorseFav ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
              />
            </button>
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
        <div className="flex items-center gap-1.5 font-medium">
          <span>{start.driverName || '–'}</span>
          {start.driverName && (
            <button
              type="button"
              onClick={handleToggleDriverFav}
              title={isDriverFav ? 'Ta bort kusk från Mitt stall' : 'Spara kusk i Mitt stall'}
              aria-label={
                isDriverFav
                  ? `Ta bort ${start.driverName} från Mitt stall`
                  : `Lägg till ${start.driverName} i Mitt stall`
              }
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center -m-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
            >
              <HastsKoIkon
                filled={isDriverFav}
                className={`w-3.5 h-3.5 ${isDriverFav ? 'text-amber-500' : 'text-slate-300'}`}
              />
            </button>
          )}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <span>Tränare: {start.trainerName || '–'}</span>
          {start.trainerName && (
            <button
              type="button"
              onClick={handleToggleTrainerFav}
              title={
                isTrainerFav ? 'Ta bort tränare från Mitt stall' : 'Spara tränare i Mitt stall'
              }
              aria-label={
                isTrainerFav
                  ? `Ta bort ${start.trainerName} från Mitt stall`
                  : `Lägg till ${start.trainerName} i Mitt stall`
              }
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center -m-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
            >
              <HastsKoIkon
                filled={isTrainerFav}
                className={`w-3 h-3 ${isTrainerFav ? 'text-amber-500' : 'text-slate-300'}`}
              />
            </button>
          )}
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
