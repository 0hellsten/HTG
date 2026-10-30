import { HorseProfileResponse, TrackPositionStat } from '@stallbacken/shared';

export function parseKmTimeToSeconds(kmTime?: string | null): number | null {
  if (!kmTime) return null;
  const clean = kmTime.trim().toLowerCase().replace(/[a-z]/g, '');
  if (!clean || clean === '–') return null;

  const parts = clean.split('.');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1].replace(',', '.'));
    if (isNaN(minutes) || isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  }

  const secondsOnly = parseFloat(clean.replace(',', '.'));
  if (isNaN(secondsOnly)) return null;
  return secondsOnly > 30 ? secondsOnly : 60 + secondsOnly;
}

export function getBestKmTime(profile?: HorseProfileResponse | null): string | null {
  if (!profile) return null;

  let bestSeconds = Infinity;
  let bestTimeStr: string | null = null;

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

export function calculateRestDays(raceDateStr?: string, lastStartDateStr?: string): number | null {
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

export function formatRestDays(days: number | null): string {
  if (days === null || days === undefined) return '–';
  if (days === 0) return 'Startar idag';
  if (days === 1) return '1 dag';
  if (days < 60) return `${days} dagar`;

  const months = Math.floor(days / 30);
  return `${months} månader`;
}

export function formatFormRecent(pastStarts?: Array<{ place?: string }> | null): string {
  if (!pastStarts || pastStarts.length === 0) return '–';

  const five = pastStarts.slice(0, 5);
  return five
    .map((s) => {
      const p = s.place?.trim();
      return p ? p : '–';
    })
    .join(' · ');
}

export function calculateFormScore(pastStarts?: Array<{ place?: string }> | null): number | null {
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

export function formatTrackPositionStat(stat?: TrackPositionStat | null): string {
  if (!stat || stat.starts === 0) return '–';
  return `${stat.winPercent} % (${stat.wins} av ${stat.starts})`;
}

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

export function getBestIndices(
  values: (number | null | undefined)[],
  direction: 'high' | 'low'
): Set<number> {
  const result = new Set<number>();

  const validEntries = values
    .map((val, idx) => ({ val, idx }))
    .filter(
      (e): e is { val: number; idx: number } =>
        e.val !== null && e.val !== undefined && !isNaN(e.val)
    );

  if (validEntries.length === 0) {
    return result;
  }

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

  for (const e of validEntries) {
    if (e.val === targetVal) {
      result.add(e.idx);
    }
  }

  return result;
}
