import { SourceStatus } from './adapter.js';

export interface SourceHealthRecord {
  sourceId: string;
  label: string;
  status: SourceStatus;
  attemptedAt: string;
  succeededAt?: string;
  ageSeconds: number;
  message: string;
}

export interface HealthResponse {
  ok: boolean;
  version: string;
  time: string;
}
