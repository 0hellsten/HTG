import { BongRaceDayData, BongRaceLeg, BongHorseInput } from '../types/bong.js';
import {
  DagensBastaOmgang,
  DagensBastaRace,
  DagensBastaHorse,
  DagensBastaHorseRole,
  RaceOpenness,
} from '../types/dagens-basta.js';
import { analyzeHorseProbabilities } from '../janne-boy/trav-expertis.js';
import { generateHorseReasons } from './motivering-generator.js';

export class DagensBastaEngine {
  /**
   * Analyserar en hel tävlingsomgång och tar fram de bästa hästarna lopp för lopp.
   */
  public analyzeOmgang(raceDay: BongRaceDayData): DagensBastaOmgang {
    const races: DagensBastaRace[] = raceDay.races.map((leg, idx) =>
      this.analyzeRaceLeg(leg, idx)
    );

    // Hitta omgångens starkaste spik och bästa skräll
    let topSpikCandidate: {
      raceNumber: number;
      horseName: string;
      startNumber: number;
      reason: string;
      score: number;
    } | null = null;

    let topSkrallCandidate: {
      raceNumber: number;
      horseName: string;
      startNumber: number;
      reason: string;
      score: number;
    } | null = null;

    for (const race of races) {
      const spikHorse = race.horses.find((h) => h.role === 'basta_chansen');
      if (spikHorse) {
        const bet = spikHorse.betDistribution;
        const odds = spikHorse.winOdds || 2.0;
        // Poäng baserat på stabilitet och vinstchans
        const score = (100 / Math.max(1.1, odds)) + bet;
        if (!topSpikCandidate || score > topSpikCandidate.score) {
          topSpikCandidate = {
            raceNumber: race.raceNumber,
            horseName: spikHorse.name,
            startNumber: spikHorse.startNumber,
            reason: `${spikHorse.summary} (Lopp ${race.raceNumber})`,
            score,
          };
        }
      }

      const skrallHorse = race.horses.find((h) => h.role === 'skrall');
      if (skrallHorse) {
        const odds = skrallHorse.winOdds || 15;
        const bet = skrallHorse.betDistribution;
        const valueScore = odds * (bet > 0 ? (15 / bet) : 1);
        if (!topSkrallCandidate || valueScore > topSkrallCandidate.score) {
          topSkrallCandidate = {
            raceNumber: race.raceNumber,
            horseName: skrallHorse.name,
            startNumber: skrallHorse.startNumber,
            reason: `${skrallHorse.name} (nr ${skrallHorse.startNumber}) i lopp ${race.raceNumber} – streckad till ${bet} %`,
            score: valueScore,
          };
        }
      }
    }

    const gameName = raceDay.gameType ? `${raceDay.gameType} ${raceDay.trackName || ''}`.trim() : 'Dagens lopp';

    return {
      id: `${raceDay.gameType || 'lopp'}-${raceDay.date || 'idag'}`,
      gameType: raceDay.gameType || 'Lopp',
      gameName,
      trackName: raceDay.trackName || 'Banan',
      date: raceDay.date || new Date().toISOString().slice(0, 10),
      startTime: raceDay.startTime || '15:00',
      races,
      topSpik: topSpikCandidate
        ? {
            raceNumber: topSpikCandidate.raceNumber,
            horseName: topSpikCandidate.horseName,
            startNumber: topSpikCandidate.startNumber,
            reason: topSpikCandidate.reason,
          }
        : undefined,
      topSkrall: topSkrallCandidate
        ? {
            raceNumber: topSkrallCandidate.raceNumber,
            horseName: topSkrallCandidate.horseName,
            startNumber: topSkrallCandidate.startNumber,
            reason: topSkrallCandidate.reason,
          }
        : undefined,
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Analyserar ett enskilt lopp och väljer ut de 2–3 främsta hästarna med motiveringar.
   */
  public analyzeRaceLeg(leg: BongRaceLeg, legIndex: number): DagensBastaRace {
    const availableHorses = leg.horses.filter((h) => !h.scratched);
    const sortedByProb = [...availableHorses].sort(
      (a, b) => (b.betDistribution || 0) - (a.betDistribution || 0)
    );

    const secondHorse = sortedByProb[1];

    // Beräkna analys för varje häst
    const scoredHorses = availableHorses.map((h) => {
      const analysis = analyzeHorseProbabilities(h, secondHorse, leg);
      return {
        horse: h,
        analysis,
      };
    });

    // Sortera efter vinstchans och spikscore
    scoredHorses.sort((a, b) => {
      const probDiff = b.analysis.impliedWinProb - a.analysis.impliedWinProb;
      if (Math.abs(probDiff) > 0.05) return probDiff;
      return b.analysis.spikScore - a.analysis.spikScore;
    });

    const bestScored = scoredHorses[0];
    const secondScored = scoredHorses[1];

    // Hitta bästa skräll: streckad <= 18%, inte samma som de två första
    const skrallCandidates = scoredHorses
      .filter((item) => {
        if (item === bestScored || item === secondScored) return false;
        const betDist = item.horse.betDistribution || 0.05;
        return betDist <= 0.18;
      })
      .sort((a, b) => b.analysis.skrallScore - a.analysis.skrallScore);

    const bestSkrall = skrallCandidates[0] || (scoredHorses[2] !== undefined ? scoredHorses[2] : null);

    // Bestäm öppenhet
    let openness: RaceOpenness = 'oppet';
    let opennessLabel = 'Vidöppet lopp';
    let shortAnalysis = 'Öppet lopp där flera hästar har chans om det klaffar.';

    if (bestScored) {
      const bestProb = bestScored.analysis.impliedWinProb;
      const secondProb = secondScored ? secondScored.analysis.impliedWinProb : 0;
      const leadMargin = bestProb - secondProb;

      if (bestProb >= 0.45 || leadMargin >= 0.20) {
        openness = 'tydlig_favorit';
        opennessLabel = 'Stark favorit';
        shortAnalysis = `${bestScored.horse.name || `Nummer ${bestScored.horse.startNumber}`} har loppets överlägset bästa chans och är en stark grundpelare.`;
      } else if (secondScored && bestProb >= 0.28 && secondProb >= 0.22 && leadMargin < 0.10) {
        openness = 'tvaspanslopp';
        opennessLabel = 'Tvåhästarslås';
        shortAnalysis = `Två hästar höjer sig över mängden: ${bestScored.horse.name || 'favoriten'} och ${secondScored.horse.name || 'utmanaren'}.`;
      } else {
        openness = 'oppet';
        opennessLabel = 'Öppet lopp';
        shortAnalysis = `Jämnt och öppet lopp med flera heta bud. Se upp för skrällkandidaten bakom favoriterna.`;
      }
    }

    // Bygg hästobjekt med motiveringar
    const resultHorses: DagensBastaHorse[] = [];

    if (bestScored) {
      resultHorses.push(
        this.formatDagensBastaHorse(
          bestScored.horse,
          leg,
          'basta_chansen',
          'Bästa chansen',
          bestScored.analysis.impliedWinProb,
          bestScored.analysis.valueRatio
        )
      );
    }

    if (secondScored) {
      resultHorses.push(
        this.formatDagensBastaHorse(
          secondScored.horse,
          leg,
          'motbud',
          'Tidigaste utmanaren',
          secondScored.analysis.impliedWinProb,
          secondScored.analysis.valueRatio
        )
      );
    }

    if (bestSkrall && bestSkrall !== secondScored) {
      const isTrueSkrall = (bestSkrall.horse.betDistribution || 0.05) <= 0.18;
      resultHorses.push(
        this.formatDagensBastaHorse(
          bestSkrall.horse,
          leg,
          isTrueSkrall ? 'skrall' : 'motbud',
          isTrueSkrall ? 'Skrällkandidat' : 'Tredjebud',
          bestSkrall.analysis.impliedWinProb,
          bestSkrall.analysis.valueRatio
        )
      );
    }

    return {
      legIndex,
      raceNumber: leg.raceNumber || legIndex + 1,
      raceName: leg.raceName,
      trackName: leg.trackName || 'Banan',
      startTime: leg.startTime || '15:00',
      distance: leg.distance || 2140,
      startMethod: leg.startMethod || 'auto',
      openness,
      opennessLabel,
      shortAnalysis,
      horses: resultHorses,
      totalHorsesCount: leg.horses.length,
    };
  }

  private formatDagensBastaHorse(
    horse: BongHorseInput,
    leg: BongRaceLeg,
    role: DagensBastaHorseRole,
    roleLabel: string,
    impliedWinProb: number,
    valueRatio: number
  ): DagensBastaHorse {
    const { reasons, summary } = generateHorseReasons(
      horse,
      leg,
      role,
      impliedWinProb,
      valueRatio
    );

    let shoesText = 'Skor runt om';
    if (horse.shoeFront === false && horse.shoeBack === false) {
      shoesText = 'Barfota runt om';
    } else if (horse.shoeFront === false) {
      shoesText = 'Barfota fram';
    } else if (horse.shoeBack === false) {
      shoesText = 'Barfota bak';
    }

    const sulkyText =
      horse.sulkyType === 'american'
        ? 'Amerikansk sulky'
        : horse.sulkyType === 'regular'
        ? 'Vanlig sulky'
        : undefined;

    return {
      id: horse.id,
      startNumber: horse.startNumber,
      name: horse.name || `Häst nr ${horse.startNumber}`,
      driverName: horse.driverName,
      trainerName: horse.trainerName,
      role,
      roleLabel,
      reasons,
      summary,
      winOdds: horse.winOdds,
      betDistribution: Math.round((horse.betDistribution || 0.05) * 100),
      postPosition: horse.postPosition || horse.startNumber,
      distance: leg.distance,
      shoes: shoesText,
      shoeChanged: horse.shoeChanged,
      sulky: sulkyText,
      record: horse.record,
      earnings: horse.earningsTotal,
      driverWinPercentage: horse.driverWinPercentage,
      scratched: horse.scratched,
    };
  }
}
