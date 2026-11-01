import React from 'react';
import { JanneBoySystemResult } from '@stallbacken/shared';
import { JanneBoyLegCard } from './JanneBoyLegCard';

interface JanneBoySystemViewProps {
  system: JanneBoySystemResult;
  lockedHorses: Record<number, string[]>;
  onToggleLock: (legIndex: number, horseId: string) => void;
  onRegenerate: () => void;
  onOpenInBong: (system: JanneBoySystemResult) => void;
  onOpenKupong?: () => void;
  onSelectHorse?: (horseId: string) => void;
}

export const JanneBoySystemView: React.FC<JanneBoySystemViewProps> = ({
  system,
  lockedHorses,
  onToggleLock,
  onOpenInBong,
  onSelectHorse,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
            Avdelningar ({system.legs.length} lopp)
          </h3>
          <button
            type="button"
            onClick={() => onOpenInBong(system)}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
          >
            Öppna i Bong-maskinen
          </button>
        </div>

        {system.legs.map((leg) => {
          const isLocked = Boolean(lockedHorses[leg.legIndex]?.length);
          return (
            <JanneBoyLegCard
              key={leg.legIndex}
              leg={leg}
              isLocked={isLocked}
              onToggleLock={onToggleLock}
              onSelectHorse={onSelectHorse}
            />
          );
        })}
      </div>
    </div>
  );
};
