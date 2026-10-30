export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '–';
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} kr`;
}

export function formatKmTime(time?: string | null): string {
  if (!time || time.trim() === '') {
    return '–';
  }
  return time.replace(/\.(\d)([a-z]?)$/i, ',$1$2');
}

export function formatDistance(dist?: number | null): string {
  if (!dist || isNaN(dist)) {
    return '–';
  }
  const formatted = dist.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} m`;
}

export function formatStartMethod(method?: string | null): string {
  if (!method) return '–';
  const clean = method.toLowerCase().trim();
  if (clean.includes('volt')) return 'volt';
  if (clean.includes('auto')) return 'auto';
  return clean;
}

export interface ShoeFormatResult {
  code: string;
  label: string;
  changed: boolean;
}

export function formatShoeInfo(
  shoesFront?: boolean,
  shoesBack?: boolean,
  shoesChanged = false
): ShoeFormatResult {
  if (shoesFront === undefined && shoesBack === undefined) {
    return { code: '–', label: 'Skoinformation saknas', changed: false };
  }

  const frontCode = shoesFront === false ? 'C' : 'F';
  const backCode = shoesBack === false ? 'C' : 'F';
  const code = `${frontCode}/${backCode}`;

  let label = 'Skor runt om';
  if (frontCode === 'C' && backCode === 'C') {
    label = 'Barfota runt om';
  } else if (frontCode === 'C' && backCode === 'F') {
    label = 'Barfota fram';
  } else if (frontCode === 'F' && backCode === 'C') {
    label = 'Barfota bak';
  }

  return { code, label, changed: Boolean(shoesChanged) };
}

export function formatSulky(sulkyType?: string | null): string {
  if (!sulkyType || sulkyType.trim() === '') {
    return '–';
  }
  const lower = sulkyType.toLowerCase();
  if (lower.includes('amerikansk') || lower.includes('custom') || lower.includes('usa')) {
    return 'Amerikansk sulky';
  }
  return 'Vanlig vagn';
}

export function formatOdds(odds?: number | null): string {
  if (odds === undefined || odds === null || isNaN(odds) || odds <= 0) {
    return '–';
  }
  return odds.toFixed(1).replace('.', ',');
}

export function formatPercent(percent?: number | null): string {
  if (percent === undefined || percent === null || isNaN(percent) || percent < 0) {
    return '–';
  }
  return `${Math.round(percent)} %`;
}

export function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return '–';
  try {
    const months = [
      'jan',
      'feb',
      'mar',
      'apr',
      'maj',
      'jun',
      'jul',
      'aug',
      'sep',
      'okt',
      'nov',
      'dec',
    ];
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
        return `${day} ${months[monthIdx]}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${months[d.getMonth()]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
