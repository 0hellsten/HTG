import React, { useState } from 'react';
import { Calculator, RotateCcw, Copy, Check, TrendingUp, Bookmark } from 'lucide-react';
import { JanneBoySystemResult } from '@stallbacken/shared';
import { JanneBoyLegCard } from './JanneBoyLegCard';

interface JanneBoySystemViewProps {
  system: JanneBoySystemResult;
  lockedHorses: Record<number, string[]>;
  onToggleLock: (legIndex: number, horseId: string) => void;
  onRegenerate: () => void;
  onOpenInBong: (system: JanneBoySystemResult) => void;
}

export const JanneBoySystemView: React.FC<JanneBoySystemViewProps> = ({
  system,
  lockedHorses,
  onToggleLock,
  onRegenerate,
  onOpenInBong,
}) => {
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleCopy = () => {
    const text = system.legs
      .map((l) => {
        const hNrs = l.selectedHorses.map((h) => h.startNumber).join(',');
        return `Avd ${l.legIndex + 1}: ${hNrs}`;
      })
      .join('\n');

    navigator.clipboard.writeText(
      `${system.gameType} — Janne Boy (${system.costSek} kr, ${system.totalRows} rader)\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    try {
      const data = {
        system,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`tangitza_janne_boy_${system.gameType}`, JSON.stringify(data));
      setSaveMessage('Systemet har sparats!');
      setTimeout(() => setSaveMessage(null), 2500);
    } catch {
      setSaveMessage('Kunde inte spara.');
    }
  };

  return (
    <div className="space-y-5">
      {}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                {system.gameType}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Jannes Kupongförslag
              </h2>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 italic">"{system.funQuote}"</p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {system.costSek.toLocaleString('sv-SE')} kr
            </div>
            <div className="text-xs text-slate-400">
              {system.totalRows.toLocaleString('sv-SE')} rader à {system.rowPrice.toFixed(2)} kr
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block font-medium">Spikar</span>
            <span className="text-lg font-bold text-amber-300">{system.spikarCount} st</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block font-medium">Skrälldrag</span>
            <span className="text-lg font-bold text-emerald-400">{system.skrallarCount} st</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block font-medium">Spelvärdesindex</span>
            <span className="text-lg font-bold text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>{system.valueScore} %</span>
            </span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block font-medium">Budget</span>
            <span className="text-lg font-bold text-slate-200">{system.budgetSek} kr</span>
          </div>
        </div>

        {}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onOpenInBong(system)}
            className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Öppna i Bong-maskinen</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Nytt förslag</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
            <span>{copied ? 'Kopierat!' : 'Kopiera'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="min-h-[46px] px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Bookmark className="w-4 h-4 text-slate-400" />
            <span>Spara</span>
          </button>
        </div>

        {saveMessage && (
          <div className="text-center text-xs text-amber-300 font-medium pt-1">{saveMessage}</div>
        )}
      </div>

      {}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
            Avdelningsöversikt ({system.legs.length} lopp)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Tryck på låsikonen för att spika en häst manuellt
          </span>
        </div>

        {system.legs.map((leg) => {
          const isLocked = Boolean(lockedHorses[leg.legIndex]?.length);
          return (
            <JanneBoyLegCard
              key={leg.legIndex}
              leg={leg}
              isLocked={isLocked}
              onToggleLock={onToggleLock}
            />
          );
        })}
      </div>
    </div>
  );
};
