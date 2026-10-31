import React from 'react';
import { Tab, NAV_ITEMS } from './navItems';
import { JanneBoyIcon } from '../janne-boy/JanneBoyIcon';

interface DesktopSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenOm: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenOm,
}) => {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-100 p-6 border-r border-slate-800 shrink-0 shadow-lg">
      <div className="mb-8 flex items-center justify-center px-1">
        <img
          src={`${import.meta.env.BASE_URL ?? './'}logo.png`}
          alt="Tangitza"
          className="h-12 w-auto max-w-[180px] object-contain rounded-lg drop-shadow-md"
        />
      </div>

      <nav className="space-y-1.5 flex-1" aria-label="Huvudmeny">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isJanne = item.id === 'janneboy';

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-base transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
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
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
      >
        <span>Om appen</span>
      </button>

      <div className="pt-6 mt-auto border-t border-slate-800/80 text-center">
        <span className="text-[10px] font-mono tracking-widest text-slate-500 select-none block">
          HTG™ Hellstens Trav &amp; Galopp
        </span>
      </div>
    </aside>
  );
};
