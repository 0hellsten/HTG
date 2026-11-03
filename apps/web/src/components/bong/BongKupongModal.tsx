import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Copy, Check, Download } from 'lucide-react';
import { BongGameType, BongRaceDayData } from '@stallbacken/shared';
import {
  buildBongCouponViewModel,
  formatBongCouponShareText,
  ATG_FILE_UPLOAD_URL,
  buildAtgXmlFile,
  getAtgTrackCode,
} from './bongCouponFormat';

interface BongKupongModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: BongGameType;
  raceDay: BongRaceDayData;
  selectedHorses: Record<number, string[]>;
  costSek: number;
  canExportSystem?: boolean;
}

export const BongKupongModal: React.FC<BongKupongModalProps> = ({
  isOpen,
  onClose,
  gameType,
  raceDay,
  selectedHorses,
  costSek,
  canExportSystem = true,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isV86 = gameType === 'V86';
  const model = buildBongCouponViewModel(raceDay, selectedHorses, gameType, costSek);

  const trackCode = getAtgTrackCode(model, raceDay);
  const canExport = canExportSystem && Boolean(trackCode);

  const handleCopyRows = async () => {
    const shareText = formatBongCouponShareText(model);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setFeedbackMessage('Kupongraderna kopierade till urklipp!');
        setTimeout(() => {
          setIsCopied(false);
          setFeedbackMessage(null);
        }, 3000);
      }
    } catch {
      setFeedbackMessage('Kunde inte kopiera automatiskt.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleDownloadXml = (openAtg = false) => {
    if (!canExport || !trackCode || !raceDay.date) return;
    try {
      const xml = buildAtgXmlFile(model, raceDay.date, trackCode);
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tangitza-${model.gameType.toLowerCase()}-${raceDay.date?.slice(0, 10)}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (openAtg) window.open(ATG_FILE_UPLOAD_URL, '_blank', 'noopener,noreferrer');
      setFeedbackMessage('Välj Tangitza-filen bland dina hämtade filer.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('Kunde inte spara fil.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const config = isV86
    ? {
        aspectRatio: '1434 / 1830',
        bana: { left: '16.0%', top: '13.5%' },
        datum: { left: '18.5%', top: '17.0%' },
        start: { left: '16.0%', top: '20.8%' },
        kostnad: { left: '83.5%', top: '13.5%' },
        horsesLeft: '20.0%',
        rowTops: ['43.0%', '50.3%', '57.6%', '64.9%', '72.6%', '80.3%', '87.8%', '95.2%'],
      }
    : {
        aspectRatio: '1399 / 1812',
        bana: { left: '14.5%', top: '13.0%' },
        datum: { left: '17.0%', top: '16.5%' },
        start: { left: '14.5%', top: '20.2%' },
        kostnad: { left: '84.0%', top: '13.0%' },
        horsesLeft: '19.0%',
        rowTops: ['42.5%', '49.8%', '57.2%', '64.5%', '72.3%', '80.0%', '87.5%'],
      };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ifylld bong-kupong"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[360px] sm:max-w-[400px] max-h-[94vh] flex flex-col bg-amber-50 rounded-2xl shadow-2xl overflow-hidden border border-amber-900/25"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stäng-knapp */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng kupong"
          className="absolute top-2.5 right-2.5 z-30 min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-slate-900/85 hover:bg-slate-950 text-white shadow-md active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Scrollbart innehåll för mindre skärmar */}
        <div className="overflow-y-auto flex-1">
          {/* Kupongbild med övertryck */}
          <div className="relative w-full select-none" style={{ aspectRatio: config.aspectRatio }}>
            <img
              src={model.couponSrc}
              alt={`Kupong ${model.gameType}`}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Bana */}
            <div
              className="absolute font-mono font-bold text-slate-950 text-[11px] sm:text-xs leading-none whitespace-nowrap"
              style={{ left: config.bana.left, top: config.bana.top }}
            >
              {model.trackName}
            </div>

            {/* Datum */}
            <div
              className="absolute font-mono font-bold text-slate-950 text-[11px] sm:text-xs leading-none whitespace-nowrap"
              style={{ left: config.datum.left, top: config.datum.top }}
            >
              {model.dateStr}
            </div>

            {/* Starttid */}
            <div
              className="absolute font-mono font-bold text-slate-950 text-[11px] sm:text-xs leading-none whitespace-nowrap"
              style={{ left: config.start.left, top: config.start.top }}
            >
              {model.startTime}
            </div>

            {/* Kostnad */}
            <div
              className="absolute font-mono font-bold text-slate-950 text-[11px] sm:text-xs leading-none whitespace-nowrap"
              style={{ left: config.kostnad.left, top: config.kostnad.top }}
            >
              {model.costSekStr}
            </div>

            {/* Hästnummer per avdelning */}
            {model.rows.map((row) => {
              const top = config.rowTops[row.legIndex];
              if (!top) return null;
              return (
                <div
                  key={row.legIndex}
                  className="absolute font-mono font-bold text-slate-950 text-xs sm:text-sm tracking-[0.04em] leading-none whitespace-nowrap"
                  style={{ left: config.horsesLeft, top }}
                >
                  {row.text}
                </div>
              );
            })}
          </div>

          {/* Handlingsfält: Lämna in hos ATG */}
          <div className="p-3.5 sm:p-4 bg-amber-100/90 border-t border-amber-900/15 space-y-2.5">
            {/* Ett tryck till ATG: Huvudknapp */}
            <button
              type="button"
              onClick={() => handleDownloadXml(true)}
              disabled={!canExport}
              className="w-full min-h-[50px] px-4 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-base sm:text-lg rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ExternalLink className="w-5 h-5 shrink-0" />
              <span>Spara fil och öppna ATG</span>
            </button>

            {/* Bekräftelsemeddelande */}
            {feedbackMessage && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-950 text-xs sm:text-sm font-medium border border-emerald-400">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Sekundära val: Kopiera text & Spara ATG XML-fil */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyRows}
                className="min-h-[44px] px-3 py-2 bg-amber-200/90 hover:bg-amber-300 active:scale-[0.98] text-slate-900 font-semibold text-xs sm:text-sm rounded-lg border border-amber-900/20 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>Kopierat!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-700" />
                    <span>Kopiera rader</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDownloadXml()}
                disabled={!canExport}
                className="min-h-[44px] px-3 py-2 bg-amber-200/90 hover:bg-amber-300 active:scale-[0.98] text-slate-900 font-semibold text-xs sm:text-sm rounded-lg border border-amber-900/20 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Spara fil i ATG-format för filinlämning"
              >
                <Download className="w-4 h-4 text-slate-700" />
                <span>Spara fil (ATG)</span>
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-center text-amber-900/80 font-medium">
              {canExport
                ? 'Välj den hämtade filen hos ATG. Kontrollera omgång, hästar och kostnad.'
                : 'Filen kan sparas för en komplett kupong utan reducering eller specialval.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
