import type { RankType } from "./constants";

export interface RankEntry {
  gameId: number;
  appId: string | null;
  name: string;
  publisher: string | null;
  category: string | null;
  iconUrl: string | null;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
  isNew: boolean;
  rankLabels: string[];
}

export interface RisingGame {
  gameId: number;
  appId: string | null;
  name: string;
  publisher: string | null;
  category: string | null;
  iconUrl: string | null;
  currentRank: number;
  previousRank: number | null;
  dailyChange: number;
  weeklyChange: number;
  consecutiveDaysUp: number;
  risingScore: number;
}

export interface GameTrendPoint {
  date: string;
  rank: number;
}

export interface DashboardStats {
  latestDate: string | null;
  previousDate: string | null;
  totalGames: number;
  snapshotCount: number;
  topRiser: RisingGame | null;
}

export interface ImportRankItem {
  rank: number;
  name: string;
  appId?: string;
  publisher?: string;
  category?: string;
  iconUrl?: string;
  rankLabels?: string[];
}

export interface ImportPayload {
  date: string;
  rankType: RankType;
  items: ImportRankItem[];
}

export interface FetchedRankItem extends ImportRankItem {
  rank: number;
  name: string;
}

export interface FetchResult {
  success: boolean;
  date: string;
  results: Array<{
    rankType: RankType;
    count: number;
    error?: string;
  }>;
  message: string;
}

export interface FetchLogEntry {
  id: number;
  status: string;
  message: string | null;
  itemCount: number | null;
  createdAt: string;
}

export interface HotWordItem {
  rank: number;
  name: string;
  isNew: boolean;
  isUp: boolean;
}

export interface HotSearchVisitItem {
  rank: number;
  appId: string;
  name: string;
  bannerUrl?: string;
  iconUrl?: string;
  description?: string;
}

export interface IpTrendItem {
  rank: number;
  id: number;
  name: string;
  description?: string;
  iconUrl?: string | null;
  wxIndex: number;
  wxIndexLabel: string;
  wxIndexChange: number;
  tags: string[];
  updatedAt?: string;
}
