import type { statsDb } from "@/lib/db/stats-db";

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
  playerId: number;
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
