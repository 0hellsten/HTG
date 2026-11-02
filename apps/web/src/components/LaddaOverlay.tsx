import React, { useState } from 'react';

/**
 * Laddningsindikator som visas centrerad i innehållsytan medan data hämtas.
 * En rund cirkel med waiting.gif (hästen), och "Laddar" med animerade prickar
 * strax under. Täcker INTE hela skärmen — navigering och header syns som vanligt.
 */

export const LaddaOverlay: React.FC = () => {
  const [horseImageUnavailable, setHorseImageUnavailable] = useState(false);

  return (
    <div
      className="flex flex-col items-center justify-center py-20 sm:py-28"
      role="status"
      aria-label="Laddar innehåll"
    >
      {/* Centrerad cirkel med häst-GIF */}
      <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 border-amber-400 bg-white shadow-lg overflow-hidden">
        {horseImageUnavailable ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-amber-50 text-amber-900">
            <span className="text-6xl leading-none" role="img" aria-label="Häst">
              🐎
            </span>
            <span className="text-sm font-semibold">Strax redo</span>
          </div>
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}waiting.gif`}
            alt="Häst och kusk värmer upp"
            className="h-full w-full object-cover"
            onError={() => setHorseImageUnavailable(true)}
          />
        )}
      </div>

      {/* "Laddar" med animerade prickar — strax under cirkeln */}
      <div className="mt-5 flex items-baseline gap-0.5 select-none" aria-hidden="true">
        <span className="text-lg sm:text-xl font-bold text-slate-600 tracking-wide">
          Laddar
        </span>
        <AnimatedDots />
      </div>
    </div>
  );
};

/**
 * Tre prickar som sekventiellt pulserar (tänds/släcks) med fördröjning.
 */
const AnimatedDots: React.FC = () => {
  return (
    <span className="inline-flex gap-[3px] ml-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"
          style={{
            animation: 'dotPulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </span>
  );
};
