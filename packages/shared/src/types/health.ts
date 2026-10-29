import { SourceStatus } from './adapter.js';

export interface SourceHealthRecord {
  sourceId: string;
  label: string;
  status: SourceStatus;
  attemptedAt: string;
  succeededAt?: string;
  ageSeconds: number;
  message: string;
  pausedUntil?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  status: SourceStatus;
  fetchedAt: string;
  message: string;
}

export interface HealthResponse {
  ok: boolean;
  version: string;
  time: string;
}
