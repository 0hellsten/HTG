import React, { useState, useEffect } from 'react';

/**
 * Helskärmsöverlägg som visas medan appen laddar in initial data.
 * Visar waiting.gif (hästen) i en centrerad cirkel, med animerade prickar
 * under texten "Laddar". Prickarna tänds och släcks i sekvens.
 *
 * Komponenten fadar ut när `visible` sätts till false och anropar
 * `onDone` när fade-animationen är klar.
 */

interface LaddaOverlayProps {
  /** Styr om överläggningen ska visas (true) eller börja fadas ut (false) */
  visible: boolean;
  /** Anropas när utfadningen är klar — ta bort komponenten från DOM */
  onDone: () => void;
}

export const LaddaOverlay: React.FC<LaddaOverlayProps> = ({ visible, onDone }) => {
  const [phase, setPhase] = useState<'showing' | 'fading' | 'gone'>('showing');

  useEffect(() => {
    if (!visible && phase === 'showing') {
      setPhase('fading');
      const timer = setTimeout(() => {
        setPhase('gone');
        onDone();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visible, phase, onDone]);

  if (phase === 'gone') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-100 transition-opacity duration-500 ${
        phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-label="Appen laddar"
    >
      {/* Cirkel med häst-GIF */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-amber-400 bg-white shadow-lg overflow-hidden flex items-center justify-center">
        <img
          src="/waiting.gif"
          alt="Häst som väntar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* "Laddar" med animerade prickar — placerad strax under cirkeln */}
      <div className="mt-6 flex items-baseline gap-0.5 select-none" aria-hidden="true">
        <span className="text-xl sm:text-2xl font-bold text-slate-700 tracking-wide">
          Laddar
        </span>
        <AnimatedDots />
      </div>
    </div>
  );
};

/**
 * Tre prickar som sekventiellt blinkar (tänds/släcks) med en liten fördröjning.
 * Använder CSS-animation via inline keyframes för att undvika extra beroenden.
 */
const AnimatedDots: React.FC = () => {
  return (
    <span className="inline-flex gap-[3px] ml-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full bg-amber-500"
          style={{
            animation: 'dotPulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </span>
  );
};
