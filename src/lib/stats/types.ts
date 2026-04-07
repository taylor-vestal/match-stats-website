import type { StatsDB } from "@/lib/stats-db";

export interface StatisticalFilters {
  eventIds?: string[];
  startDate?: string; // ISO date
  endDate?: string;
  playstyle?: string;
  matchType?: string;
}

export interface StatisticalContext {
  filters?: StatisticalFilters;
  playerId?: number;
}

export interface NumericStatisticResult {
  value: number;
  playerId: string;
  toString(): string;
}

export interface NumericStatistic {
  id: string;
  name: string;
  description: string;
  evaluate(db: StatsDB, ctx: StatisticalContext): NumericStatisticResult[];
}

export interface MatchRow {
  match_id: number;
  match_timestamp: string;
  event_round_id: number;
}

export interface EventRow {
  event_id: number;
  event_short_name: string;
  event_playstyle_id: number;
}

export interface EventRoundRow {
  event_round_id: number;
  event_id: number;
  event_round_name: string;
}
