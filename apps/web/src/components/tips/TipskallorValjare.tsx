// Komponent för att visa och välja tipskällor (markerbara kort med minimerat normalläge)
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from '../FarskhetsPrick';

export interface TipProviderItem {
  id: string;
  name: string;
  status: SourceStatus;
  message: string;
  fetchedAt: string;
}

interface TipskallorValjareProps {
  providers: TipProviderItem[];
  disabledProviders: Set<string>;
  onToggleProvider: (id: string) => void;
  onRetry: () => void;
}

export const TipskallorValjare: React.FC<TipskallorValjareProps> = ({
  providers,
  disabledProviders,
  onToggleProvider,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const activeCount = providers.filter((p) => !disabledProviders.has(p.id)).length;

  if (providers.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer min-h-[44px] -m-1 p-1 rounded-lg hover:bg-slate-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="tipskallor-innehall"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Tipskällor
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {activeCount} av {providers.length} aktiva
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <span>{isExpanded ? 'Dölj källor' : 'Välj och ändra källor'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div id="tipskallor-innehall" className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-600">
            Tryck på en källa för att stänga av eller aktivera den. Valet sparas automatiskt i din
            webbläsare.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {providers.map((p) => {
              const isEnabled = !disabledProviders.has(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => onToggleProvider(p.id)}
                  role="checkbox"
                  aria-checked={isEnabled}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      onToggleProvider(p.id);
                    }
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer min-h-[52px] select-none ${
                    isEnabled
                      ? 'bg-amber-50/50 border-amber-500 text-slate-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isEnabled
                          ? 'bg-amber-500 border-amber-600 text-slate-950'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`font-bold block text-base truncate ${
                          isEnabled ? 'text-slate-950' : 'text-slate-500'
                        }`}
                      >
                        {p.name}
                      </span>
                      <span
                        className={`text-xs block truncate ${
                          isEnabled ? 'text-amber-800 font-medium' : 'text-slate-600'
                        }`}
                      >
                        {isEnabled ? 'Visas i lopprankingarna' : 'Bortvald — döljs i ranking'}
                      </span>
                    </div>
                  </div>

                  <div
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    title={p.message}
                  >
                    <FarskhetsPrick status={p.status} explanation={p.message} onRetry={onRetry} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
