import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ChevronRight,
  CloudSun,
  Compass,
  Trophy,
  Layers,
  Filter,
} from 'lucide-react';
import {
  RaceDay,
  Race,
  SourceStatus,
  ApiResponse,
  BongGameType,
  BongRaceDayData,
  DagensBastaEngine,
  DagensBastaOmgang,
} from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { IdagSkelett } from '../components/SkelettKort';
import { HastsKoIkon } from '../components/HastsKoIkon';
import { DagensBastaOmgangBanner } from '../components/dagens-basta/DagensBastaOmgangBanner';
import { DagensBastaLoppKort } from '../components/dagens-basta/DagensBastaLoppKort';
import {
  BongCompetition,
  formatCompetitionFromApi,
  buildFallbackBongRaceDay,
  getDefaultUpcomingCompetitions,
} from '../components/bong/competitions';
import {
  getFavoriteTrackIds,
  toggleFavoriteTrack,
  sortRaceDaysWithFavorites,
} from '../lib/favoriter';
import { formatSwedishDate, isEvening } from '../lib/date';
import { formatDistance, formatStartMethod } from '../lib/format';
import { saveLastSyncTime } from '../components/OfflineRemsa';
import { apiFetch } from '../lib/api';

interface IdagScreenProps {
  onOpenRace: (raceId: string, siblingRaces: Race[]) => void;
  onOpenTrack?: (trackId: string) => void;
  onSelectHorse?: (horseId: string) => void;
}

