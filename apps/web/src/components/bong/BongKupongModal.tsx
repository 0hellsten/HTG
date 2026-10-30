import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { BongGameType, BongRaceDayData } from '@stallbacken/shared';
import { buildBongCouponViewModel } from './bongCouponFormat';

interface BongKupongModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: BongGameType;
  raceDay: BongRaceDayData;
  selectedHorses: Record<number, string[]>;
  costSek: number;
}

export const BongKupongModal: React.FC<BongKupongModalProps> = ({
  isOpen,
  onClose,
  gameType,
  raceDay,
  selectedHorses,
  costSek,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isV86 = gameType === 'V86';
  const model = buildBongCouponViewModel(raceDay, selectedHorses, gameType, costSek);

  // Exakta procentkoordinater baserat på uppmätta kuponger
  const config = isV86
    ? {
        aspectRatio: '1434 / 1830',
        bana: { left: '16.0%', top: '14.5%' },
        datum: { left: '18.5%', top: '18.0%' },
        start: { left: '16.0%', top: '21.8%' },
        kostnad: { left: '83.5%', top: '14.5%' },
        horsesLeft: '20.0%',
        rowTops: ['45.0%', '52.3%', '59.6%', '66.9%', '74.6%', '82.3%', '89.8%', '97.2%'],
      }
    : {
        aspectRatio: '1399 / 1812',
        bana: { left: '14.5%', top: '14.0%' },
        datum: { left: '17.0%', top: '17.5%' },
        start: { left: '14.5%', top: '21.2%' },
        kostnad: { left: '84.0%', top: '14.0%' },
        horsesLeft: '19.0%',
        rowTops: ['44.5%', '51.8%', '59.2%', '66.5%', '74.3%', '82.0%', '89.5%'],
      };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ifylld bong-kupong"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] sm:max-w-[380px] bg-amber-50 rounded-2xl shadow-2xl overflow-hidden border border-amber-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stängknapp X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng kupong"
          className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Kupongyta med bild och textöverlägg */}
        <div
          className="relative w-full select-none"
          style={{ aspectRatio: config.aspectRatio }}
        >
          <img
            src={model.couponSrc}
            alt={`Kupong ${model.gameType}`}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Bana */}
          <div
            className="absolute font-mono font-bold text-slate-950 text-[11px] sm:text-xs leading-none whitespace-nowrap"
            style={{ left: config.bana.left, top: config.bana.top }}
          >
            {model.trackName}
          </div>

          {/* Datum */}
          <div
            className="absolute font-mono font-bold text-slate-950 text-[11px] sm:text-xs leading-none whitespace-nowrap"
            style={{ left: config.datum.left, top: config.datum.top }}
          >
            {model.dateStr}
          </div>

          {/* Starttid */}
          <div
            className="absolute font-mono font-bold text-slate-950 text-[11px] sm:text-xs leading-none whitespace-nowrap"
            style={{ left: config.start.left, top: config.start.top }}
          >
            {model.startTime}
          </div>

          {/* Beräknad kostnad */}
          <div
            className="absolute font-mono font-bold text-slate-950 text-[11px] sm:text-xs leading-none whitespace-nowrap"
            style={{ left: config.kostnad.left, top: config.kostnad.top }}
          >
            {model.costSekStr}
          </div>

          {/* Hästrader för AVD 1..N */}
          {model.rows.map((row) => {
            const top = config.rowTops[row.legIndex];
            if (!top) return null;
            return (
              <div
                key={row.legIndex}
                className="absolute font-mono font-bold text-slate-950 text-xs sm:text-sm tracking-[0.14em] leading-none whitespace-nowrap"
                style={{ left: config.horsesLeft, top }}
              >
                {row.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
