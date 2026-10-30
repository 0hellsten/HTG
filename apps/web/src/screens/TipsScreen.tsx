import React, { useEffect, useState } from 'react';
import { Award, RefreshCw } from 'lucide-react';
import { ApiResponse, TipsOverviewData, SourceStatus } from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { IdagSkelett } from '../components/SkelettKort';
import { LoppRankingKort } from '../components/tips/LoppRankingKort';
import { AnalysArtikelKort } from '../components/tips/AnalysArtikelKort';
import { TipskallorValjare } from '../components/tips/TipskallorValjare';
import { getReadTipIds, saveReadTipId } from '../lib/read-tips';
import { getDisabledTipProviders, saveDisabledTipProviders } from '../lib/tip-providers';
import { apiFetch } from '../lib/api';

interface TipsScreenProps {
  onOpenRace?: (raceId: string) => void;
}

export const TipsScreen: React.FC<TipsScreenProps> = ({ onOpenRace }) => {
  const [data, setData] = useState<TipsOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState<string>('Alla tips är färska.');
  const [filter, setFilter] = useState<'alla' | 'ranking' | 'artiklar'>('alla');
  const [readTipIds, setReadTipIds] = useState<Set<string>>(() => getReadTipIds());
  const [disabledProviders, setDisabledProviders] = useState<Set<string>>(() =>
    getDisabledTipProviders()
  );

  const handleMarkRead = (id: string) => {
    saveReadTipId(id);
    setReadTipIds((prev) => new Set(prev).add(id));
  };

  const handleToggleProvider = (providerId: string) => {
    setDisabledProviders((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      saveDisabledTipProviders(next);
      return next;
    });
  };

  const fetchTips = async () => {
    setLoading(true);
    try {
      const json: ApiResponse<TipsOverviewData> = await apiFetch<TipsOverviewData>('/api/tips');
      if (json && json.data) {
        setData(json.data);
        setStatus(json.status);
        setStatusMessage(json.message);
      } else {
        setStatus('failed');
        setStatusMessage('Tipsen är från i morse. De brukar komma in på nytt vid lunch.');
      }
    } catch {
      setStatus('failed');
      setStatusMessage('Tipsen är från i morse. De brukar komma in på nytt vid lunch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const articles = data?.articles || [];
  const raceTips = data?.raceTips || [];
  const providers = data?.providers || [];

  const visibleRaceTips = raceTips.filter((tip) => {
    if (tip.sourceId) {
      return !disabledProviders.has(tip.sourceId);
    }
    return true;
  });

  const visibleArticles = articles.filter((art) => {
    if (art.sourceId) {
      return !disabledProviders.has(art.sourceId);
    }
    return true;
  });

  const activeProvidersCount = providers.filter((p) => !disabledProviders.has(p.id)).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {}
      <div className="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-6 h-6 text-amber-600 shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Vad tycker stallbacken?
            </h1>
          </div>
          <p className="text-base text-slate-600">Samlade tips och analyser från flera experter.</p>
        </div>
        <div className="pt-1">
          <FarskhetsPrick status={status} explanation={statusMessage} onRetry={fetchTips} />
        </div>
      </div>

      {}
      <TipskallorValjare
        providers={providers}
        disabledProviders={disabledProviders}
        onToggleProvider={handleToggleProvider}
        onRetry={fetchTips}
      />

      {}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilter('alla')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-base font-semibold transition-colors cursor-pointer ${
            filter === 'alla'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Alla tips ({visibleArticles.length + visibleRaceTips.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('ranking')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-base font-semibold transition-colors cursor-pointer ${
            filter === 'ranking'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Lopprankingar ({visibleRaceTips.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('artiklar')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-base font-semibold transition-colors cursor-pointer ${
            filter === 'artiklar'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Analys & nyheter ({visibleArticles.length})
        </button>
      </div>

      {loading && <IdagSkelett />}

      {!loading && visibleArticles.length === 0 && visibleRaceTips.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <Award className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Inga tips matchar ditt val
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            {activeProvidersCount === 0
              ? 'Du har stängt av alla tipskällor. Öppna rutan för Tipskällor ovan och aktivera minst en källa för att se tips.'
              : 'Tipsen brukar komma in under förmiddagen på tävlingsdagen. Tryck på knappen nedan för att kontrollera på nytt.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={fetchTips}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Försök igen</span>
            </button>
          </div>
        </div>
      )}

      {}
      {!loading && (filter === 'alla' || filter === 'ranking') && visibleRaceTips.length > 0 && (
        <BlockErrorBoundary fallbackTitle="Lopprankingarna saknas just nu">
          <section className="space-y-4" aria-labelledby="ranking-rubrik">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 id="ranking-rubrik" className="text-xl font-bold text-slate-950">
                Lopprankingar & drag
              </h2>
              <span className="text-sm font-medium text-slate-500">
                {visibleRaceTips.length} tips
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleRaceTips.map((tip) => (
                <LoppRankingKort
                  key={tip.id}
                  tip={tip}
                  isRead={readTipIds.has(tip.id)}
                  onOpenRace={onOpenRace}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          </section>
        </BlockErrorBoundary>
      )}

      {}
      {!loading && (filter === 'alla' || filter === 'artiklar') && visibleArticles.length > 0 && (
        <BlockErrorBoundary fallbackTitle="Tipsartiklarna saknas just nu">
          <section className="space-y-4" aria-labelledby="artiklar-rubrik">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 id="artiklar-rubrik" className="text-xl font-bold text-slate-950">
                Experternas analyser och rapporter
              </h2>
              <span className="text-sm font-medium text-slate-500">
                {visibleArticles.length} artiklar
              </span>
            </div>

            <div className="space-y-3">
              {visibleArticles.map((art) => (
                <AnalysArtikelKort
                  key={art.id}
                  article={art}
                  isRead={readTipIds.has(art.id)}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          </section>
        </BlockErrorBoundary>
      )}

      {}
      <div className="bg-slate-100 rounded-xl p-5 text-slate-700 text-sm sm:text-base leading-relaxed border border-slate-200">
        <p className="font-semibold text-slate-900 mb-1">Om tipsen på stallbacken</p>
        <p>
          Appen samlar in tips från oberoende källor för att ge en samlad bild av förutsättningarna.
          Alla tips anges med sin ursprungliga avsändare.
        </p>
      </div>
    </div>
  );
};
