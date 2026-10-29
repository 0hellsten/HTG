import { SourceAdapter } from '@stallbacken/shared';
import { fakeSource } from './fake-source.js';
import { atgRacingInfoAdapter } from './atg-racinginfo.js';

export * from './fake-source.js';
export * from './atg-racinginfo.js';

/**
 * Register över samtliga aktiva källadaptrar i Stallbacken.
 * Nya källor registreras i denna lista.
 */
export const registeredAdapters: SourceAdapter<unknown>[] = [
  fakeSource,
  atgRacingInfoAdapter,
];

/**
 * Hämtar en specifik adapter baserat på dess ID.
 */
export function getAdapter(id: string): SourceAdapter<unknown> | undefined {
  return registeredAdapters.find((adapter) => adapter.id === id);
}
