import { SourceStatus } from '@stallbacken/shared';

export function formatAgeSwedish(ageSeconds: number): string {
  if (ageSeconds < 60) {
    return 'mindre än en minut';
  }
  const minutes = Math.floor(ageSeconds / 60);
  if (minutes === 1) {
    return '1 minut';
  }
  if (minutes < 60) {
    return `${minutes} minuter`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours === 1) {
    return '1 timme';
  }
  return `${hours} timmar`;
}

export function resolveSourceStatus(params: {
  reportedStatus?: SourceStatus;
  ageSeconds: number;
  ttlSeconds: number;
  staleAfterSeconds: number;
  isPaused: boolean;
  customMessage?: string;
}): { status: SourceStatus; message: string } {
  const {
    reportedStatus = 'ok',
    ageSeconds,
    ttlSeconds,
    staleAfterSeconds,
    isPaused,
    customMessage,
  } = params;

  if (isPaused) {
    return {
      status: 'failed',
      message: 'Uppdateras inte just nu',
    };
  }

  if (reportedStatus === 'failed') {
    return {
      status: 'failed',
      message: customMessage || 'Uppdateras inte just nu',
    };
  }

  if (ageSeconds > staleAfterSeconds) {
    return {
      status: 'failed',
      message: 'Uppdateras inte just nu',
    };
  }

  if (reportedStatus === 'degraded') {
    return {
      status: 'degraded',
      message: customMessage || 'Delvis uppdaterat',
    };
  }

  if (ageSeconds > ttlSeconds) {
    return {
      status: 'stale',
      message: `Uppdaterat för ${formatAgeSwedish(ageSeconds)} sedan`,
    };
  }

  return {
    status: 'ok',
    message: '',
  };
}
