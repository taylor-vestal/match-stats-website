import type { NumericStatistic } from "./types";
import { offenseStats } from "./offense";

export const allStats: NumericStatistic[] = [...offenseStats];

/** Get a stat by ID */
export function getStat(id: string): NumericStatistic | undefined {
  return allStats.find((s) => s.id === id);
}

// Re-export category arrays for selective imports
export { offenseStats };
