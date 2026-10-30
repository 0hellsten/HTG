import React from 'react';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onOpenDrawer: () => void;
  onOpenOm: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenDrawer,
  onOpenOm,
}) => {
  return (
    <header className="lg:hidden bg-slate-900 text-white px-3 py-2 flex items-center justify-between border-b border-slate-800 sticky top-0 z-20 shadow-sm min-h-[56px]">
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Öppna sidomeny"
        title="Öppna meny"
        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors cursor-pointer"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center justify-center text-center select-none py-0.5">
        <img
          src="./logo.png"
          alt="Stallbacken"
          className="h-8 w-auto max-w-[140px] object-contain rounded drop-shadow-xs"
        />
        <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase leading-tight mt-0.5">
          Harry Janne
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenOm}
        className="min-h-[44px] px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center"
      >
        <span>Om</span>
      </button>
    </header>
  );
};
