import React, { useEffect, useState } from 'react';
import { ChevronRight, CloudSun, Compass } from 'lucide-react';
import { RaceDay, Race, SourceStatus, ApiResponse } from '@stallbacken/shared';
import { FarskhetsPrick } from '../components/FarskhetsPrick';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import { IdagSkelett } from '../components/SkelettKort';
import { HastsKoIkon } from '../components/HastsKoIkon';
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
}

export const IdagScreen: React.FC<IdagScreenProps> = ({ onOpenRace, onOpenTrack }) => {
  const [selectedOffset, setSelectedOffset] = useState<number>(0);
  const [raceDays, setRaceDays] = useState<RaceDay[]>([]);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>([]);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState<string>('Allt är färskt och uppdaterat.');
  const [loading, setLoading] = useState<boolean>(true);

  const targetDate = new Date(Date.now() + selectedOffset * 86400000);
  const targetDateStr = targetDate.toISOString().slice(0, 10);

  const fetchDagar = async () => {
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
  };

  useEffect(() => {
    setFavoriteTrackIds(getFavoriteTrackIds());
    fetchDagar();
  }, [selectedOffset]);

  const handleToggleFavorite = (trackId: string, trackName: string) => {
    toggleFavoriteTrack(trackId, trackName);
    setFavoriteTrackIds(getFavoriteTrackIds());
  };

  const sortedRaceDays = sortRaceDaysWithFavorites(raceDays, favoriteTrackIds);
  const heading =
    selectedOffset === 0 ? (isEvening() ? 'Kvällens omgång' : 'Dagens omgång') : 'Kommande omgång';
  const displayDateFormatted = formatSwedishDate(targetDate);

  const dateOptions = [
    { offset: 0, label: 'Idag' },
    { offset: 1, label: 'Imorgon' },
    { offset: 2, label: 'I övermorgon' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
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

      {loading ? (
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
