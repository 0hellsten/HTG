import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Trash2, Search, MapPin, User, Compass } from 'lucide-react';
import { ApiResponse, StallTodayResponse, TodaysEntry } from '@stallbacken/shared';
import { HastsKoIkon } from '../components/HastsKoIkon';
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

  // Dagens anmälningar hämtade från backend
  const [todayData, setTodayData] = useState<StallTodayResponse | null>(null);

  // Snabb-tillägg av kusk/tränare manuellt
  const [manualName, setManualName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const refreshFavorites = () => {
    setHorses(getFavoriteHorses());
    setDrivers(getFavoriteDrivers());
    setTrainers(getFavoriteTrainers());
    setTracks(getFavoriteTracks());
  };

  const fetchTodaysEntries = async () => {
    try {
      const res = await fetch('/api/stall/anmalda-idag');
      const json: ApiResponse<StallTodayResponse> = await res.json();
      if (json && json.data) {
        setTodayData(json.data);
      }
    } catch {
      // Tyst hantering vid offline/fel
    }
  };

  useEffect(() => {
    refreshFavorites();
    fetchTodaysEntries();
  }, []);

  // Hitta om en häst är anmäld idag
  const getHorseTodayEntry = (horseId: string): TodaysEntry | undefined => {
    if (!todayData?.entries) return undefined;
    return todayData.entries.find((e) => e.horseId === horseId);
  };

  // Hitta lopp för en kusk idag
  const getDriverTodayEntries = (driverName: string): TodaysEntry[] => {
    if (!todayData?.entries || !driverName) return [];
    const norm = driverName.trim().toLowerCase();
    return todayData.entries.filter(
      (e) => e.driverName && e.driverName.trim().toLowerCase() === norm
    );
  };

  // Hitta lopp för en tränare idag
  const getTrainerTodayEntries = (trainerName: string): TodaysEntry[] => {
    if (!todayData?.entries || !trainerName) return [];
    const norm = trainerName.trim().toLowerCase();
    return todayData.entries.filter(
      (e) => e.trainerName && e.trainerName.trim().toLowerCase() === norm
    );
  };

  // Hitta om en bana kör lopp idag
  const isTrackRacingToday = (trackId: string): boolean => {
    if (!todayData?.trackIdsWithRaces) return false;
    return todayData.trackIdsWithRaces.includes(trackId);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualName.trim();
    if (!trimmed) return;

    if (activeCategory === 'kuskar') {
      toggleFavoriteDriver(trimmed);
    } else if (activeCategory === 'tranare') {
      toggleFavoriteTrainer(trimmed);
    }
    setManualName('');
    setShowAddForm(false);
    refreshFavorites();
  };

  const categories: { id: CategoryTab; label: string; count: number }[] = [
    { id: 'hastar', label: 'Hästar', count: horses.length },
    { id: 'kuskar', label: 'Kuskar', count: drivers.length },
    { id: 'tranare', label: 'Tränare', count: trainers.length },
    { id: 'banor', label: 'Banor', count: tracks.length },
  ];

  const totalCount = getTotalFavoritesCount();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Rubrik */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 flex items-center gap-3">
            <span>Mitt stall</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              {totalCount} sparade
            </span>
          </h1>
          <p className="text-base text-slate-600 mt-1">
            Dina sparade favoriter. Här ser du direkt när någon är anmäld till dagens lopp.
          </p>
        </div>
      </div>

      {/* Kategori-flikar */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
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
              onClick={() => {
                setActiveCategory(cat.id);
                setShowAddForm(false);
              }}
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

      {/* Innehåll per kategori */}
      <BlockErrorBoundary fallbackTitle="Kunde inte visa favoriter">
        {/* ==================================================== */}
        {/* HÄSTAR */}
        {/* ==================================================== */}
        {activeCategory === 'hastar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Sparade favorithästar
              </span>
              <button
                type="button"
                onClick={onGoToSearchHorses}
                className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Sök fler hästar</span>
              </button>
            </div>

            {horses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
                <HastsKoIkon filled={false} className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
                  Du har inte lagt till något än. Tryck på hästskon på en häst, kusk eller bana så
                  hamnar den här.
                </p>
                <button
                  type="button"
                  onClick={onGoToSearchHorses}
                  className="min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
                >
                  Sök upp en häst
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {horses.map((horse) => {
                  const todayEntry = getHorseTodayEntry(horse.id);
                  return (
                    <div
                      key={horse.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <HastsKoIkon filled className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectHorse(horse.id)}
                            className="text-lg sm:text-xl font-bold text-slate-950 hover:text-amber-700 transition-colors text-left focus:outline-none focus:underline"
                          >
                            {horse.name}
                          </button>

                          {todayEntry ? (
                            <div className="mt-1">
                              <button
                                type="button"
                                onClick={() => onSelectRace(todayEntry.raceId)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 text-sm font-bold hover:bg-emerald-100 transition-colors"
                              >
                                <span>
                                  Anmäld idag — {todayEntry.trackName} lopp {todayEntry.raceNumber}
                                  {todayEntry.formattedTime
                                    ? `, kl ${todayEntry.formattedTime}`
                                    : ''}
                                </span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 mt-0.5">Inga anmälda lopp idag</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            removeFavoriteHorse(horse.id);
                            refreshFavorites();
                          }}
                          className="min-h-[44px] px-3 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                          title="Ta bort från Mitt stall"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Ta bort</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectHorse(horse.id)}
                          className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm font-bold transition-colors"
                        >
                          Öppna häst
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* KUSKAR */}
        {/* ==================================================== */}
        {activeCategory === 'kuskar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Sparade favoritkuskar
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Lägg till kusk</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddManual} className="bg-slate-100 p-4 rounded-xl space-y-3">
                <label htmlFor="driver-input" className="block text-sm font-bold text-slate-900">
                  Kuskens namn:
                </label>
                <div className="flex gap-2">
                  <input
                    id="driver-input"
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="T.ex. Örjan Kihlström"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-base focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Spara
                  </button>
                </div>
              </form>
            )}

            {drivers.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
                <User className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
                  Du har inte lagt till något än. Tryck på hästskon på en häst, kusk eller bana så
                  hamnar den här.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
                >
                  Lägg till en favoritkusk
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {drivers.map((driverName) => {
                  const todayRaces = getDriverTodayEntries(driverName);
                  return (
                    <div
                      key={driverName}
                      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-amber-700" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-950">
                            {driverName}
                          </h2>

                          {todayRaces.length > 0 ? (
                            <div className="mt-1.5 space-y-1">
                              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                                Kör {todayRaces.length} lopp idag:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {todayRaces.map((entry) => (
                                  <button
                                    key={entry.raceId}
                                    type="button"
                                    onClick={() => onSelectRace(entry.raceId)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    <span>
                                      {entry.trackName} L{entry.raceNumber} ({entry.horseName})
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 mt-0.5">Inga anmälda lopp idag</p>
                          )}
                        </div>
                      </div>

                      <div className="self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            removeFavoriteDriver(driverName);
                            refreshFavorites();
                          }}
                          className="min-h-[44px] px-3 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                          title="Ta bort från Mitt stall"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Ta bort</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TRÄNARE */}
        {/* ==================================================== */}
        {activeCategory === 'tranare' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Sparade favorittränare
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="min-h-[44px] inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Lägg till tränare</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddManual} className="bg-slate-100 p-4 rounded-xl space-y-3">
                <label htmlFor="trainer-input" className="block text-sm font-bold text-slate-900">
                  Tränarens namn:
                </label>
                <div className="flex gap-2">
                  <input
                    id="trainer-input"
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="T.ex. Daniel Redén"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-base focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Spara
                  </button>
                </div>
              </form>
            )}

            {trainers.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
                <User className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
                  Du har inte lagt till något än. Tryck på hästskon på en häst, kusk eller bana så
                  hamnar den här.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
                >
                  Lägg till en favorittränare
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {trainers.map((trainerName) => {
                  const todayRaces = getTrainerTodayEntries(trainerName);
                  return (
                    <div
                      key={trainerName}
                      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-amber-700" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-950">
                            {trainerName}
                          </h2>

                          {todayRaces.length > 0 ? (
                            <div className="mt-1.5 space-y-1">
                              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                                Tränar {todayRaces.length} hästar som startar idag:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {todayRaces.map((entry) => (
                                  <button
                                    key={entry.raceId}
                                    type="button"
                                    onClick={() => onSelectRace(entry.raceId)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    <span>
                                      {entry.trackName} L{entry.raceNumber} ({entry.horseName})
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 mt-0.5">
                              Inga anmälda hästar idag
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            removeFavoriteTrainer(trainerName);
                            refreshFavorites();
                          }}
                          className="min-h-[44px] px-3 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                          title="Ta bort från Mitt stall"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Ta bort</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* BANOR */}
        {/* ==================================================== */}
        {activeCategory === 'banor' && (
          <div className="space-y-4">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider block">
              Sparade favoritbanor
            </span>

            {tracks.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
                  Du har inte lagt till något än. Tryck på hästskon på en häst, kusk eller bana så
                  hamnar den här.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {[
                    { id: '1', name: 'Solvalla' },
                    { id: '6', name: 'Åby' },
                    { id: '7', name: 'Jägersro' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        toggleFavoriteTrack(preset.id, preset.name);
                        refreshFavorites();
                      }}
                      className="min-h-[44px] px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-sm font-bold"
                    >
                      + Lägg till {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => {
                  const isRacing = isTrackRacingToday(track.id);
                  return (
                    <div
                      key={track.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6 text-amber-700" />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectTrack(track.id)}
                            className="text-lg sm:text-xl font-bold text-slate-950 hover:text-amber-700 transition-colors text-left focus:outline-none focus:underline"
                          >
                            {track.name}
                          </button>

                          {isRacing ? (
                            <p className="text-sm font-bold text-emerald-800 mt-0.5">
                              Kör tävlingar idag!
                            </p>
                          ) : (
                            <p className="text-sm text-slate-500 mt-0.5">Inga tävlingar idag</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            removeFavoriteTrack(track.id);
                            refreshFavorites();
                          }}
                          className="min-h-[44px] px-3 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                          title="Ta bort från Mitt stall"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Ta bort</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTrack(track.id)}
                          className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Compass className="w-4 h-4 text-slate-600" />
                          <span>Banvisaren</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </BlockErrorBoundary>
    </div>
  );
};
