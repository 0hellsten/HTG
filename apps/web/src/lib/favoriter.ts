// Hantering av favoriter i Stallbacken (banor, hästar, kuskar)
// Sparas lokalt i webbläsaren med fallback

const FAVORITE_TRACKS_KEY = 'stallbacken_fav_tracks';
const FAVORITE_HORSES_KEY = 'stallbacken_fav_horses';

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

/**
 * Hämtar alla sparade favoritbanor som en array av ban-id:n.
 */
export function getFavoriteTrackIds(): string[] {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(FAVORITE_TRACKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Undersöker om en bana är favoritmarkerad.
 */
export function isFavoriteTrack(trackId: string): boolean {
  const favs = getFavoriteTrackIds();
  return favs.includes(trackId);
}

/**
 * Växlar favoritstatus för en bana och returnerar det nya värdet.
 */
export function toggleFavoriteTrack(trackId: string): boolean {
  try {
    const storage = getStorage();
    const favs = getFavoriteTrackIds();
    const index = favs.indexOf(trackId);
    let updated: string[];

    if (index >= 0) {
      updated = favs.filter((id) => id !== trackId);
    } else {
      updated = [...favs, trackId];
    }

    if (storage) {
      storage.setItem(FAVORITE_TRACKS_KEY, JSON.stringify(updated));
    }
    return index < 0;
  } catch {
    return false;
  }
}

/**
 * Hämtar alla sparade favorithästar som en array av häst-id:n.
 */
export function getFavoriteHorseIds(): string[] {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(FAVORITE_HORSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Undersöker om en häst är favoritmarkerad.
 */
export function isFavoriteHorse(horseId: string): boolean {
  const favs = getFavoriteHorseIds();
  return favs.includes(horseId);
}

/**
 * Växlar favoritstatus för en häst och returnerar det nya värdet.
 */
export function toggleFavoriteHorse(horseId: string): boolean {
  try {
    const storage = getStorage();
    const favs = getFavoriteHorseIds();
    const index = favs.indexOf(horseId);
    let updated: string[];

    if (index >= 0) {
      updated = favs.filter((id) => id !== horseId);
    } else {
      updated = [...favs, horseId];
    }

    if (storage) {
      storage.setItem(FAVORITE_HORSES_KEY, JSON.stringify(updated));
    }
    return index < 0;
  } catch {
    return false;
  }
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
