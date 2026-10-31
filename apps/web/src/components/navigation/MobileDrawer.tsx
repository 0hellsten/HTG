import React from 'react';
import { X } from 'lucide-react';
import { Tab, NAV_ITEMS } from './navItems';
import { JanneBoyIcon } from '../janne-boy/JanneBoyIcon';

interface MobileDrawerProps {
  isOpen: boolean;
  activeTab: Tab;
  onClose: () => void;
  onTabChange: (tab: Tab) => void;
  onOpenOm: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
  onOpenOm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative flex flex-col w-72 max-w-[80vw] bg-slate-900 text-slate-100 p-5 shadow-2xl z-10 border-r border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center">
            <img
              src={`${import.meta.env.BASE_URL ?? './'}logo.png`}
              alt="Tangitza"
              className="h-12 w-auto max-w-[170px] object-contain rounded-md"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg p-1.5"
            aria-label="Stäng sidomeny"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto" aria-label="Mobil sidonavigering">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isJanne = item.id === 'janneboy';

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-base transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
                }`}
              >
                {isJanne ? (
                  <JanneBoyIcon className="w-5 h-5 object-contain shrink-0" />
                ) : (
                  <Icon className="w-5 h-5 shrink-0" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onOpenOm}
          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          <span>Om appen</span>
        </button>

        <div className="pt-4 mt-auto border-t border-slate-800 text-center">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 select-none block">
            HTG™ Hellstens Trav &amp; Galopp
          </span>
        </div>
      </aside>
    </div>
  );
};
