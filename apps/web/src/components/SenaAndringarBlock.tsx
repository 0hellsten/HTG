import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BongRaceDayData } from '@stallbacken/shared';

interface ChangeItem {
  id: string;
  legNumber: number;
  raceNumber?: number;
  raceName?: string;
  startNumber: number;
  horseName: string;
  driverName?: string;
  type: 'struken' | 'sko' | 'sulky';
  description: string;
}

interface SenaAndringarBlockProps {
  raceDay: BongRaceDayData | null;
}

export const SenaAndringarBlock: React.FC<SenaAndringarBlockProps> = ({ raceDay }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const changes = useMemo(() => {
    if (!raceDay || !raceDay.races) return [];

    const items: ChangeItem[] = [];

    for (const race of raceDay.races) {
      const legNumber = race.legIndex + 1;
      const raceNumber = race.raceNumber || legNumber;

      for (const horse of race.horses || []) {
        // 1. Struken häst
        if (horse.scratched) {
          items.push({
            id: `scratched_${raceNumber}_${horse.startNumber}`,
            legNumber,
            raceNumber,
            raceName: race.raceName,
            startNumber: horse.startNumber,
            horseName: horse.name || `Häst ${horse.startNumber}`,
            driverName: horse.driverName,
            type: 'struken',
            description: 'Struken ur loppet',
          });
          continue; // Om hästen är struken rapporterar vi inte skoändring
        }

        // 2. Skoändring
        if (horse.shoeChanged) {
          let shoeDesc = 'Skoändring anmäld';
          if (horse.shoeFront === false && horse.shoeBack === false) {
            shoeDesc = 'Barfota runt om (ändrat)';
          } else if (horse.shoeFront === false && horse.shoeBack === true) {
            shoeDesc = 'Barfota fram (ändrat)';
          } else if (horse.shoeFront === true && horse.shoeBack === false) {
            shoeDesc = 'Barfota bak (ändrat)';
          } else if (horse.shoeFront === true && horse.shoeBack === true) {
            shoeDesc = 'Skor runt om (ändrat)';
          }

          items.push({
            id: `shoe_${raceNumber}_${horse.startNumber}`,
            legNumber,
            raceNumber,
            raceName: race.raceName,
            startNumber: horse.startNumber,
            horseName: horse.name || `Häst ${horse.startNumber}`,
            driverName: horse.driverName,
            type: 'sko',
            description: shoeDesc,
          });
        }

        // 3. Amerikansk sulky
        if (horse.sulkyType === 'american') {
          items.push({
            id: `sulky_${raceNumber}_${horse.startNumber}`,
            legNumber,
            raceNumber,
            raceName: race.raceName,
            startNumber: horse.startNumber,
            horseName: horse.name || `Häst ${horse.startNumber}`,
            driverName: horse.driverName,
            type: 'sulky',
            description: 'Amerikansk sulky (jänkarvagn)',
          });
        }
      }
    }

    return items;
  }, [raceDay]);

  if (!raceDay) return null;

  const scratchedCount = changes.filter((c) => c.type === 'struken').length;
  const shoeCount = changes.filter((c) => c.type === 'sko').length;
  const sulkyCount = changes.filter((c) => c.type === 'sulky').length;
  const totalCount = changes.length;

  // Lugnt normalläge om det inte finns några ändringar
  if (totalCount === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Inga sena ändringar eller strykningar inrapporterade</span>
        </div>
        <span className="text-[11px] text-slate-600 font-semibold">Startlistor stämmer</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/95 border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between text-left cursor-pointer min-h-[44px] gap-2"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-700" />
          </div>
          <span className="font-extrabold text-slate-950 text-sm sm:text-base">
            Sena ändringar ({totalCount})
          </span>
          <span className="text-xs sm:text-sm text-amber-950/80 font-medium">
            {scratchedCount > 0 && (
              <span className="font-bold text-rose-700">{scratchedCount} strukna</span>
            )}
            {scratchedCount > 0 && (shoeCount > 0 || sulkyCount > 0) && ' · '}
            {shoeCount > 0 && <span>{shoeCount} skoändringar</span>}
            {shoeCount > 0 && sulkyCount > 0 && ' · '}
            {sulkyCount > 0 && <span>{sulkyCount} jänkarvagn</span>}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-colors shrink-0">
          <span>{isExpanded ? 'Dölj' : 'Visa'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-200/90 space-y-3 animate-in fade-in duration-150">
          {/* Strukna hästar */}
          {scratchedCount > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                <span>Strukna hästar (ta inte med på kupongen)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {changes
                  .filter((c) => c.type === 'struken')
                  .map((c) => (
                    <div
                      key={c.id}
                      className="bg-white/90 border border-rose-200 rounded-xl px-3 py-2 text-xs sm:text-sm flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">Avd {c.legNumber}:</span>
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {c.startNumber}
                        </span>
                        <span className="font-extrabold text-slate-900">{c.horseName}</span>
                      </div>
                      <span className="font-bold text-rose-700 text-xs px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200">
                        Struken
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Sko- och vagnändringar */}
          {(shoeCount > 0 || sulkyCount > 0) && (
            <div className="space-y-1.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Sko- och vagnändringar
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {changes
                  .filter((c) => c.type === 'sko' || c.type === 'sulky')
                  .map((c) => (
                    <div
                      key={c.id}
                      className="bg-white/90 border border-amber-200 rounded-xl px-3 py-2 text-xs sm:text-sm flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">Avd {c.legNumber}:</span>
                        <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.startNumber}
                        </span>
                        <span className="font-bold text-slate-900">{c.horseName}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                        {c.description}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
