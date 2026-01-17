import type { dbManager } from "../db/database";

export interface StatisticalFilters {
  eventIds?: string[];
  startDate?: string; // ISO date
  endDate?: string;
  playstyle?: string;
  matchType?: string;
}

export interface StatisticalContext {
  filters: StatisticalFilters;
  playerId?: string; // If set, evaluate for single player
}

export interface NumericStatisticResult {
  value: number;
  playerId: string;
  toString(): string;
}

export interface NumericStatistic {
  /** Unique identifier (e.g., "total_wins") */
  id: string;
  /** Display name (e.g., "Total Wins") */
  name: string;
  /** Description of what this stat measures */
  description: string;
  /** Evaluate this statistic and return results */
  evaluate(
    db: typeof dbManager,
    ctx: StatisticalContext
  ): NumericStatisticResult[];
}
