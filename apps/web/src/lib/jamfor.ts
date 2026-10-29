// Hjälpfunktioner för jämförvyn ("Ställ dem mot varandra")
// Privat, icke-kommersiell användning. Allt på svenska.

import {
  HorseProfileResponse,
  HorsePastStart,
  TrackPositionStat,
} from '@stallbacken/shared';

/**
 * Parsar en kilometertid (t.ex. "1.12,3a", "1.14,2", "1.16,0g") till sekunder.
 * Returnerar null om formatet är ogiltigt eller saknas.
 */
export function parseKmTimeToSeconds(kmTime?: string | null): number | null {
  if (!kmTime) return null;
  const clean = kmTime.trim().toLowerCase().replace(/[a-z]/g, '');
  if (!clean || clean === '–') return null;

  // Stödjer format "1.12,3" eller "12,3"
  const parts = clean.split('.');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1].replace(',', '.'));
    if (isNaN(minutes) || isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  }

  // Om bara sekunder och tiondelar angavs, t.ex. "12,3" (underförstått 1 minut)
  const secondsOnly = parseFloat(clean.replace(',', '.'));
  if (isNaN(secondsOnly)) return null;
  return secondsOnly > 30 ? secondsOnly : 60 + secondsOnly;
}

/**
 * Hittar den bästa (snabbaste) kilometertiden ur sparade resultat och rekord.
 */
export function getBestKmTime(profile?: HorseProfileResponse | null): string | null {
  if (!profile) return null;

  let bestSeconds = Infinity;
  let bestTimeStr: string | null = null;

  // 1. Kontrollera officiella rekord
  const autoRecord = profile.horse?.records?.auto;
  const voltRecord = profile.horse?.records?.volt;

  if (autoRecord) {
    const sec = parseKmTimeToSeconds(autoRecord);
    if (sec && sec < bestSeconds) {
      bestSeconds = sec;
      bestTimeStr = autoRecord;
    }
  }

  if (voltRecord) {
    const sec = parseKmTimeToSeconds(voltRecord);
    if (sec && sec < bestSeconds) {
      bestSeconds = sec;
      bestTimeStr = voltRecord;
    }
  }

  // 2. Kontrollera tidigare lopp
  const starts = profile.pastStarts || [];
  for (const st of starts) {
    if (st.kmTime) {
      const sec = parseKmTimeToSeconds(st.kmTime);
      if (sec && sec < bestSeconds) {
        bestSeconds = sec;
        bestTimeStr = st.kmTime;
      }
    }
  }

  return bestTimeStr;
}

/**
 * Beräknar antal vilodagar mellan loppets tävlingsdag och hästens senaste start.
 */
export function calculateRestDays(
  raceDateStr?: string,
  lastStartDateStr?: string
): number | null {
  if (!raceDateStr || !lastStartDateStr) return null;

  try {
    const raceDate = new Date(raceDateStr.slice(0, 10));
    const lastDate = new Date(lastStartDateStr.slice(0, 10));

    if (isNaN(raceDate.getTime()) || isNaN(lastDate.getTime())) {
      return null;
    }

    const diffMs = raceDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  } catch {
    return null;
  }
}

/**
 * Formaterar vilodagar på svenska.
 */
export function formatRestDays(days: number | null): string {
  if (days === null || days === undefined) return '–';
  if (days === 0) return 'Startar idag';
  if (days === 1) return '1 dag';
  if (days < 60) return `${days} dagar`;

  const months = Math.floor(days / 30);
  return `${months} månader`;
}

/**
 * Formaterar de 5 senaste starternas placeringar (t.ex. "1 · 3 · d · 2 · 1").
 */
export function formatFormRecent(pastStarts?: HorsePastStart[] | null): string {
  if (!pastStarts || pastStarts.length === 0) return '–';

  const five = pastStarts.slice(0, 5);
  return five
    .map((s) => {
      const p = s.place?.trim();
      return p ? p : '–';
    })
    .join(' · ');
}

/**
 * Beräknar en poäng för de senaste 5 starterna för att diskret utse den i bäst form.
 * 1:a = 12p, 2:a = 8p, 3:a = 5p, 4:a = 3p, 5:a = 2p, övrig = 1p, galopp/disk = 0p.
 */
export function calculateFormScore(pastStarts?: HorsePastStart[] | null): number | null {
  if (!pastStarts || pastStarts.length === 0) return null;

  const five = pastStarts.slice(0, 5);
  let totalScore = 0;
  let count = 0;

  for (const s of five) {
    const p = s.place?.trim().toLowerCase();
    if (!p || p === '–') continue;
    count++;

    if (p === '1') totalScore += 12;
    else if (p === '2') totalScore += 8;
    else if (p === '3') totalScore += 5;
    else if (p === '4') totalScore += 3;
    else if (p === '5') totalScore += 2;
    else if (p === '0' || p === 'u') totalScore += 1;
    else if (p.includes('g') || p.includes('d')) totalScore += 0;
    else totalScore += 1;
  }

  return count > 0 ? totalScore : null;
}

/**
 * Formaterar spårets utfall: "33 % (2 av 6)" eller "–".
 */
export function formatTrackPositionStat(stat?: TrackPositionStat | null): string {
  if (!stat || stat.starts === 0) return '–';
  return `${stat.winPercent} % (${stat.wins} av ${stat.starts})`;
}

/**
 * Skobeskrivning på ren svenska med ikonnamn.
 */
export function getShoeDescription(
  shoesFront?: boolean,
  shoesBack?: boolean,
  shoesChanged?: boolean
): { text: string; changed: boolean } {
  const front = Boolean(shoesFront);
  const back = Boolean(shoesBack);

  let text = 'Skor runt om';
  if (shoesFront === undefined && shoesBack === undefined) {
    return { text: '–', changed: false };
  }

  if (!front && !back) {
    text = 'Barfota runt om';
  } else if (!front && back) {
    text = 'Barfota fram';
  } else if (front && !back) {
    text = 'Barfota bak';
  }

  return {
    text,
    changed: Boolean(shoesChanged),
  };
}

/**
 * Tar en lista med numeriska värden för hästarna på en rad och returnerar index
 * för de hästar som har det bästa värdet (stödjer delad förstaplats).
 * Saknade värden (null) markeras aldrig.
 */
export function getBestIndices(
  values: (number | null | undefined)[],
  direction: 'high' | 'low'
): Set<number> {
  const result = new Set<number>();

  const validEntries = values
    .map((val, idx) => ({ val, idx }))
    .filter((e): e is { val: number; idx: number } => e.val !== null && e.val !== undefined && !isNaN(e.val));

  if (validEntries.length === 0) {
    return result;
  }

  // Om alla har 0 eller alla har exakt samma värde, markera ingen som "bäst"
  const allEqual = validEntries.every((e) => e.val === validEntries[0].val);
  if (allEqual) {
    return result;
  }

  let targetVal = validEntries[0].val;
  for (const e of validEntries) {
    if (direction === 'high' && e.val > targetVal) {
      targetVal = e.val;
    } else if (direction === 'low' && e.val < targetVal) {
      targetVal = e.val;
    }
  }

  // Lägg till alla hästar som har detta målvärde
  for (const e of validEntries) {
    if (e.val === targetVal) {
      result.add(e.idx);
    }
  }

  return result;
}
