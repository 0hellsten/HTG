import React, { useEffect, useState } from 'react';
import { Compass, MapPin, ArrowLeft, ChevronDown } from 'lucide-react';
import {
  ApiResponse,
  TrackProfile,
  TrackStats,
  TrackWeather,
  SourceStatus,
} from '@stallbacken/shared';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { IdagSkelett } from '../components/SkelettKort';
import { HastsKoIkon } from '../components/HastsKoIkon';
import { isFavoriteTrack, toggleFavoriteTrack } from '../lib/favoriter';
import { apiFetch } from '../lib/api';
import { formatDistance } from '../lib/format';
import { TrackWeatherCard } from '../components/banor/TrackWeatherCard';
import { TrackPostStatsCard } from '../components/banor/TrackPostStatsCard';
import { TrackLeaderCard } from '../components/banor/TrackLeaderCard';

interface BanvisarenScreenProps {
  initialTrackId?: string;
  onBack?: () => void;
}

export const BanvisarenScreen: React.FC<BanvisarenScreenProps> = ({
  initialTrackId = '1',
  onBack,
}) => {
  const [tracks, setTracks] = useState<TrackProfile[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(initialTrackId);
  const [profile, setProfile] = useState<TrackProfile | null>(null);
  const [stats, setStats] = useState<TrackStats | null>(null);
  const [weather, setWeather] = useState<TrackWeather | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<SourceStatus>('ok');
  const [weatherMessage, setWeatherMessage] = useState<string>('Färskt väder från SMHI.');
  const [loading, setLoading] = useState<boolean>(true);
  const [startMethodTab, setStartMethodTab] = useState<'auto' | 'volt'>('auto');
  const [isFavTrack, setIsFavTrack] = useState<boolean>(() => isFavoriteTrack(initialTrackId));

  useEffect(() => {
    setIsFavTrack(isFavoriteTrack(selectedTrackId));
  }, [selectedTrackId]);

  useEffect(() => {
    const fetchAllTracks = async () => {
      try {
        const json: ApiResponse<TrackProfile[]> = await apiFetch<TrackProfile[]>('/api/banor');
        if (json && json.data) {
          setTracks(json.data);
        }
      } catch {}
    };
    fetchAllTracks();
  }, []);

  const fetchTrackData = async (trackId: string) => {
    setLoading(true);
    try {
      const profJson: ApiResponse<TrackProfile> = await apiFetch<TrackProfile>(
        `/api/banor/${trackId}`
      );
      if (profJson && profJson.data) {
        setProfile(profJson.data);
      }

      const statsJson: ApiResponse<TrackStats> = await apiFetch<TrackStats>(
        `/api/banor/${trackId}/statistik`
      );
      if (statsJson && statsJson.data) {
        setStats(statsJson.data);
      }

      fetchWeather(trackId);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (trackId: string) => {
    try {
      const isSimulateDown =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('simulateWeatherDown') === 'true';

      const queryParam = isSimulateDown ? '?simulateDown=true' : '';
      const wJson: ApiResponse<TrackWeather | null> = await apiFetch<TrackWeather | null>(
        `/api/banor/${trackId}/vader${queryParam}`
      );

      if (wJson && wJson.data && wJson.status !== 'failed') {
        setWeather(wJson.data);
        setWeatherStatus(wJson.status);
        setWeatherMessage(wJson.message);
      } else {
        setWeather(null);
        setWeatherStatus('failed');
        setWeatherMessage('Vädret går inte att hämta just nu.');
      }
    } catch {
      setWeather(null);
      setWeatherStatus('failed');
      setWeatherMessage('Vädret går inte att hämta just nu.');
    }
  };

  useEffect(() => {
    fetchTrackData(selectedTrackId);
  }, [selectedTrackId]);

  const handleTrackChange = (newTrackId: string) => {
    setSelectedTrackId(newTrackId);
  };

  const currentTrackName =
    tracks.find((t) => t.id === selectedTrackId)?.name || profile?.name || 'Banan';

  const postStats =
    startMethodTab === 'auto' ? stats?.postStatsAuto || [] : stats?.postStatsVolt || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-slate-600 hover:text-slate-950 mb-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tillbaka</span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight">Banvisaren</h1>
              <p className="text-slate-600 text-base mt-0.5">
                Bangeometri, upplopp, spårstatistik och väder.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const currentName =
                tracks.find((t) => t.id === selectedTrackId)?.name || profile?.name;
              const next = toggleFavoriteTrack(selectedTrackId, currentName);
              setIsFavTrack(next);
            }}
            className="min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            title={isFavTrack ? 'Ta bort banan från Mitt stall' : 'Spara banan i Mitt stall'}
            aria-label={isFavTrack ? 'Ta bort banan från Mitt stall' : 'Spara banan i Mitt stall'}
          >
            <HastsKoIkon
              filled={isFavTrack}
              className={`w-5 h-5 ${isFavTrack ? 'text-amber-500' : 'text-slate-400'}`}
            />
            <span className="hidden sm:inline">{isFavTrack ? 'I Mitt stall' : 'Mitt stall'}</span>
          </button>

          <div className="relative min-w-[200px]">
            <label htmlFor="bana-select" className="sr-only">
              Välj travbana
            </label>
            <select
              id="bana-select"
              value={selectedTrackId}
              onChange={(e) => handleTrackChange(e.target.value)}
              className="w-full min-h-[48px] pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['1', '6', '7', '8', '9', '12', '32'].map((id) => {
          const t = tracks.find((tr) => tr.id === id);
          if (!t) return null;
          const isActive = selectedTrackId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTrackChange(id)}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      {loading && <IdagSkelett />}

      {!loading && profile && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BlockErrorBoundary fallbackTitle="Banfakta saknas">
              <section
                className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
                aria-labelledby="banfakta-rubrik"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                  <h2 id="banfakta-rubrik" className="text-xl font-bold text-slate-950">
                    {profile.name} — Banfakta
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-base">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Banlängd
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatDistance(profile.lengthM)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Upploppslängd
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {profile.stretchM} m
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Underlag
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">{profile.surface}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Typ av bana
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {profile.covered ? 'Täckt bana' : 'Öppen bana'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Open stretch
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {profile.openStretchLanes > 0
                        ? `${profile.openStretchLanes} extra spår`
                        : 'Nej'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Vinklad vinge
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {profile.angledWing ? 'Ja (spår 7–8 framskjutna)' : 'Nej'}
                    </span>
                  </div>
                </div>
              </section>
            </BlockErrorBoundary>

            <TrackWeatherCard
              weather={weather}
              status={weatherStatus}
              message={weatherMessage}
              onRetry={() => fetchWeather(selectedTrackId)}
            />
          </div>

          <TrackPostStatsCard
            stats={stats}
            currentTrackName={currentTrackName}
            startMethodTab={startMethodTab}
            setStartMethodTab={setStartMethodTab}
            postStats={postStats}
          />

          <TrackLeaderCard stats={stats} currentTrackName={currentTrackName} />
        </div>
      )}
    </div>
  );
};
