import React, { useState } from 'react';
import { Scale } from 'lucide-react';
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
import { CardProps } from './MobilStartKort';

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
              className={`font-bold ${
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
                className={`w-3.5 h-3.5 ${isHorseFav ? 'text-amber-500' : 'text-slate-300'}`}
              />
            </button>
          )}

          {isScratched && (
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded ml-1">
              STRUKEN
            </span>
          )}
        </div>
      </td>

      <td className="py-3.5 px-3 text-center text-slate-600 font-medium">{start.postPosition}</td>

      <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
        {formatDistance(start.distanceM)}
      </td>

      <td className="py-3.5 px-3">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-900">{start.driverName || '–'}</span>
          {start.driverName && !isScratched && (
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
      </td>

      <td className="py-3.5 px-3">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span>{start.trainerName || '–'}</span>
          {start.trainerName && !isScratched && (
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
      </td>

      <td className="py-3.5 px-3">
        {!isScratched ? (
          <SkoVisare
            shoesFront={start.shoesFront}
            shoesBack={start.shoesBack}
            shoesChanged={start.shoesChanged}
            sulkyType={start.sulkyType}
          />
        ) : (
          <span className="text-slate-400">–</span>
        )}
      </td>

      <td className="py-3.5 px-3 text-right font-medium text-slate-800">
        {formatKmTime(start.record)}
      </td>

      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
        {isOddsFailed || isScratched ? '–' : formatOdds(oddsInfo?.winOdds)}
      </td>

      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
        {isOddsFailed || isScratched ? '–' : formatPercent(oddsInfo?.stakePercent)}
      </td>
    </tr>
  );
};
