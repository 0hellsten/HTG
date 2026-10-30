import React, { useState, useEffect } from 'react';
import { ApiResponse, StallTodayResponse, TodaysEntry } from '@stallbacken/shared';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';
import {
  FavoriteItem,
  getFavoriteHorses,
  removeFavoriteHorse,
  getFavoriteDrivers,
  removeFavoriteDriver,
  toggleFavoriteDriver,
  getFavoriteTrainers,
  removeFavoriteTrainer,
  toggleFavoriteTrainer,
  getFavoriteTracks,
  removeFavoriteTrack,
  toggleFavoriteTrack,
  getTotalFavoritesCount,
} from '../lib/favoriter';
import { apiFetch } from '../lib/api';
import { StallHorsesTab } from '../components/stall/StallHorsesTab';
import { StallPeopleTab } from '../components/stall/StallPeopleTab';
import { StallTracksTab } from '../components/stall/StallTracksTab';

type CategoryTab = 'hastar' | 'kuskar' | 'tranare' | 'banor';

interface StallScreenProps {
  onSelectHorse: (horseId: string) => void;
  onSelectTrack: (trackId: string) => void;
  onSelectRace: (raceId: string) => void;
  onGoToSearchHorses: () => void;
}

export const StallScreen: React.FC<StallScreenProps> = ({
  onSelectHorse,
  onSelectTrack,
  onSelectRace,
  onGoToSearchHorses,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('hastar');
  const [horses, setHorses] = useState<FavoriteItem[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [trainers, setTrainers] = useState<string[]>([]);
  const [tracks, setTracks] = useState<FavoriteItem[]>([]);
  const [todayData, setTodayData] = useState<StallTodayResponse | null>(null);

  const refreshFavorites = () => {
    setHorses(getFavoriteHorses());
    setDrivers(getFavoriteDrivers());
    setTrainers(getFavoriteTrainers());
    setTracks(getFavoriteTracks());
  };

  const fetchTodaysEntries = async () => {
    try {
      const json: ApiResponse<StallTodayResponse> =
        await apiFetch<StallTodayResponse>('/api/stall/anmalda-idag');
      if (json && json.data) {
        setTodayData(json.data);
      }
    } catch {}
  };

  useEffect(() => {
    refreshFavorites();
    fetchTodaysEntries();
  }, []);

  const getHorseTodayEntry = (horseId: string): TodaysEntry | undefined => {
    if (!todayData?.entries) return undefined;
    return todayData.entries.find((e) => e.horseId === horseId);
  };

  const getDriverTodayEntries = (driverName: string): TodaysEntry[] => {
    if (!todayData?.entries || !driverName) return [];
    const norm = driverName.trim().toLowerCase();
    return todayData.entries.filter(
      (e) => e.driverName && e.driverName.trim().toLowerCase() === norm
    );
  };

  const getTrainerTodayEntries = (trainerName: string): TodaysEntry[] => {
    if (!todayData?.entries || !trainerName) return [];
    const norm = trainerName.trim().toLowerCase();
    return todayData.entries.filter(
      (e) => e.trainerName && e.trainerName.trim().toLowerCase() === norm
    );
  };

  const isTrackRacingToday = (trackId: string): boolean => {
    if (!todayData?.trackIdsWithRaces) return false;
    return todayData.trackIdsWithRaces.includes(trackId);
  };

  const categories = [
    { id: 'hastar' as CategoryTab, label: 'Hästar', count: horses.length },
    { id: 'kuskar' as CategoryTab, label: 'Kuskar', count: drivers.length },
    { id: 'tranare' as CategoryTab, label: 'Tränare', count: trainers.length },
    { id: 'banor' as CategoryTab, label: 'Banor', count: tracks.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">Mitt stall</h1>
        <p className="text-slate-600 text-base mt-1">
          Dina sparade favoriter med information om vem som startar idag ({getTotalFavoritesCount()}{' '}
          totalt).
        </p>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        role="tablist"
        aria-label="Kategorier i Mitt stall"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(cat.id)}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                  isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      <BlockErrorBoundary fallbackTitle="Kunde inte visa favoriter">
        {activeCategory === 'hastar' && (
          <StallHorsesTab
            horses={horses}
            getHorseTodayEntry={getHorseTodayEntry}
            onSelectHorse={onSelectHorse}
            onSelectRace={onSelectRace}
            onRemoveFavoriteHorse={(id) => {
              removeFavoriteHorse(id);
              refreshFavorites();
            }}
            onGoToSearchHorses={onGoToSearchHorses}
          />
        )}

        {activeCategory === 'kuskar' && (
          <StallPeopleTab
            type="kusk"
            items={drivers}
            getEntries={getDriverTodayEntries}
            onSelectRace={onSelectRace}
            onRemoveItem={(name) => {
              removeFavoriteDriver(name);
              refreshFavorites();
            }}
            onAddItem={(name) => {
              toggleFavoriteDriver(name);
              refreshFavorites();
            }}
          />
        )}

        {activeCategory === 'tranare' && (
          <StallPeopleTab
            type="tranare"
            items={trainers}
            getEntries={getTrainerTodayEntries}
            onSelectRace={onSelectRace}
            onRemoveItem={(name) => {
              removeFavoriteTrainer(name);
              refreshFavorites();
            }}
            onAddItem={(name) => {
              toggleFavoriteTrainer(name);
              refreshFavorites();
            }}
          />
        )}

        {activeCategory === 'banor' && (
          <StallTracksTab
            tracks={tracks}
            isTrackRacingToday={isTrackRacingToday}
            onSelectTrack={onSelectTrack}
            onRemoveTrack={(id) => {
              removeFavoriteTrack(id);
              refreshFavorites();
            }}
            onToggleTrack={(id, name) => {
              toggleFavoriteTrack(id, name);
              refreshFavorites();
            }}
          />
        )}
      </BlockErrorBoundary>
    </div>
  );
};
