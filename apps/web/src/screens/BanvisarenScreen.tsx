import React, { useEffect, useState } from 'react';
import { Compass, CloudSun, TrendingUp, MapPin, Clock, ArrowLeft, ChevronDown } from 'lucide-react';
import {
  ApiResponse,
  TrackProfile,
  TrackStats,
  TrackWeather,
  SourceStatus,
} from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { IdagSkelett } from '../components/SkelettKort';
import { HastsKoIkon } from '../components/HastsKoIkon';
import { isFavoriteTrack, toggleFavoriteTrack } from '../lib/favoriter';
import { apiFetch } from '../lib/api';
import { formatDistance } from '../lib/format';

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

  // Hämta alla banor vid start
  useEffect(() => {
    const fetchAllTracks = async () => {
      try {
        const json: ApiResponse<TrackProfile[]> = await apiFetch<TrackProfile[]>('/api/banor');
        if (json && json.data) {
          setTracks(json.data);
        }
      } catch {
        // Ignorera
      }
    };
    fetchAllTracks();
  }, []);

  // Hämta detaljer, statistik och väder för vald bana
  const fetchTrackData = async (trackId: string) => {
    setLoading(true);
    try {
      // 1. Banprofil
      const profJson: ApiResponse<TrackProfile> = await apiFetch<TrackProfile>(`/api/banor/${trackId}`);
      if (profJson && profJson.data) {
        setProfile(profJson.data);
      }

      // 2. Banstatistik
      const statsJson: ApiResponse<TrackStats> = await apiFetch<TrackStats>(`/api/banor/${trackId}/statistik`);
      if (statsJson && statsJson.data) {
        setStats(statsJson.data);
      }

      // 3. SMHI Väder
      fetchWeather(trackId);
    } catch {
      // Fel hanteras av gränssnittet
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
      const wJson: ApiResponse<TrackWeather | null> = await apiFetch<TrackWeather | null>(`/api/banor/${trackId}/vader${queryParam}`);

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

  const currentTrackName = profile?.name || 'Välj bana';
  const postStats =
    startMethodTab === 'auto' ? stats?.postStatsAuto || [] : stats?.postStatsVolt || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Tillbakaknapp om anropad som undersida */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 font-medium text-base py-2 px-1 -mx-1 rounded-lg transition-colors min-h-[44px] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span>Tillbaka</span>
        </button>
      )}

      {/* Rubrikrad med banväljare */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-amber-600 shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Banvisaren
            </h1>
          </div>
          <p className="text-base text-slate-600">
            Banfakta, vinstprocent per startspår och väder vid banan.
          </p>
        </div>

        {/* Dropdown för att välja bana och favoritknapp */}
        <div className="flex items-center gap-2">
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

      {/* Snabblänkar för populära banor */}
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
          {/* Banfakta och Väder i två kolumner på laptop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Grundfakta om banan */}
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

            {/* 2. Väder vid banan (SMHI) */}
            <BlockErrorBoundary fallbackTitle="Vädret går inte att hämta">
              <section
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3 flex flex-col justify-between"
                aria-labelledby="vader-rubrik"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CloudSun className="w-5 h-5 text-amber-600 shrink-0" />
                      <h2 id="vader-rubrik" className="text-lg font-bold text-slate-950">
                        Väder vid banan
                      </h2>
                    </div>
                    <FarskhetsPrick
                      status={weatherStatus}
                      explanation={weatherMessage}
                      onRetry={() => fetchWeather(selectedTrackId)}
                    />
                  </div>

                  {weatherStatus === 'failed' || !weather ? (
                    <div className="py-6 text-center text-slate-500 text-base">
                      Vädret går inte att hämta just nu.
                    </div>
                  ) : (
                    <div className="py-4 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl sm:text-4xl font-extrabold text-slate-950">
                          {weather.tempC > 0 ? `+${weather.tempC}` : weather.tempC} °C
                        </span>
                        <span className="text-base font-semibold text-slate-700">
                          {weather.description}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-600 pt-2 border-t border-slate-100">
                        <span>Vind: {weather.windMs} m/s</span>
                        {weather.precipMm > 0 ? (
                          <span>Nederbörd: {weather.precipMm} mm</span>
                        ) : (
                          <span>Uppehåll</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-xs text-slate-400 block pt-2 border-t border-slate-100">
                  Källa: SMHI
                </span>
              </section>
            </BlockErrorBoundary>
          </div>

          {/* 3. "Så brukar spåren gå" — Vinstprocent per startspår */}
          <BlockErrorBoundary fallbackTitle="Spårstatistik saknas">
            <section
              className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5"
              aria-labelledby="spar-rubrik"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 id="spar-rubrik" className="text-xl font-bold text-slate-950">
                    Så brukar spåren gå
                  </h2>
                  <p className="text-base text-slate-600 mt-0.5">
                    Vinstprocent per startspår på {currentTrackName}.
                  </p>
                </div>

                {/* Växlare för auto / volt */}
                <div className="inline-flex rounded-lg bg-slate-100 p-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setStartMethodTab('auto')}
                    className={`min-h-[44px] px-4 py-2 rounded-md text-base font-bold transition-all cursor-pointer ${
                      startMethodTab === 'auto'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    Autostart
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartMethodTab('volt')}
                    className={`min-h-[44px] px-4 py-2 rounded-md text-base font-bold transition-all cursor-pointer ${
                      startMethodTab === 'volt'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    Voltstart
                  </button>
                </div>
              </div>

              {/* Staplar / Rutnät för spårutfall */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {postStats.map((p) => {
                  const percent = p.winPercent !== null ? `${p.winPercent} %` : '–';
                  const isTop = (p.winPercent || 0) >= 15;
                  return (
                    <div
                      key={p.postPosition}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        isTop ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Spår {p.postPosition}
                        </span>
                        {isTop && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-200 text-amber-950 rounded">
                            Bäst
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-extrabold text-slate-950 mb-1">{percent}</div>
                      <div className="text-xs text-slate-500">
                        {p.starts > 0 ? `${p.wins} vinster / ${p.starts} lopp` : 'Inga starter'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Underlagskrav */}
              <div className="text-sm text-slate-500 italic pt-2 border-t border-slate-100">
                {stats?.isLowSample
                  ? 'För få lopp för att säga något säkert.'
                  : `Bygger på ${stats?.basedOnRaces || 0} lopp.`}
              </div>
            </section>
          </BlockErrorBoundary>

          {/* 4. "Leder man, vinner man?" & Vanliga vinnartider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ledarstatistik */}
            <BlockErrorBoundary fallbackTitle="Ledarstatistik saknas">
              <section
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
                aria-labelledby="ledare-rubrik"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
                  <h2 id="ledare-rubrik" className="text-xl font-bold text-slate-950">
                    Leder man, vinner man?
                  </h2>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-950">
                    {stats?.leaderWinPercent !== null ? `${stats?.leaderWinPercent} %` : '–'}
                  </div>
                  <p className="text-slate-700 text-base leading-relaxed">
                    av loppen på {currentTrackName} vinns av den häst som tar ledningen och leder
                    vid sista sväng.
                  </p>
                </div>

                <div className="text-sm text-slate-500 italic pt-2 border-t border-slate-100">
                  {stats?.isLowSample
                    ? 'För få lopp för att säga något säkert.'
                    : `Bygger på ${stats?.basedOnRaces || 0} lopp.`}
                </div>
              </section>
            </BlockErrorBoundary>

            {/* Vanliga vinnartider */}
            <BlockErrorBoundary fallbackTitle="Vinnartider saknas">
              <section
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
                aria-labelledby="tider-rubrik"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <h2 id="tider-rubrik" className="text-xl font-bold text-slate-950">
                    Vanliga vinnartider
                  </h2>
                </div>

                {stats?.commonWinningTimes && stats.commonWinningTimes.length > 0 ? (
                  <div className="space-y-2.5">
                    {stats.commonWinningTimes.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-base"
                      >
                        <span className="font-semibold text-slate-800">
                          {item.distanceM} m ({item.startMethod})
                        </span>
                        <span className="font-mono font-bold text-slate-950 text-lg">
                          {item.typicalTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-600 text-base">
                    {stats?.isLowSample
                      ? 'För få lopp för att beräkna vinnartider.'
                      : 'Inga vinnartider registrerade ännu.'}
                  </div>
                )}

                <div className="text-sm text-slate-500 italic pt-2 border-t border-slate-100">
                  {stats?.isLowSample
                    ? 'För få lopp för att säga något säkert.'
                    : `Bygger på ${stats?.basedOnRaces || 0} lopp.`}
                </div>
              </section>
            </BlockErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
};
