import type { NumericStatistic } from "@/lib/stats/types";
import { offenseStats } from "@/lib/stats/offense";
import { playerStats } from "@/lib/stats/player";

export const allStats: NumericStatistic[] = [...offenseStats, ...playerStats];

/** Get a stat by ID */
export function getStat(id: string): NumericStatistic | undefined {
  return allStats.find((s) => s.id === id);
}

// Re-export category arrays for selective imports
export { offenseStats, playerStats };
