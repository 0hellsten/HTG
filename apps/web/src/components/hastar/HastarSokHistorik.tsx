import React from 'react';
import { History, X } from 'lucide-react';

interface HastarSokHistorikProps {
  searches: string[];
  onSelectSearch: (term: string) => void;
  onRemoveSearch: (term: string) => void;
  onClearAll: () => void;
}

export const HastarSokHistorik: React.FC<HastarSokHistorikProps> = ({
  searches,
  onSelectSearch,
  onRemoveSearch,
  onClearAll,
}) => {
  if (searches.length === 0) return null;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-0.5">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>Tidigare sökningar</span>
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
        >
          Rensa historik
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {searches.map((term) => (
          <div
            key={term}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-slate-900 transition-colors"
          >
            <button
              type="button"
              onClick={() => onSelectSearch(term)}
              className="cursor-pointer truncate max-w-[160px]"
            >
              {term}
            </button>
            <button
              type="button"
              onClick={() => onRemoveSearch(term)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
              title={`Ta bort "${term}"`}
              aria-label={`Ta bort ${term}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
