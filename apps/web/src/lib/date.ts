const DAYS = ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export function formatSwedishDate(date: Date = new Date()): string {
  const dayName = DAYS[date.getDay()];
  const dayOfMonth = date.getDate();
  const monthName = MONTHS[date.getMonth()];
  return `${dayName} ${dayOfMonth} ${monthName}`;
}

export function formatSwedishTime(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function isEvening(date: Date = new Date()): boolean {
  return date.getHours() >= 16;
}
