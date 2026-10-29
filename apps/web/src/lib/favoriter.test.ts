import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFavoriteTrackIds,
  isFavoriteTrack,
  toggleFavoriteTrack,
  sortRaceDaysWithFavorites,
  getFavoriteHorseIds,
  isFavoriteHorse,
  toggleFavoriteHorse,
} from './favoriter';

// Mock av localStorage för Node-miljö
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

describe('favoriter', () => {
  beforeEach(() => {
    const mock = new LocalStorageMock();
    (globalThis as unknown as { localStorage: LocalStorageMock }).localStorage = mock;
  });

  it('börjar med tom lista av favoriter', () => {
    expect(getFavoriteTrackIds()).toEqual([]);
    expect(isFavoriteTrack('solvalla')).toBe(false);
  });

  it('kan lägga till och ta bort en favoritbana', () => {
    const res1 = toggleFavoriteTrack('solvalla');
    expect(res1).toBe(true);
    expect(isFavoriteTrack('solvalla')).toBe(true);
    expect(getFavoriteTrackIds()).toEqual(['solvalla']);

    const res2 = toggleFavoriteTrack('solvalla');
    expect(res2).toBe(false);
    expect(isFavoriteTrack('solvalla')).toBe(false);
    expect(getFavoriteTrackIds()).toEqual([]);
  });

  it('sorterar favoritbanor överst i listan av tävlingsdagar', () => {
    const raceDays = [
      { id: '1', trackId: 'aby', trackName: 'Åby' },
      { id: '2', trackId: 'solvalla', trackName: 'Solvalla' },
      { id: '3', trackId: 'bergsaker', trackName: 'Bergsåker' },
    ];

    // Markera Solvalla som favorit
    const sorted = sortRaceDaysWithFavorites(raceDays, ['solvalla']);
    expect(sorted.map((r) => r.trackId)).toEqual(['solvalla', 'aby', 'bergsaker']);
  });

  it('kan lägga till och ta bort favorithästar', () => {
    expect(getFavoriteHorseIds()).toEqual([]);
    expect(isFavoriteHorse('783840')).toBe(false);

    const added = toggleFavoriteHorse('783840');
    expect(added).toBe(true);
    expect(isFavoriteHorse('783840')).toBe(true);
    expect(getFavoriteHorseIds()).toEqual(['783840']);

    const removed = toggleFavoriteHorse('783840');
    expect(removed).toBe(false);
    expect(isFavoriteHorse('783840')).toBe(false);
    expect(getFavoriteHorseIds()).toEqual([]);
  });
});
