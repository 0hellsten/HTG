import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { formatSwedishDate, formatSwedishTime } from '../lib/date';

const LAST_SYNC_KEY = 'stallbacken_last_sync';

export function saveLastSyncTime(date: Date = new Date()): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LAST_SYNC_KEY, date.toISOString());
    }
  } catch {
    // Ignorera
  }
}

export function getLastSyncTime(): Date | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LAST_SYNC_KEY);
      if (raw) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) return d;
      }
    }
  } catch {
    // Ignorera
  }
  return null;
}

export const OfflineRemsa: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlOffline =
      new URLSearchParams(window.location.search).get('simulateOffline') === 'true';
    return urlOffline || !navigator.onLine;
  });

  const [lastSyncDate, setLastSyncDate] = useState<Date>(() => {
    return getLastSyncTime() || new Date();
  });

  useEffect(() => {
    const handleOnline = () => {
      const urlOffline =
        new URLSearchParams(window.location.search).get('simulateOffline') === 'true';
      if (!urlOffline) setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      const saved = getLastSyncTime();
      if (saved) setLastSyncDate(saved);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial synk-tid
    const saved = getLastSyncTime();
    if (!saved) {
      saveLastSyncTime(new Date());
    } else {
      setLastSyncDate(saved);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  const dateStr = formatSwedishDate(lastSyncDate);
  const timeStr = formatSwedishTime(lastSyncDate);

  return (
    <div
      role="status"
      className="bg-amber-100 text-amber-950 px-4 py-2.5 text-center text-sm font-semibold border-b border-amber-300 flex items-center justify-center gap-2 shadow-sm"
    >
      <WifiOff className="w-4 h-4 shrink-0 text-amber-800" />
      <span>
        Du är inte uppkopplad. Det här hämtades {dateStr} {timeStr}.
      </span>
    </div>
  );
};
