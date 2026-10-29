export type SourceStatus = 'ok' | 'stale' | 'degraded' | 'failed';

export interface SourceResult<T> {
  sourceId: string;
  status: SourceStatus;
  data: T | null;
  fetchedAt: string;
  ageSeconds: number;
  message: string;
  detail?: string;
}

export interface FetchContext {
  forceRefresh?: boolean;
  signal?: AbortSignal;
}

export interface SourceAdapter<T> {
  id: string;
  label: string;
  ttlSeconds: number;
  staleAfterSeconds: number;
  fetch(ctx?: FetchContext): Promise<SourceResult<T>>;
}
