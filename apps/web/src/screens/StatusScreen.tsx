import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Activity, Clock } from 'lucide-react';
import { ApiResponse, SourceHealthRecord } from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { formatSwedishDate, formatSwedishTime } from '../lib/date';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';

interface StatusScreenProps {
  onBack: () => void;
}

import { apiFetch } from '../lib/api';

export const StatusScreen: React.FC<StatusScreenProps> = ({ onBack }) => {
  const [sources, setSources] = useState<SourceHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  const fetchKallor = async () => {
    try {
      const json: ApiResponse<SourceHealthRecord[]> = await apiFetch<SourceHealthRecord[]>('/api/kallor');
      if (json && json.data) {
        setSources(json.data);
        setLastRefreshedAt(json.fetchedAt);
      }
    } catch {
      // Tyst fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKallor();
  }, []);

  const handleUpdateAll = async () => {
    setRefreshing(true);
    try {
      const json: ApiResponse<SourceHealthRecord[]> = await apiFetch<SourceHealthRecord[]>('/api/kallor/uppdatera-allt', { method: 'POST' });
      if (json && json.data) {
        setSources(json.data);
        setLastRefreshedAt(json.fetchedAt);
      }
    } catch {
      // Ignorera
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return 'Ingen hämtning ännu';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '–';
      return `${formatSwedishDate(d)} kl ${formatSwedishTime(d)}`;
    } catch {
      return '–';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Tillbakaknapp och rubrik */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>
        </div>

        {lastRefreshedAt && (
          <span className="text-xs text-slate-500 font-medium">
            Senast kontrollerat: {formatTimestamp(lastRefreshedAt)}
          </span>
        )}
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 flex items-center gap-3">
          <Activity className="w-7 h-7 text-amber-600" />
          <span>Hur färskt är det här?</span>
        </h1>
        <p className="text-base text-slate-600 mt-1">
          Här ser du alla källor som appen hämtar information från, deras aktuella status och när
          varje uppgift senast hämtades.
        </p>
      </div>

      <BlockErrorBoundary fallbackTitle="Kunde inte visa källstatus">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-600">
            Läser in källornas status...
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((src) => {
              const isOk = src.status === 'ok';
              const isStale = src.status === 'stale' || src.status === 'degraded';

              return (
                <div
                  key={src.sourceId}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="shrink-0 pt-0.5">
                        <FarskhetsPrick
                          status={src.status}
                          explanation={src.message}
                          onRetry={handleUpdateAll}
                        />
                      </div>
                      <h2 className="text-lg font-bold text-slate-950">{src.label}</h2>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                        isOk
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isStale
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isOk ? 'Färskt' : isStale ? 'Delvis färskt' : 'Uppdateras inte just nu'}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed pl-6">
                    {src.message || 'Informationen är tillgänglig.'}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pl-6 pt-1 border-t border-slate-100">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Senaste lyckade hämtning:{' '}
                      <strong className="text-slate-700 font-semibold">
                        {formatTimestamp(src.succeededAt || src.attemptedAt)}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Knapp: Uppdatera allt */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleUpdateAll}
            disabled={refreshing}
            className="w-full min-h-[52px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold rounded-xl px-6 py-3.5 text-base sm:text-lg flex items-center justify-center gap-3 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Uppdaterar alla källor...' : 'Uppdatera allt'}</span>
          </button>
          <p className="text-xs text-slate-500 text-center mt-2">
            Hämtar nya startlistor, odds och tips från alla tillgängliga källor på en gång.
          </p>
        </div>
      </BlockErrorBoundary>
    </div>
  );
};
