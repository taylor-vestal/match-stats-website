import type { dbManager } from "../db/database";
import type {
  NumericStatistic,
  NumericStatisticResult,
  StatisticalContext,
} from "./types";
import { buildWhere } from "./utils";

const totalWins: NumericStatistic = {
  id: "total_wins",
  name: "Total Wins",
  description: "Total number of matches won",

  evaluate(
    db: typeof dbManager,
    ctx: StatisticalContext
  ): NumericStatisticResult[] {
    const where = buildWhere(ctx, ["mr.player_id = m.match_winner_id"]);
    return db.evaluateQuery(`
      SELECT mr.player_id as player_id, COUNT(*) as value
      FROM match_results mr
      JOIN matches m USING (match_id)
      ${where}
      GROUP BY mr.player_id
      ORDER BY value DESC
    `);
  },
};

const totalMatches: NumericStatistic = {
  id: "total_matches",
  name: "Total Matches",
  description: "Total number of matches played",

  evaluate(
    db: typeof dbManager,
    ctx: StatisticalContext
  ): NumericStatisticResult[] {
    const where = buildWhere(ctx);
    return db.evaluateQuery(`
      SELECT player_id, COUNT(*) as value
      FROM match_results mr
      JOIN matches m USING (match_id)
      ${where}
      GROUP BY player_id
      ORDER BY value DESC
    `);
  },
};

export const offenseStats: NumericStatistic[] = [totalWins, totalMatches];
