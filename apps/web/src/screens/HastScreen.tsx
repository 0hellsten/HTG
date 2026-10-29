import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { HorseProfileResponse, ApiResponse, SourceStatus } from '@stallbacken/shared';
import { HastOmBlock } from '../components/HastOmBlock';
import { FormBackspegelnBlock } from '../components/FormBackspegelnBlock';
import { RyggarLagenBlock } from '../components/RyggarLagenBlock';
import { TraningFormBlock } from '../components/TraningFormBlock';
import { HastsKoIkon } from '../components/HastsKoIkon';
import { LoppSkelett } from '../components/SkelettKort';
import { isFavoriteHorse, toggleFavoriteHorse } from '../lib/favoriter';

interface HastScreenProps {
  horseId: string;
  onBack: () => void;
}

export const HastScreen: React.FC<HastScreenProps> = ({ horseId, onBack }) => {
  const [profile, setProfile] = useState<HorseProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState('Allt är färskt och uppdaterat.');
  const [isFav, setIsFav] = useState(false);
  const [showAllStarts, setShowAllStarts] = useState(false);

  useEffect(() => {
    setIsFav(isFavoriteHorse(horseId));
  }, [horseId]);

  const fetchHorse = async (force = false) => {
    setLoading(true);
    try {
      const isSimulateDown =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('simulateHistoryDown') === 'true';

      const queryParams = new URLSearchParams();
      if (force) queryParams.set('refresh', 'true');
      if (isSimulateDown) queryParams.set('simulateDown', 'true');

      const url = `/api/hastar/${horseId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      const json: ApiResponse<HorseProfileResponse | null> = await res.json();

      if (json && json.data) {
        setProfile(json.data);
        setStatus(json.status);
        setStatusMessage(json.message);
      } else {
        setStatus('failed');
        setStatusMessage(
          json?.message || 'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.'
        );
      }
    } catch {
      setStatus('failed');
      setStatusMessage('Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorse();
  }, [horseId]);

  const handleFavoriteToggle = () => {
    const nextState = toggleFavoriteHorse(horseId);
    setIsFav(nextState);
  };

  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>
        <LoppSkelett />
      </div>
    );
  }

  const horse = profile?.horse;

  return (
    <div className="space-y-6">
      {/* Tillbakaknapp och rubrik */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200/60 transition-colors self-start"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>

        {horse && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className="min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors"
              title={isFav ? 'Ta bort från Mitt stall' : 'Lägg till i Mitt stall'}
            >
              <HastsKoIkon filled={isFav} className="w-5 h-5 text-amber-500" />
              <span>{isFav ? 'I Mitt stall' : 'Mitt stall'}</span>
            </button>
          </div>
        )}
      </div>

      {horse ? (
        <div className="space-y-6">
          {/* Header information om hästen */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {horse.name}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              <span>{[horse.sex, horse.age ? `${horse.age} år` : ''].filter(Boolean).join(' · ')}</span>
              {horse.trainerName && <span>Tränare: {horse.trainerName}</span>}
              {horse.homeTrack && <span>Bana: {horse.homeTrack}</span>}
            </p>
          </div>

          {/* Block 1: Om hästen */}
          <HastOmBlock
            horse={horse}
            status={status}
            statusMessage={statusMessage}
            onRetry={() => fetchHorse(true)}
          />

          {/* Block 2: Form i backspegeln */}
          <FormBackspegelnBlock
            starts={profile.pastStarts}
            status={status}
            statusMessage={statusMessage}
            onRetry={() => fetchHorse(true)}
          />

          {/* Block 3: Ryggar och lägen */}
          <RyggarLagenBlock
            stats={profile.positionStats}
            status={status}
            statusMessage={statusMessage}
            onRetry={() => fetchHorse(true)}
          />

          {/* Block 4: Hur går det i träningen? */}
          <TraningFormBlock
            trainingForm={profile.trainingForm}
            pastStarts={profile.pastStarts}
            qualifiers={profile.qualifiers}
            status={status}
            statusMessage={statusMessage}
            onRetry={() => fetchHorse(true)}
          />

          {/* Block 5: Alla starter (hopfällbart) */}
          {profile.allStarts.length > profile.pastStarts.length && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAllStarts(!showAllStarts)}
                className="w-full min-h-[48px] py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-base shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>{showAllStarts ? 'Dölj alla starter' : 'Visa alla starter'}</span>
                {showAllStarts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showAllStarts && (
                <FormBackspegelnBlock
                  starts={profile.allStarts}
                  status={status}
                  statusMessage={statusMessage}
                  title="Alla tidigare starter"
                  onRetry={() => fetchHorse(true)}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Hästen saknas
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Den här hästen kunde inte hittas i databasen.
          </p>
        </div>
      )}
    </div>
  );
};
