import React from 'react';
import { HorsePastStart, TrainingAndDriverForm, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from './FarskhetsPrick';
import { BlockErrorBoundary } from './BlockErrorBoundary';
import { formatDateShort, formatPercent } from '../lib/format';
import { Activity } from 'lucide-react';

interface TraningFormBlockProps {
  trainingForm: TrainingAndDriverForm;
  pastStarts: HorsePastStart[];
  qualifiers: HorsePastStart[];
  status: SourceStatus;
  statusMessage?: string;
  onRetry?: () => void;
}

export const TraningFormBlock: React.FC<TraningFormBlockProps> = ({
  trainingForm,
  pastStarts,
  qualifiers,
  status,
  statusMessage,
  onRetry,
}) => {
  // Formkurva baserad på senaste 5 starterna
  const lastFive = pastStarts.slice(0, 5);

  return (
    <BlockErrorBoundary fallbackTitle="Hur går det i träningen?" onRetry={onRetry}>
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hur går det i träningen?</h2>
              <span className="text-xs text-slate-500">Formkurva och träningsnoteringar</span>
            </div>
          </div>
          <FarskhetsPrick
            status={status}
            explanation={statusMessage || 'Formuppgifter och träningsstatus är färska.'}
            onRetry={onRetry}
          />
        </div>

        {/* Formkurva */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Formkurva (senaste 5 loppen)
          </span>
          {lastFive.length === 0 ? (
            <p className="text-slate-500 text-sm">Inga registrerade lopp för formkurva.</p>
          ) : (
            <div className="flex items-center gap-2.5">
              {lastFive.map((s) => {
                const isWin = s.place === '1';
                const isPodium = s.place === '2' || s.place === '3';
                const isGallop = s.place === 'g' || s.place === 'd';
                return (
                  <div key={s.id} className="text-center">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${
                        isWin
                          ? 'bg-amber-400 text-slate-950'
                          : isPodium
                            ? 'bg-slate-200 text-slate-900'
                            : isGallop
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.place || '–'}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {formatDateShort(s.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tränarens och kuskens form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Tränarens form
            </span>
            <div className="font-semibold text-slate-900 text-base">
              {trainingForm.trainerName || 'Tränare saknas'}
            </div>
            <div className="text-sm text-slate-600 mt-0.5">
              {trainingForm.trainerWinPercent !== null &&
              trainingForm.trainerWinPercent !== undefined
                ? `Segerprocent: ${formatPercent(trainingForm.trainerWinPercent)}`
                : 'För få lopp för att säga något säkert'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Kuskform
            </span>
            <div className="font-semibold text-slate-900 text-base">
              {trainingForm.driverName || 'Kusk saknas'}
            </div>
            <div className="text-sm text-slate-600 mt-0.5">
              {trainingForm.driverWinPercent !== null && trainingForm.driverWinPercent !== undefined
                ? `Segerprocent: ${formatPercent(trainingForm.driverWinPercent)}`
                : 'Ordinarie kusk i senaste starterna'}
            </div>
          </div>
        </div>

        {/* Kvallopp & Träningsnoteringar */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Kvallopp & träningsnoteringar
          </span>
          {qualifiers.length === 0 ? (
            <p className="text-slate-600 text-sm italic">
              Inga kvallopp eller träningsnoteringar registrerade.
            </p>
          ) : (
            <div className="space-y-2">
              {qualifiers.map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-lg flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-semibold text-slate-900">Kvallopp {q.trackName}</span>
                    <span className="text-slate-500 ml-2">
                      {formatDateShort(q.date)} ({q.startMethod})
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{q.kmTime || 'Godkänd'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </BlockErrorBoundary>
  );
};
