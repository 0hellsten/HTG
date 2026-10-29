import React, { useEffect, useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
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

interface IdagScreenProps {
  onOpenRace: (raceId: string, siblingRaces: Race[]) => void;
}

export const IdagScreen: React.FC<IdagScreenProps> = ({ onOpenRace }) => {
  const [raceDays, setRaceDays] = useState<RaceDay[]>([]);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>([]);
  const [status, setStatus] = useState<SourceStatus>('ok');
  const [statusMessage, setStatusMessage] = useState<string>('Allt är färskt och uppdaterat.');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchIdag = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dagar/idag');
      const json: ApiResponse<RaceDay[]> = await res.json();
      if (json && json.data) {
        setRaceDays(json.data);
        setStatus(json.status);
        setStatusMessage(json.message);
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
    fetchIdag();
  }, []);

  const handleToggleFavorite = (trackId: string) => {
    toggleFavoriteTrack(trackId);
    setFavoriteTrackIds(getFavoriteTrackIds());
  };

  const sortedRaceDays = sortRaceDaysWithFavorites(raceDays, favoriteTrackIds);
  const heading = isEvening() ? 'Kvällens omgång' : 'Dagens omgång';
  const todayFormatted = formatSwedishDate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Rubrikrad med datum och färskhetsprick */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {heading}
          </h1>
          <p className="text-base text-slate-600 mt-0.5 capitalize">
            {todayFormatted}
          </p>
        </div>
        <div className="pt-1">
          <FarskhetsPrick
            status={status}
            explanation={statusMessage}
            onRetry={fetchIdag}
          />
        </div>
      </div>

      {/* Skelettkort under laddning (aldrig en spinnande cirkel) */}
      {loading && <IdagSkelett />}

      {/* Tomt läge om inga tävlingar körs idag */}
      {!loading && sortedRaceDays.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Inga lopp idag
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Inga lopp idag. Nästa omgång visas här så snart anmälningslistorna är klara.
          </p>
        </div>
      )}

      {/* Kort per bana — var och en skyddad av sin egen felgräns */}
      {!loading && sortedRaceDays.length > 0 && (
        <div className="space-y-6">
          {sortedRaceDays.map((day) => {
            const isFavorite = favoriteTrackIds.includes(day.trackId);
            return (
              <BlockErrorBoundary
                key={day.id}
                fallbackTitle={`Uppgifterna för ${day.trackName} saknas just nu`}
                onRetry={fetchIdag}
              >
                <BanaKort
                  day={day}
                  isFavorite={isFavorite}
                  onToggleFavorite={() => handleToggleFavorite(day.trackId)}
                  onOpenRace={onOpenRace}
                />
              </BlockErrorBoundary>
            );
          })}
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
}

const BanaKort: React.FC<BanaKortProps> = ({
  day,
  isFavorite,
  onToggleFavorite,
  onOpenRace,
}) => {
  const races = day.races || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Banans toppinfo med namn, spelform, hästsko och tider */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              {day.trackName}
            </h2>
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
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Första start kl. {day.firstStart || '–'} · {day.racesCount} lopp
          </p>
        </div>

        {/* Hästsko-knapp för att spara eller ta bort från favoritbanor */}
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
          title={
            isFavorite
              ? 'Ta bort från dina favoriter'
              : 'Lägg till som favoritbana'
          }
        >
          <HastsKoIkon className="w-5 h-5" filled={isFavorite} />
        </button>
      </div>

      {/* Lista över lopp på banan */}
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
