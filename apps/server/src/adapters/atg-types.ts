// Typdefinitioner för ATG-adapterns resultat
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { RaceDay, Race, Start } from '@stallbacken/shared';

export interface RacingDayData {
  raceDays: RaceDay[];
}

export interface RaceDetailData {
  race: Race;
  starts: Start[];
}
