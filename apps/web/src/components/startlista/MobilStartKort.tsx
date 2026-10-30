import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { Start } from '@stallbacken/shared';
import { SkoVisare } from '../SkoVisare';
import { HastsKoIkon } from '../HastsKoIkon';
import {
  isFavoriteHorse,
  toggleFavoriteHorse,
  isFavoriteDriver,
  toggleFavoriteDriver,
  isFavoriteTrainer,
  toggleFavoriteTrainer,
} from '../../lib/favoriter';
import { formatKmTime, formatDistance, formatOdds, formatPercent } from '../../lib/format';

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
                  className="font-bold text-slate-950 text-left text-lg hover:text-amber-700 transition-colors focus:outline-none focus:underline"
                >
                  {start.horseName}
                </button>
              ) : (
                <span
                  className={`font-bold text-lg ${
                    isScratched ? 'text-slate-500 line-through' : 'text-slate-950'
                  }`}
                >
                  {start.horseName}
                </span>
              )}

              {!isScratched && (
                <button
                  type="button"
                  onClick={handleToggleHorseFav}
                  title={isHorseFav ? 'Ta bort häst från Mitt stall' : 'Spara häst i Mitt stall'}
                  aria-label={
                    isHorseFav
                      ? `Ta bort ${start.horseName} från Mitt stall`
                      : `Lägg till ${start.horseName} i Mitt stall`
                  }
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center -m-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <HastsKoIkon
                    filled={isHorseFav}
                    className={`w-4 h-4 ${isHorseFav ? 'text-amber-500' : 'text-slate-300'}`}
                  />
                </button>
              )}
            </div>

            <div className="text-sm text-slate-500">
              Spår {start.postPosition} · {formatDistance(start.distanceM)}
            </div>
          </div>
        </div>

        {onToggleCompare && !isScratched && (
          <button
            type="button"
            onClick={() => onToggleCompare(start.horseId)}
            title={isSelectedForCompare ? 'Ta bort ur jämförelse' : 'Välj för att jämföra'}
            className={`w-9 h-9 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${
              isSelectedForCompare
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        )}
      </div>

      {isScratched ? (
        <div className="mt-3 pt-3 border-t border-slate-200 text-center font-bold text-amber-900 bg-amber-50/80 py-2 rounded-lg">
          STRUKEN
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm">
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
