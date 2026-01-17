import type { statsDb } from "../db/stats-db";
import type {
  NumericStatistic,
  NumericStatisticResult,
  StatisticalContext,
} from "./types";
import { buildWhere } from "./utils";

const matchWins: NumericStatistic = {
  id: "match_wins",
  name: "Match Wins",
  description: "Total number of matches won",

  evaluate(
    db: typeof statsDb,
    ctx: StatisticalContext
  ): NumericStatisticResult[] {
    const where = buildWhere(ctx, ["mr.player_id = m.match_winner_player_id"]);
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

const gameWins: NumericStatistic = {
  id: "game_wins",
  name: "Game Wins",
  description: "Total number of games won",

  evaluate(
    db: typeof statsDb,
    ctx: StatisticalContext
  ): NumericStatisticResult[] {
    const where = buildWhere(ctx, ["gr.player_id = g.game_winner_player_id"]);
    return db.evaluateQuery(`
      SELECT gr.player_id as player_id, COUNT(*) as value
      FROM game_results gr
      JOIN games g USING (game_id)
      ${where}
      GROUP BY gr.player_id
      ORDER BY value DESC
    `);
  },
};

const totalMatches: NumericStatistic = {
  id: "total_matches",
  name: "Total Matches",
  description: "Total number of matches played",

  evaluate(
    db: typeof statsDb,
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

export const offenseStats: NumericStatistic[] = [
  matchWins,
  gameWins,
  totalMatches,
];
