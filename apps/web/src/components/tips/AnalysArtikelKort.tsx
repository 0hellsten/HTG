// Artikelkort för analys och nyheter med markering för läst läge
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { TipItem } from '@stallbacken/shared';

interface AnalysArtikelKortProps {
  article: TipItem;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}

export const AnalysArtikelKort: React.FC<AnalysArtikelKortProps> = ({
  article,
  isRead,
  onMarkRead,
}) => {
  return (
    <article
      className={`rounded-xl border p-5 sm:p-6 transition-all ${
        isRead
          ? 'bg-slate-100/90 border-slate-300 text-slate-700 shadow-none'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-slate-300'
      } space-y-2.5`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={`text-lg sm:text-xl font-bold leading-snug ${
              isRead ? 'text-slate-800' : 'text-slate-950'
            }`}
          >
            {article.title}
          </h3>
          {isRead && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-600">
              Läst
            </span>
          )}
        </div>

        <span
          className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md shrink-0 self-start ${
            isRead ? 'text-amber-900/80 bg-amber-50/80' : 'text-amber-800 bg-amber-50'
          }`}
        >
          {article.provider}
        </span>
      </div>

      {article.summary && (
        <p className={`text-base leading-relaxed ${isRead ? 'text-slate-600' : 'text-slate-700'}`}>
          {article.summary}
        </p>
      )}

      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 pt-2 border-t border-slate-200/80">
        <span>Publicerat {article.publishedAt.slice(0, 16).replace('T', ' ')}</span>
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onMarkRead(article.id)}
            className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 font-medium min-h-[44px] py-2 px-1 cursor-pointer"
          >
            <span>{isRead ? 'Läs igen' : 'Läs hela'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </article>
  );
};
