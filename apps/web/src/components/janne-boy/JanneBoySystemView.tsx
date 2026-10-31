import React, { useState } from 'react';
import { RotateCcw, Copy, Check, TrendingUp, Bookmark } from 'lucide-react';
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
  onRegenerate,
  onOpenInBong,
  onOpenKupong,
  onSelectHorse,
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
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                {system.gameType}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Jannes Kupongförslag
              </h2>
            </div>
            <p className="text-slate-300 text-xs mt-0.5 italic">"{system.funQuote}"</p>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {system.costSek.toLocaleString('sv-SE')} kr
            </span>
            <span className="text-xs text-slate-400">
              ({system.totalRows.toLocaleString('sv-SE')} rader à {system.rowPrice.toFixed(2)} kr)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span className="inline-flex items-center gap-1">
              <span className="text-slate-400">Spikar:</span>
              <strong className="text-amber-300">{system.spikarCount} st</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="text-slate-400">Skrälldrag:</span>
              <strong className="text-emerald-400">{system.skrallarCount} st</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Spelvärdesindex:</span>
              <strong className="text-blue-400">{system.valueScore} %</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {onOpenKupong && (
              <button
                type="button"
                onClick={onOpenKupong}
                className="min-h-[44px] px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
              >
                <img
                  src={`${import.meta.env.BASE_URL ?? './'}bong.png`}
                  alt=""
                  className="w-4 h-4 object-contain group-hover:scale-110 transition-transform"
                />
                <span>Visa ifylld bong</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenInBong(system)}
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer group"
            >
              <img
                src={`${import.meta.env.BASE_URL ?? './'}bong.png`}
                alt=""
                className="w-4 h-4 object-contain group-hover:scale-110 transition-transform"
              />
              <span>Öppna i Bong-maskinen</span>
            </button>

            <button
              type="button"
              onClick={onRegenerate}
              className="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Nytt</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{copied ? 'Kopierat!' : 'Kopiera'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              <span>Spara</span>
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="text-xs text-amber-300 font-medium pt-0.5">{saveMessage}</div>
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
              onSelectHorse={onSelectHorse}
            />
          );
        })}
      </div>
    </div>
  );
};
