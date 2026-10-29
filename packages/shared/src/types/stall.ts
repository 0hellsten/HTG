// Typer för Mitt stall och anmälda favoriter
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

export interface TodaysEntry {
  horseId: string;
  horseName: string;
  driverName?: string;
  trainerName?: string;
  trackId: string;
  trackName: string;
  raceId: string;
  raceNumber: number;
  scheduledStart?: string;
  formattedTime?: string;
}

export interface StallTodayResponse {
  entries: TodaysEntry[];
  trackIdsWithRaces: string[];
}
