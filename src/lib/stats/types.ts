import type { statsDb } from "@/lib/stats-db";

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
  evaluate(
    db: typeof statsDb,
    ctx: StatisticalContext
  ): NumericStatisticResult[];
}
