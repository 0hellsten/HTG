import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/db/migrations.js';
import { SmhiWeatherAdapter, getSymbolDescription } from '../src/adapters/smhi-weather.js';

describe('SmhiWeatherAdapter', () => {
  let db: Database.Database;
  let adapter: SmhiWeatherAdapter;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
    adapter = new SmhiWeatherAdapter(db);
    adapter.setAllowFixtureFallback(true);
  });

  it('översätter symbolkoder till lugna svenska väderbeskrivningar', () => {
    expect(getSymbolDescription(1)).toBe('Klart');
    expect(getSymbolDescription(2)).toBe('Lätt molnighet');
    expect(getSymbolDescription(6)).toBe('Mulet');
    expect(getSymbolDescription(18)).toBe('Lätt regn');
  });

  it('hämtar väder med lokal fixtur som reserv och sparar i databasen', async () => {
    // Tvinga nätverksfel till ogiltig url för att aktivera reservfixtur
    adapter.setBaseUrl('http://127.0.0.1:59999/ogiltig');
    adapter.setFetchOptions({ maxRetries: 0, backoffDelays: [] });

    const result = await adapter.fetchWeatherForTrack('1');
    expect(result.status).toBe('ok');
    expect(result.data).toBeDefined();
    expect(result.data?.tempC).toBe(9.5);
    expect(result.data?.description).toBe('Lätt molnighet');

    // Kontrollera att vädret sparades i tabellen
    const saved = db.prepare('SELECT * FROM weather WHERE track_id = ?').get('1') as {
      temp_c: number;
      description: string;
    };
    expect(saved).toBeDefined();
    expect(saved.temp_c).toBe(9.5);
    expect(saved.description).toBe('Lätt molnighet');
  });

  it('kastar aldrig uppåt vid simulerat fel utan returnerar failed med lugn svensk text', async () => {
    adapter.setSimulatedFailure(true);

    const result = await adapter.fetchWeatherForTrack('1');
    expect(result.status).toBe('failed');
    expect(result.message).toBe('Vädret går inte att hämta just nu.');
  });
});
