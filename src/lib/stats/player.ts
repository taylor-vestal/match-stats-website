import type { StatsDB } from "@/lib/stats-db";
import type {
  NumericStatistic,
  NumericStatisticResult,
  StatisticalContext,
} from "@/lib/stats/types";
import { buildWhere } from "@/lib/stats/utils";

/**
 * Interpolated quantile on a pre-sorted array.
 * q=0.5 gives median, q=0.25 gives Q1, q=0.75 gives Q3.
 */
export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = q * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const frac = pos - lo;
  return sorted[lo] + frac * (sorted[hi] - sorted[lo]);
}

/**
 * Get the "fair" combined score arrays, grouped by player.
 *
 * 1. Fetch all game scores with topout type (Natural or Intentional)
 * 2. Per player: compute median of natural topout scores
 * 3. Filter intentional topout scores to those >= natural median
 * 4. Return map of player_id → combined sorted score array
 */
export function getFairScores(
  db: StatsDB,
  ctx: StatisticalContext
): Map<number, number[]> {
  const where = buildWhere(ctx, [
    "gr.score IS NOT NULL",
    "tt.topout_type IN ('Natural', 'Intentional')",
  ]);

  const rows = db.query<{
    player_id: number;
    score: number;
    topout_type: string;
  }>(`
    SELECT gr.player_id, gr.score, tt.topout_type
    FROM game_results gr
    JOIN games g USING (game_id)
    JOIN matches m ON g.match_id = m.match_id
    JOIN event_rounds er ON m.event_round_id = er.event_round_id
    JOIN events e ON er.event_id = e.event_id
    JOIN event_playstyles ep ON e.event_playstyle_id = ep.event_playstyle_id
    LEFT JOIN topout_types tt ON gr.topout_type_id = tt.topout_type_id
    ${where}
  `);

  const byPlayer = new Map<
    number,
    { natural: number[]; intentional: number[] }
  >();
  for (const row of rows) {
    let entry = byPlayer.get(row.player_id);
    if (!entry) {
      entry = { natural: [], intentional: [] };
      byPlayer.set(row.player_id, entry);
    }
    if (row.topout_type === "Natural") {
      entry.natural.push(row.score);
    } else {
      entry.intentional.push(row.score);
    }
  }

  const result = new Map<number, number[]>();
  for (const [playerId, { natural, intentional }] of byPlayer) {
    natural.sort((a, b) => a - b);
    if (natural.length === 0) continue;

    const medianNatural = quantile(natural, 0.5);
    const qualifying = intentional.filter((s) => s >= medianNatural);

    const combined = [...natural, ...qualifying];
    combined.sort((a, b) => a - b);
    result.set(playerId, combined);
  }

  return result;
}

function fairScoreStat(
  id: string,
  name: string,
  description: string,
  q: number
): NumericStatistic {
  return {
    id,
    name,
    description,
    evaluate(db: StatsDB, ctx: StatisticalContext): NumericStatisticResult[] {
      const allScores = getFairScores(db, ctx);
      const results: NumericStatisticResult[] = [];
      for (const [playerId, scores] of allScores) {
        const value = Math.round(quantile(scores, q));
        results.push({
          value,
          playerId: String(playerId),
          toString: () => value.toLocaleString(),
        });
      }
      return results.sort((a, b) => b.value - a.value);
    },
  };
}

export const FairMedianScore = fairScoreStat(
  "fair_median_score",
  "Fair Median Score",
  "Median score combining natural topouts with qualifying intentional topouts",
  0.5
);

export const HighRange = fairScoreStat(
  "high_range",
  "High Range",
  "Upper quartile of fair scores",
  0.75
);

export const LowRange = fairScoreStat(
  "low_range",
  "Low Range",
  "Lower quartile of fair scores",
  0.25
);

export const playerStats: NumericStatistic[] = [
  FairMedianScore,
  HighRange,
  LowRange,
];
