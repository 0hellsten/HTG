// Hantering av favoriter i Stallbacken (banor, hästar, kuskar, tränare)
// Sparas lokalt i webbläsaren med fallback

const FAVORITE_TRACKS_KEY = 'stallbacken_fav_tracks';
const FAVORITE_HORSES_KEY = 'stallbacken_fav_horses';
const FAVORITE_DRIVERS_KEY = 'stallbacken_fav_drivers';
const FAVORITE_TRAINERS_KEY = 'stallbacken_fav_trainers';

export interface FavoriteItem {
  id: string;
  name: string;
}

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // Inget storage tillgängligt
  }
  return null;
}

function getJsonList<T>(key: string): T[] {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setJsonList<T>(key: string, list: T[]): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.setItem(key, JSON.stringify(list));
    }
  } catch {
    // Ignorera fel vid privat surfläge
  }
}

// ==========================================
// BANOR
// ==========================================

export function getFavoriteTracks(): FavoriteItem[] {
  const rawList = getJsonList<string | FavoriteItem>(FAVORITE_TRACKS_KEY);
  return rawList.map((item) => {
    if (typeof item === 'string') {
      return { id: item, name: item };
    }
    return item;
  });
}

export function getFavoriteTrackIds(): string[] {
  return getFavoriteTracks().map((t) => t.id);
}

export function isFavoriteTrack(trackId: string): boolean {
  return getFavoriteTrackIds().includes(trackId);
}

export function toggleFavoriteTrack(trackId: string, trackName?: string): boolean {
  const current = getFavoriteTracks();
  const index = current.findIndex((t) => t.id === trackId);
  let updated: FavoriteItem[];

  if (index >= 0) {
    updated = current.filter((t) => t.id !== trackId);
  } else {
    updated = [...current, { id: trackId, name: trackName || trackId }];
  }

  setJsonList(FAVORITE_TRACKS_KEY, updated);
  return index < 0;
}

export function removeFavoriteTrack(trackId: string): void {
  const current = getFavoriteTracks().filter((t) => t.id !== trackId);
  setJsonList(FAVORITE_TRACKS_KEY, current);
}

// ==========================================
// HÄSTAR
// ==========================================

export function getFavoriteHorses(): FavoriteItem[] {
  const rawList = getJsonList<string | FavoriteItem>(FAVORITE_HORSES_KEY);
  return rawList.map((item) => {
    if (typeof item === 'string') {
      return { id: item, name: item };
    }
    return item;
  });
}

export function getFavoriteHorseIds(): string[] {
  return getFavoriteHorses().map((h) => h.id);
}

export function isFavoriteHorse(horseId: string): boolean {
  return getFavoriteHorseIds().includes(horseId);
}

export function toggleFavoriteHorse(horseId: string, horseName?: string): boolean {
  const current = getFavoriteHorses();
  const index = current.findIndex((h) => h.id === horseId);
  let updated: FavoriteItem[];

  if (index >= 0) {
    updated = current.filter((h) => h.id !== horseId);
  } else {
    updated = [...current, { id: horseId, name: horseName || horseId }];
  }

  setJsonList(FAVORITE_HORSES_KEY, updated);
  return index < 0;
}

export function removeFavoriteHorse(horseId: string): void {
  const current = getFavoriteHorses().filter((h) => h.id !== horseId);
  setJsonList(FAVORITE_HORSES_KEY, current);
}

// ==========================================
// KUSKAR
// ==========================================

export function getFavoriteDrivers(): string[] {
  return getJsonList<string>(FAVORITE_DRIVERS_KEY);
}

export function isFavoriteDriver(driverName: string): boolean {
  if (!driverName) return false;
  const nameNorm = driverName.trim().toLowerCase();
  return getFavoriteDrivers().some((d) => d.trim().toLowerCase() === nameNorm);
}

export function toggleFavoriteDriver(driverName: string): boolean {
  if (!driverName) return false;
  const trimmed = driverName.trim();
  const current = getFavoriteDrivers();
  const exists = current.some((d) => d.trim().toLowerCase() === trimmed.toLowerCase());
  let updated: string[];

  if (exists) {
    updated = current.filter((d) => d.trim().toLowerCase() !== trimmed.toLowerCase());
  } else {
    updated = [...current, trimmed];
  }

  setJsonList(FAVORITE_DRIVERS_KEY, updated);
  return !exists;
}

export function removeFavoriteDriver(driverName: string): void {
  const trimmed = driverName.trim().toLowerCase();
  const current = getFavoriteDrivers().filter((d) => d.trim().toLowerCase() !== trimmed);
  setJsonList(FAVORITE_DRIVERS_KEY, current);
}

// ==========================================
// TRÄNARE
// ==========================================

export function getFavoriteTrainers(): string[] {
  return getJsonList<string>(FAVORITE_TRAINERS_KEY);
}

export function isFavoriteTrainer(trainerName: string): boolean {
  if (!trainerName) return false;
  const nameNorm = trainerName.trim().toLowerCase();
  return getFavoriteTrainers().some((t) => t.trim().toLowerCase() === nameNorm);
}

export function toggleFavoriteTrainer(trainerName: string): boolean {
  if (!trainerName) return false;
  const trimmed = trainerName.trim();
  const current = getFavoriteTrainers();
  const exists = current.some((t) => t.trim().toLowerCase() === trimmed.toLowerCase());
  let updated: string[];

  if (exists) {
    updated = current.filter((t) => t.trim().toLowerCase() !== trimmed.toLowerCase());
  } else {
    updated = [...current, trimmed];
  }

  setJsonList(FAVORITE_TRAINERS_KEY, updated);
  return !exists;
}

export function removeFavoriteTrainer(trainerName: string): void {
  const trimmed = trainerName.trim().toLowerCase();
  const current = getFavoriteTrainers().filter((t) => t.trim().toLowerCase() !== trimmed);
  setJsonList(FAVORITE_TRAINERS_KEY, current);
}

// ==========================================
// HJÄLPFUNKTIONER
// ==========================================

export function getTotalFavoritesCount(): number {
  return (
    getFavoriteTrackIds().length +
    getFavoriteHorseIds().length +
    getFavoriteDrivers().length +
    getFavoriteTrainers().length
  );
}

/**
 * Sorterar tävlingsdagar så att favoritbanor alltid placeras överst,
 * med bevarad inbördes ordning baserat på första starttid.
 */
export function sortRaceDaysWithFavorites<T extends { trackId: string }>(
  raceDays: T[],
  favoriteIds?: string[]
): T[] {
  const favSet = new Set(favoriteIds || getFavoriteTrackIds());

  return [...raceDays].sort((a, b) => {
    const aFav = favSet.has(a.trackId);
    const bFav = favSet.has(b.trackId);

    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });
}
