import type { StatsDB } from "@/lib/stats-db-impl";
import type { EventPlaystyle, Playstyle, TopoutType } from "@/lib/enums";

export interface H2HMatchRow {
  matchId: number;
  matchWinnerId: number | null;
  matchTimestamp: string | null;
  eventShortName: string;
  eventRoundName: string;
  eventPlaystyle: EventPlaystyle;
  gameId: number | null;
  gameNumber: number | null;
  gameWinnerId: number | null;
  p1Score: number | null;
  p2Score: number | null;
  p1Playstyle: Playstyle | null;
  p2Playstyle: Playstyle | null;
  p1Topout: TopoutType | null;
  p2Topout: TopoutType | null;
}

export function h2hMatchHistory(
  db: StatsDB,
  p1: number,
  p2: number
): H2HMatchRow[] {
  return db.query<H2HMatchRow>(
    `SELECT
      m.match_id AS matchId,
      m.match_winner_player_id AS matchWinnerId,
      m.match_timestamp AS matchTimestamp,
      e.event_short_name AS eventShortName,
      er.event_round_name AS eventRoundName,
      ep.event_playstyle AS eventPlaystyle,
      g.game_id AS gameId,
      g.game_number AS gameNumber,
      g.game_winner_player_id AS gameWinnerId,
      gr1.score AS p1Score,
      gr2.score AS p2Score,
      ps1.playstyle AS p1Playstyle,
      ps2.playstyle AS p2Playstyle,
      tt1.topout_type AS p1Topout,
      tt2.topout_type AS p2Topout
    FROM match_results mr1
    JOIN match_results mr2 ON mr1.match_id = mr2.match_id
    JOIN matches m ON mr1.match_id = m.match_id
    JOIN event_rounds er ON m.event_round_id = er.event_round_id
    JOIN events e ON er.event_id = e.event_id
    JOIN event_playstyles ep ON e.event_playstyle_id = ep.event_playstyle_id
    LEFT JOIN games g ON m.match_id = g.match_id
    LEFT JOIN game_results gr1 ON g.game_id = gr1.game_id AND gr1.player_id = ${p1}
    LEFT JOIN game_results gr2 ON g.game_id = gr2.game_id AND gr2.player_id = ${p2}
    LEFT JOIN playstyles ps1 ON gr1.playstyle_id = ps1.playstyle_id
    LEFT JOIN playstyles ps2 ON gr2.playstyle_id = ps2.playstyle_id
    LEFT JOIN topout_types tt1 ON gr1.topout_type_id = tt1.topout_type_id
    LEFT JOIN topout_types tt2 ON gr2.topout_type_id = tt2.topout_type_id
    WHERE mr1.player_id = ${p1}
      AND mr2.player_id = ${p2}
    ORDER BY COALESCE(m.match_timestamp, '') DESC, m.match_id DESC, g.game_number`
  );
}
