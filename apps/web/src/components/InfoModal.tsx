import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, icon, children }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border-2 border-slate-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fast sidhuvud med titel och tydlig stäng-knapp */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            {icon && <span className="shrink-0 text-amber-400">{icon}</span>}
            <h2 className="text-xl sm:text-2xl font-black tracking-tight truncate text-white">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng informationsruta"
            title="Stäng"
            className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 font-bold text-sm sm:text-base border border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 shrink-0" />
            <span className="hidden sm:inline">Stäng</span>
          </button>
        </div>

        {/* Scrollbart innehåll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 text-slate-900">
          {children}
        </div>

        {/* Fast bottenlist med stor lugn stängknapp */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-base font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Klar och stäng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
