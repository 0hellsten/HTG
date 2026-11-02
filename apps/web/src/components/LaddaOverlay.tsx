import React from 'react';

/**
 * Laddningsindikator som visas centrerad i innehållsytan medan data hämtas.
 * En rund cirkel med waiting.gif (hästen), och "Laddar" med animerade prickar
 * strax under. Täcker INTE hela skärmen — navigering och header syns som vanligt.
 */

export const LaddaOverlay: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 sm:py-28"
      role="status"
      aria-label="Laddar innehåll"
    >
      {/* Centrerad cirkel med häst-GIF */}
      <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 border-amber-400 bg-white shadow-lg overflow-hidden">
        <img
          src="/waiting.gif"
          alt="Häst som väntar"
          className="w-full h-full object-cover"
        />
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