export const IdagScreen: React.FC<IdagScreenProps> = ({
  onOpenRace,
  onOpenTrack,
  onSelectHorse,
}) => {
  const [selectedOffset, setSelectedOffset] = useState<number>(0);
  const [activeViewMode, setActiveViewMode] = useState<'basta' | 'alla'>('basta');
  const [raceDays, setRaceDays] = useState<RaceDay[]>([]);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>([]);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState<string>('Allt är färskt och uppdaterat.');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRaceFilter, setSelectedRaceFilter] = useState<number | 'alla'>('alla');
  const [competitions, setCompetitions] = useState<BongCompetition[]>(() =>
    getDefaultUpcomingCompetitions()
  );

  // Beräkna måldatum
  const targetDate = useMemo(() => new Date(Date.now() + selectedOffset * 86400000), [selectedOffset]);
  const targetDateStr = useMemo(() => targetDate.toISOString().slice(0, 10), [targetDate]);

  // Omgångsdata för bästa hästarna
  const [raceDayData, setRaceDayData] = useState<BongRaceDayData>(() =>
    buildFallbackBongRaceDay('V75', new Date().toISOString().slice(0, 10), 'Solvalla')
  );

  const engine = useMemo(() => new DagensBastaEngine(), []);
  const dagensBastaOmgang: DagensBastaOmgang = useMemo(() => {
    return engine.analyzeOmgang(raceDayData);
  }, [engine, raceDayData]);

  // Hämtning av banor och lopp
  const fetchDagar = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        selectedOffset === 0 ? '/api/dagar/idag' : `/api/dagar?datum=${targetDateStr}`;
      const json: ApiResponse<RaceDay[]> = await apiFetch<RaceDay[]>(endpoint);
      if (json && json.data) {
        setRaceDays(json.data);
        setStatus(json.status);
        setStatusMessage(json.message);
        saveLastSyncTime(json.fetchedAt ? new Date(json.fetchedAt) : new Date());
      } else {
        setStatus('failed');
        setStatusMessage('Uppgifterna uppdateras inte just nu.');
      }
    } catch {
      setStatus('failed');
      setStatusMessage('Uppgifterna uppdateras inte just nu.');
    } finally {
      setLoading(false);
    }
  }, [selectedOffset, targetDateStr]);

  const loadLiveOmgang = useCallback(
    async (gameId: string, gameType: BongGameType, dateStr?: string, trackName?: string) => {
      try {
        const res = await apiFetch<BongRaceDayData>(`/api/omganger/${gameId}`);
        if (res && res.data) {
          setRaceDayData(res.data);
        } else {
          setRaceDayData(buildFallbackBongRaceDay(gameType, dateStr, trackName));
        }
      } catch {
        setRaceDayData(buildFallbackBongRaceDay(gameType, dateStr, trackName));
      }
    },
    []
  );

  // Ladda kommande omgångar en gång vid start
  useEffect(() => {
    let isSubscribed = true;

    async function loadUpcomingOmgangar() {
      try {
        const res = await apiFetch<
          Array<{
            id: string;
            gameType: BongGameType;
            gameName: string;
            date: string;
            trackName: string;
            startTime: string;
            turnover: number;
            jackpotPool: number;
          }>
        >('/api/omganger/kommande');

        if (!isSubscribed) return;

        if (res && res.data && res.data.length > 0) {
          setCompetitions(res.data.map(formatCompetitionFromApi));
        }
      } catch {
        // Fallback competitions redan satta
      }
    }

    loadUpcomingOmgangar();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Uppdatera omgång och lopp när valt datum (offset) eller competitions ändras
  useEffect(() => {
    setFavoriteTrackIds(getFavoriteTrackIds());
    setSelectedRaceFilter('alla');
    fetchDagar();

    // Hitta omgång för det valda datumet
    const matched =
      competitions.find((c) => c.dateIso === targetDateStr) ||
      competitions[selectedOffset] ||
      competitions[0];

    if (matched) {
      loadLiveOmgang(matched.id, matched.gameType, matched.dateIso, matched.trackName);
    }
  }, [selectedOffset, competitions, targetDateStr, fetchDagar, loadLiveOmgang]);

  const handleToggleFavorite = (trackId: string, trackName: string) => {
    toggleFavoriteTrack(trackId, trackName);
    setFavoriteTrackIds(getFavoriteTrackIds());
  };

  // Om raceDays är tom (t.ex. på GitHub Pages utan aktiv backend), använd omgångens loppdata så att sidan alltid fungerar!
  const effectiveRaceDays: RaceDay[] = useMemo(() => {
    if (raceDays.length > 0) return raceDays;
    if (raceDayData && raceDayData.races && raceDayData.races.length > 0) {
      return [
        {
          id: `raceday_${raceDayData.date || targetDateStr}_${raceDayData.trackName || 'solvalla'}`,
          date: raceDayData.date || targetDateStr,
          trackId: '1',
          trackName: raceDayData.trackName || 'Solvalla',
          biggestGame: raceDayData.gameType,
          firstStart: raceDayData.startTime || '16:20',
          racesCount: raceDayData.races.length,
          races: raceDayData.races.map((r, idx) => ({
            id: `race_${raceDayData.date || targetDateStr}_${r.raceNumber || idx + 1}`,
            raceDayId: `raceday_${raceDayData.date || targetDateStr}_${raceDayData.trackName || 'solvalla'}`,
            number: r.raceNumber || idx + 1,
            name: r.raceName ? `Avdelning ${idx + 1} (${r.raceName})` : `Lopp ${r.raceNumber || idx + 1}`,
            distanceM: r.distance || 2140,
            startMethod: (r.startMethod?.toLowerCase().includes('volt') ? 'volt' : 'auto') as 'auto' | 'volt',
            scheduledStart: r.startTime || '16:20',
            trackCondition: 'Lätt bana',
            trackName: raceDayData.trackName || 'Solvalla',
            status: 'kommande' as const,
          })),
        },
      ];
    }
    return [];
  }, [raceDays, raceDayData, targetDateStr]);

  const handleOpenRaceFromBasta = (raceNumber: number) => {
    for (const day of effectiveRaceDays) {
      const match = (day.races || []).find((r) => r.number === raceNumber);
      if (match) {
        onOpenRace(match.id, day.races || []);
        return;
      }
    }
    // Om specifikt lopp-ID inte hittades i raceDays, växla till alla lopp
    setActiveViewMode('alla');
  };

  const sortedRaceDays = sortRaceDaysWithFavorites(effectiveRaceDays, favoriteTrackIds);
  const heading =
    selectedOffset === 0
      ? (isEvening() ? 'Kvällens omgång' : 'Dagens omgång')
      : selectedOffset === 1
      ? 'Morgondagens omgång'
      : 'Kommande omgång';
  const displayDateFormatted = formatSwedishDate(targetDate);

  const dateOptions = [
    { offset: 0, label: 'Idag' },
    { offset: 1, label: 'Imorgon' },
    { offset: 2, label: 'I övermorgon' },
  ];

  const filteredBastaRaces = useMemo(() => {
    if (selectedRaceFilter === 'alla') {
      return dagensBastaOmgang.races;
    }
    return dagensBastaOmgang.races.filter((r) => r.raceNumber === selectedRaceFilter);
  }, [dagensBastaOmgang, selectedRaceFilter]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Sidhuvud & färskhetsprick */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {heading}
          </h1>
          <p className="text-base text-slate-600 mt-0.5 capitalize">{displayDateFormatted}</p>
        </div>
        <div className="pt-1">
          <FarskhetsPrick status={status} explanation={statusMessage} onRetry={fetchDagar} />
        </div>
      </div>

      {/* Datumväljare */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Välj tävlingsdag">
        {dateOptions.map((opt) => (
          <button
            key={opt.offset}
            type="button"
            role="tab"
            aria-selected={selectedOffset === opt.offset}
            onClick={() => setSelectedOffset(opt.offset)}
            className={`px-4 py-2 rounded-xl text-base font-bold min-h-[44px] cursor-pointer transition-colors shrink-0 ${
              selectedOffset === opt.offset
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Omgångens drag: Dagens spik & skräll i toppen */}
      {dagensBastaOmgang && (
        <BlockErrorBoundary fallbackTitle="Omgångens spik och skräll">
          <DagensBastaOmgangBanner
            omgang={dagensBastaOmgang}
            onScrollToRace={(raceNr) => {
              setActiveViewMode('basta');
              setSelectedRaceFilter(raceNr);
            }}
          />
        </BlockErrorBoundary>
      )}

      {/* Smart och enkel vyväxlare */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex gap-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveViewMode('basta')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] ${
            activeViewMode === 'basta'
              ? 'bg-white text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-5 h-5 text-amber-600" />
          <span>Bästa hästarna lopp för lopp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('alla')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] ${
            activeViewMode === 'alla'
              ? 'bg-white text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-5 h-5 text-slate-600" />
          <span>Alla lopp &amp; banor</span>
        </button>
      </div>

      {/* Läge 1: Bästa hästarna lopp för lopp */}
      {activeViewMode === 'basta' && (
        <div className="space-y-4">
          {/* Snabbväljare / Filter för lopp */}
          {dagensBastaOmgang.races.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                <Filter className="w-4 h-4" />
                <span>Välj lopp att titta på</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedRaceFilter === 'alla'}
                  onClick={() => setSelectedRaceFilter('alla')}
                  className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold min-h-[44px] cursor-pointer transition-colors shrink-0 ${
                    selectedRaceFilter === 'alla'
                      ? 'bg-slate-950 text-white'
                      : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Alla lopp ({dagensBastaOmgang.races.length})
                </button>

                {dagensBastaOmgang.races.map((r) => (
                  <button
                    key={r.raceNumber}
                    type="button"
                    role="tab"
                    aria-selected={selectedRaceFilter === r.raceNumber}
                    onClick={() => setSelectedRaceFilter(r.raceNumber)}
                    className={`px-3.5 py-2 rounded-xl text-sm sm:text-base font-bold min-h-[44px] cursor-pointer transition-colors shrink-0 ${
                      selectedRaceFilter === r.raceNumber
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Lopp {r.raceNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loppkorten */}
          <BlockErrorBoundary fallbackTitle="Bästa hästarna per lopp">
            <div className="space-y-6 pt-1">
              {filteredBastaRaces.map((race) => (
                <div key={race.raceNumber} id={`lopp-${race.raceNumber}`}>
                  <DagensBastaLoppKort
                    race={race}
                    onSelectHorse={onSelectHorse}
                    onOpenRace={handleOpenRaceFromBasta}
                  />
                </div>
              ))}
            </div>
          </BlockErrorBoundary>
        </div>
      )}

      {/* Läge 2: Alla lopp & banor */}
      {activeViewMode === 'alla' && (
        <div className="space-y-6">
          {loading && raceDays.length === 0 && effectiveRaceDays.length === 0 ? (
            <IdagSkelett />
          ) : sortedRaceDays.length > 0 ? (
            <div className="space-y-6">
              {sortedRaceDays.map((day) => (
                <BlockErrorBoundary key={day.id} fallbackTitle={`Bana ${day.trackName}`}>
                  <BanaKort
                    day={day}
                    isFavorite={favoriteTrackIds.includes(day.trackId)}
                    onToggleFavorite={() => handleToggleFavorite(day.trackId, day.trackName)}
                    onOpenRace={onOpenRace}
                    onOpenTrack={onOpenTrack}
                  />
                </BlockErrorBoundary>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-lg font-medium text-slate-800">
                Inga tävlingar hittades för det valda datumet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface BanaKortProps {
  day: RaceDay;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenRace: (raceId: string, siblingRaces: Race[]) => void;
  onOpenTrack?: (trackId: string) => void;
}

const BanaKort: React.FC<BanaKortProps> = ({
  day,
  isFavorite,
  onToggleFavorite,
  onOpenRace,
  onOpenTrack,
}) => {
  const races = day.races || [];
  const [weather, setWeather] = useState<{ tempC: number; description: string } | null>(null);

  useEffect(() => {
    apiFetch<{ tempC: number; description: string }>(`/api/banor/${day.trackId}/vader`)
      .then((j) => {
        if (j && j.data) {
          setWeather({ tempC: j.data.tempC, description: j.data.description });
        }
      })
      .catch(() => {});
  }, [day.trackId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">{day.trackName}</h2>
            {isFavorite && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                <HastsKoIkon className="w-3.5 h-3.5" filled />
                <span>Favoritbana</span>
              </span>
            )}
            {day.biggestGame && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider">
                {day.biggestGame}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
            <span>
              Första start kl. {day.firstStart || '–'} · {day.racesCount} lopp
            </span>
            {weather && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                  <CloudSun className="w-4 h-4 text-amber-600" />
                  <span>
                    {weather.tempC > 0 ? `+${weather.tempC}` : weather.tempC} °C,{' '}
                    {weather.description}
                  </span>
                </span>
              </>
            )}
          </p>
          {onOpenTrack && (
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => onOpenTrack(day.trackId)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-900 min-h-[44px] py-1 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Banvisaren för {day.trackName} &rarr;</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`p-2.5 rounded-lg border transition-colors cursor-pointer shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] ${
            isFavorite
              ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          aria-label={
            isFavorite
              ? `Ta bort ${day.trackName} från dina favoriter`
              : `Lägg till ${day.trackName} som favoritbana`
          }
        >
          <HastsKoIkon className="w-5 h-5" filled={isFavorite} />
        </button>
      </div>

      {races.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {races.map((race) => (
            <button
              key={race.id}
              onClick={() => onOpenRace(race.id, races)}
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/90 text-left transition-colors cursor-pointer group min-h-[44px]"
            >
              <div>
                <div className="font-bold text-base text-slate-900 group-hover:text-amber-800 transition-colors">
                  Lopp {race.number}
                  {race.scheduledStart && (
                    <span className="font-normal text-slate-500 text-sm ml-2">
                      kl. {race.scheduledStart.slice(11, 16)}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {formatDistance(race.distanceM)} · {formatStartMethod(race.startMethod)}
                  {race.name ? ` · ${race.name}` : ''}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm sm:text-base text-slate-500 italic">
          Lopplistan laddas upp inom kort.
        </p>
      )}
    </div>
  );
};
