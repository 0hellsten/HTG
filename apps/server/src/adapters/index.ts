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

const realAdapters: SourceAdapter<unknown>[] = [
  atgRacingInfoAdapter,
  atgOddsAdapter,
  smhiWeatherAdapter,
  tipsExpressenAdapter,
  tipsTravrondenAdapter,
  tipsAftonbladetAdapter,
  tipsSulkysportAdapter,
];

export const registeredAdapters: SourceAdapter<unknown>[] =
  process.env.USE_FIXTURES === 'true' || process.env.NODE_ENV === 'test'
    ? [fakeSource, ...realAdapters]
    : realAdapters;
