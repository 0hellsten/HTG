import { describe, it, expect } from 'vitest';
import {
  DagensBastaEngine,
  BongRaceDayData,
  BongHorseInput,
  generateHorseReasons,
} from '../src/index.js';

function createMockRaceDay(): BongRaceDayData {
  return {
    gameType: 'V75',
    trackName: 'Jägersro',
    date: '2026-10-31',
    turnover: 45000000,
    races: [
      {
        legIndex: 0,
        raceNumber: 5,
        raceName: 'Klass I, Försök 1',
        distance: 2140,
        startMethod: 'auto',
        horses: [
          {
            id: 'h1',
            startNumber: 2,
            postPosition: 2,
            name: 'Stallbackens Blixt',
            driverName: 'Örjan Kihlström',
            driverWinPercentage: 18,
            betDistribution: 0.42,
            winOdds: 2.1,
            shoeFront: false,
            shoeBack: false,
            shoeChanged: true,
            sulkyType: 'american',
            record: '1.11,8a',
            earningsTotal: 650000,
          },
          {
            id: 'h2',
            startNumber: 5,
            postPosition: 5,
            name: 'Vindsnabba Vivan',
            driverName: 'Björn Goop',
            driverWinPercentage: 15,
            betDistribution: 0.26,
            winOdds: 3.6,
            shoeFront: true,
            shoeBack: true,
            sulkyType: 'regular',
            record: '1.12,3a',
            earningsTotal: 480000,
          },
          {
            id: 'h3',
            startNumber: 9,
            postPosition: 9,
            name: 'Smygaren Stig',
            driverName: 'Carl Johan Jepson',
            driverWinPercentage: 13,
            betDistribution: 0.08,
            winOdds: 14.5,
            shoeFront: false,
            shoeBack: true,
            sulkyType: 'regular',
            record: '1.12,9a',
            earningsTotal: 310000,
          },
          {
            id: 'h4',
            startNumber: 8,
            postPosition: 8,
            name: 'Bakspårs Bror',
            driverName: 'Per Lennartsson',
            betDistribution: 0.04,
            winOdds: 28.0,
          },
        ],
      },
      {
        legIndex: 1,
        raceNumber: 6,
        raceName: 'Stolopp',
        distance: 2140,
        startMethod: 'volt',
        horses: [
          {
            id: 'h5',
            startNumber: 6,
            postPosition: 6,
            name: 'Springspårs Sally',
            driverName: 'Adrian Kolgjini',
            betDistribution: 0.35,
            winOdds: 2.8,
            shoeFront: false,
            shoeBack: false,
          },
          {
            id: 'h6',
            startNumber: 1,
            postPosition: 1,
            name: 'Innerspårs Ida',
            driverName: 'Erik Adielsson',
            betDistribution: 0.28,
            winOdds: 3.4,
          },
        ],
      },
    ],
  };
}

describe('DagensBastaEngine', () => {
  const engine = new DagensBastaEngine();
  const mockRaceDay = createMockRaceDay();

  it('analyserar en omgång och identifierar rätt antal lopp', () => {
    const res = engine.analyzeOmgang(mockRaceDay);
    expect(res.gameType).toBe('V75');
    expect(res.trackName).toBe('Jägersro');
    expect(res.races).toHaveLength(2);
    expect(res.topSpik).toBeDefined();
    expect(res.topSpik?.horseName).toBe('Stallbackens Blixt');
    expect(res.topSkrall).toBeDefined();
    expect(res.topSkrall?.horseName).toBe('Smygaren Stig');
  });

  it('väljer ut bästa chansen, motbud och skräll med korrekta roller', () => {
    const res = engine.analyzeOmgang(mockRaceDay);
    const race1 = res.races[0];

    expect(race1.horses).toHaveLength(3);
    const bastaChansen = race1.horses.find((h) => h.role === 'basta_chansen');
    const motbud = race1.horses.find((h) => h.role === 'motbud');
    const skrall = race1.horses.find((h) => h.role === 'skrall');

    expect(bastaChansen).toBeDefined();
    expect(bastaChansen?.name).toBe('Stallbackens Blixt');
    expect(bastaChansen?.roleLabel).toBe('Bästa chansen');

    expect(motbud).toBeDefined();
    expect(motbud?.name).toBe('Vindsnabba Vivan');

    expect(skrall).toBeDefined();
    expect(skrall?.name).toBe('Smygaren Stig');
    expect(skrall?.roleLabel).toBe('Skrällkandidat');
  });

  it('genererar konkreta travmotiveringar utan engelska eller tekniska ord', () => {
    const leg = mockRaceDay.races[0];
    const horse = leg.horses[0];
    const { reasons, summary } = generateHorseReasons(
      horse,
      leg,
      'basta_chansen',
      0.45,
      1.1
    );

    expect(reasons.length).toBeGreaterThanOrEqual(4);
    expect(summary).toBeTruthy();

    const allText = reasons.map((r) => r.text).join(' ') + ' ' + summary;

    // Kontrollera att förbjudna ord INTE förekommer
    const forbidden = ['api', 'fetch', 'json', 'endpoint', 'null', 'undefined', 'error'];
    for (const word of forbidden) {
      expect(allText.toLowerCase()).not.toContain(word);
    }

    // Kontrollera att relevanta travord finns
    expect(allText).toContain('spår 2');
    expect(allText).toContain('barfota runt om');
    expect(allText).toContain('amerikansk sulky');
  });

  it('känner igen voltstart och springspår korrekt', () => {
    const legVolt = mockRaceDay.races[1];
    const horseVolt = legVolt.horses[0];
    const { reasons } = generateHorseReasons(
      horseVolt,
      legVolt,
      'basta_chansen',
      0.35,
      1.0
    );

    const lageReason = reasons.find((r) => r.category === 'lage');
    expect(lageReason).toBeDefined();
    expect(lageReason?.text).toContain('Springspår');
    expect(lageReason?.text).toContain('voltstart');
  });
});
