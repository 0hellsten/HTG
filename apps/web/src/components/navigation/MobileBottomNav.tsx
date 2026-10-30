import React from 'react';
import { Tab, MOBILE_NAV_ITEMS } from './navItems';
import { JanneBoyIcon } from '../janne-boy/JanneBoyIcon';
import { BongIcon } from '../bong/BongIcon';

interface MobileBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around z-30 px-1 py-1 shadow-lg"
      aria-label="Mobil bottenmeny"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isJanne = item.id === 'janneboy';
        const isBong = item.id === 'bong';

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-md transition-colors min-h-[44px] cursor-pointer ${
              isActive ? 'text-amber-600 font-semibold' : 'text-slate-500'
            }`}
          >
            {isJanne ? (
              <JanneBoyIcon className="w-5 h-5 mb-0.5 object-contain shrink-0" />
            ) : isBong ? (
              <BongIcon className="w-5 h-5 mb-0.5 object-contain shrink-0" />
            ) : (
              <Icon
                className={`w-5 h-5 mb-0.5 shrink-0 ${
                  isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'
                }`}
              />
            )}
            <span className="text-[10px] font-medium leading-none truncate max-w-full">
              {item.mobileLabel || item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
