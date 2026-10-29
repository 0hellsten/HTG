// Formaterings- och förklaringshjälpare för Janne Boy
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { JanneBoyStrategy, JanneBoyLegSuggestion } from '../types/janne-boy.js';
import { JANNE_QUOTES } from './constants.js';

export function calculateValueScore(legs: JanneBoyLegSuggestion[]): number {
  let totalPicks = 0;
  let valuePicks = 0;

  for (const leg of legs) {
    for (const h of leg.selectedHorses) {
      totalPicks++;
      if (h.isValueCandidate || (h.valueRatio && h.valueRatio >= 1.2)) valuePicks++;
    }
  }

  if (totalPicks === 0) return 50;
  const ratio = valuePicks / totalPicks;
  return Math.min(98, Math.max(45, Math.round(50 + ratio * 85)));
}

export function createOverallExplanation(
  strategy: JanneBoyStrategy,
  spikar: number,
  skrallar: number,
  rows: number,
  cost: number
): string {
  const spikText = spikar === 1 ? '1 spik' : `${spikar} spikar`;
  const skrallText = skrallar > 0 ? ` och ${skrallar} omsorgsfullt utvalda skrälldrag` : '';
  const costText = `${cost.toLocaleString('sv-SE')} kr (${rows} rader)`;

  switch (strategy) {
    case 'miljondrag':
      return `Jannes Miljondrag prioriterar matematiskt övervärde! Systemet innehåller ${spikText}${skrallText} för totalt ${costText}.`;
    case 'sakerhet':
      return `Jannes Säkerhet bygger på stabilitet och hög vinstchans med ${spikText} för ${costText}.`;
    case 'form':
      return `Stallbackens Form lyfter fram heta ekipage med dagsform och barfotafördel: ${spikText}${skrallText} för ${costText}.`;
    case 'balanserad':
    default:
      return `Balanserat systemförslag med ${spikText}${skrallText} för totalt ${costText}.`;
  }
}

export function pickQuote(strategy: JanneBoyStrategy): string {
  const quotes = JANNE_QUOTES[strategy] || JANNE_QUOTES.balanserad;
  const idx = Math.floor(Math.random() * quotes.length);
  return quotes[idx];
}
