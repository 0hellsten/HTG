import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFavoriteTracks,
  getFavoriteTrackIds,
  isFavoriteTrack,
  toggleFavoriteTrack,
  removeFavoriteTrack,
  sortRaceDaysWithFavorites,
  getFavoriteHorses,
  getFavoriteHorseIds,
  isFavoriteHorse,
  toggleFavoriteHorse,
  removeFavoriteHorse,
  getFavoriteDrivers,
  isFavoriteDriver,
  toggleFavoriteDriver,
  removeFavoriteDriver,
  getFavoriteTrainers,
  isFavoriteTrainer,
  toggleFavoriteTrainer,
  removeFavoriteTrainer,
  getTotalFavoritesCount,
} from './favoriter';

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
    expect(getTotalFavoritesCount()).toBe(0);
  });

  it('kan lägga till och ta bort en favoritbana med namn', () => {
    const res1 = toggleFavoriteTrack('1', 'Solvalla');
    expect(res1).toBe(true);
    expect(isFavoriteTrack('1')).toBe(true);
    expect(getFavoriteTracks()).toEqual([{ id: '1', name: 'Solvalla' }]);

    const res2 = toggleFavoriteTrack('1');
    expect(res2).toBe(false);
    expect(isFavoriteTrack('1')).toBe(false);
    expect(getFavoriteTrackIds()).toEqual([]);

    toggleFavoriteTrack('1', 'Solvalla');
    removeFavoriteTrack('1');
    expect(isFavoriteTrack('1')).toBe(false);
  });

  it('sorterar favoritbanor överst i listan av tävlingsdagar', () => {
    const raceDays = [
      { id: '1', trackId: 'aby', trackName: 'Åby' },
      { id: '2', trackId: 'solvalla', trackName: 'Solvalla' },
      { id: '3', trackId: 'bergsaker', trackName: 'Bergsåker' },
    ];

    const sorted = sortRaceDaysWithFavorites(raceDays, ['solvalla']);
    expect(sorted.map((r) => r.trackId)).toEqual(['solvalla', 'aby', 'bergsaker']);
  });

  it('kan lägga till, kontrollera och ta bort favorithästar med namn', () => {
    expect(getFavoriteHorseIds()).toEqual([]);
    expect(isFavoriteHorse('783840')).toBe(false);

    const added = toggleFavoriteHorse('783840', 'San Moteur');
    expect(added).toBe(true);
    expect(isFavoriteHorse('783840')).toBe(true);
    expect(getFavoriteHorses()).toEqual([{ id: '783840', name: 'San Moteur' }]);

    removeFavoriteHorse('783840');
    expect(isFavoriteHorse('783840')).toBe(false);
    expect(getFavoriteHorses()).toEqual([]);
  });

  it('kan hantera kuskar och tränare som favoriter', () => {
    expect(getFavoriteDrivers()).toEqual([]);
    expect(isFavoriteDriver('Örjan Kihlström')).toBe(false);

    toggleFavoriteDriver('Örjan Kihlström');
    expect(isFavoriteDriver('örjan kihlström')).toBe(true);
    expect(getFavoriteDrivers()).toEqual(['Örjan Kihlström']);

    toggleFavoriteTrainer('Daniel Redén');
    expect(isFavoriteTrainer('daniel redén')).toBe(true);
    expect(getFavoriteTrainers()).toEqual(['Daniel Redén']);

    expect(getTotalFavoritesCount()).toBe(2);

    removeFavoriteDriver('Örjan Kihlström');
    expect(isFavoriteDriver('Örjan Kihlström')).toBe(false);

    removeFavoriteTrainer('Daniel Redén');
    expect(isFavoriteTrainer('Daniel Redén')).toBe(false);
    expect(getTotalFavoritesCount()).toBe(0);
  });
});
