import { SourceAdapter } from '@stallbacken/shared';
import { fakeSource } from './fake-source.js';
import { atgRacingInfoAdapter } from './atg-racinginfo.js';
import { atgOddsAdapter } from './atg-odds.js';
import { smhiWeatherAdapter } from './smhi-weather.js';
import { tipsExpressenAdapter } from './tips-expressen.js';
import { tipsTravrondenAdapter } from './tips-travronden.js';
import { tipsAftonbladetAdapter } from './tips-aftonbladet.js';
import { tipsSulkysportAdapter } from './tips-sulkysport.js';

export * from './fake-source.js';
export * from './atg-racinginfo.js';
export * from './atg-odds.js';
export * from './smhi-weather.js';
export * from './tips-expressen.js';
export * from './tips-travronden.js';
export * from './tips-aftonbladet.js';
export * from './tips-sulkysport.js';

/**
 * Register över samtliga aktiva källadaptrar i Stallbacken.
 * Nya källor registreras i denna lista.
 */
export const registeredAdapters: SourceAdapter<unknown>[] = [
  fakeSource,
  atgRacingInfoAdapter,
  atgOddsAdapter,
  smhiWeatherAdapter,
  tipsExpressenAdapter,
  tipsTravrondenAdapter,
  tipsAftonbladetAdapter,
  tipsSulkysportAdapter,
];

/**
 * Hämtar en specifik adapter baserat på dess ID.
 */
export function getAdapter(id: string): SourceAdapter<unknown> | undefined {
  return registeredAdapters.find((adapter) => adapter.id === id);
}
