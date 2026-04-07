import type { StatsDB } from "@/lib/stats-db";
import type { EventPlaystyle, Playstyle } from "@/lib/enums";

export interface StatisticalFilters {
  eventIds?: string[];
  startDate?: string; // ISO date
  endDate?: string;
  playstyle?: Playstyle;
  eventPlaystyle?: EventPlaystyle;
  matchType?: string;
}

export interface StatisticalContext {
  filters?: StatisticalFilters;
  playerId?: number | number[];
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
