// Delade typer för tips och expertrankingar
// Stallbacken — HTG

export interface TipItem {
  id: string;
  raceId?: string;
  startId?: string;
  trackName?: string;
  provider: string; // T.ex. "Tips från Expressen" eller "Tips från Travronden"
  author?: string; // T.ex. "Eskil Hellberg"
  title: string;
  summary?: string;
  rank?: number; // 1:a, 2:a, 3:a etc.
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
