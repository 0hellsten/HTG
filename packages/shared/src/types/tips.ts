export interface TipItem {
  id: string;
  raceId?: string;
  startId?: string;
  trackName?: string;
  provider: string;
  author?: string;
  title: string;
  summary?: string;
  rank?: number;
  horseNumber?: number;
  horseName?: string;
  publishedAt: string;
  sourceId: string;
  url?: string;
}

export interface RaceTipsData {
  raceId: string;
  tips: TipItem[];
  providers: Array<{
    id: string;
    name: string;
    status: 'ok' | 'stale' | 'degraded' | 'failed';
    message: string;
    fetchedAt: string;
  }>;
  aggregatedSummary?: string;
}

export interface TipsOverviewData {
  articles: TipItem[];
  raceTips: TipItem[];
  providers: Array<{
    id: string;
    name: string;
    status: 'ok' | 'stale' | 'degraded' | 'failed';
    message: string;
    fetchedAt: string;
  }>;
}
