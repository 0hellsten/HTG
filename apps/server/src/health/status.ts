import { SourceStatus } from '@stallbacken/shared';

/**
 * Returnerar en vänlig svensk tidsangivelse för ålder.
 */
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

/**
 * Beräknar övergripande källstatus och lämpligt svenskt meddelande baserat på
 * hämtningsålder, källans tröskelvärden och kretsbrytarens läge.
 */
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

  // 1. Om kretsbrytaren är aktiv är statusen failed
  if (isPaused) {
    return {
      status: 'failed',
      message: 'Uppdateras inte just nu',
    };
  }

  // 2. Om källan explicit rapporterat failed
  if (reportedStatus === 'failed') {
    return {
      status: 'failed',
      message: customMessage || 'Uppdateras inte just nu',
    };
  }

  // 3. Om data är äldre än staleAfterSeconds betraktas den som failed
  if (ageSeconds > staleAfterSeconds) {
    return {
      status: 'failed',
      message: 'Uppdateras inte just nu',
    };
  }

  // 4. Om källan rapporterat degraded (t.ex. reservkälla eller partiellt format)
  if (reportedStatus === 'degraded') {
    return {
      status: 'degraded',
      message: customMessage || 'Delvis uppdaterat',
    };
  }

  // 5. Om data är äldre än ttlSeconds men yngre än staleAfterSeconds
  if (ageSeconds > ttlSeconds) {
    return {
      status: 'stale',
      message: `Uppdaterat för ${formatAgeSwedish(ageSeconds)} sedan`,
    };
  }

  // 6. Allt är färskt och i sin ordning
  return {
    status: 'ok',
    message: '',
  };
}
