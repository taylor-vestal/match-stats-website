import { statsDb } from "@/lib/stats-db";

export interface MatchResult {
  id: number;
  player_results: MatchResultForPlayer[];
  match_date: string;
  playstyle: string;
  event_short_name: string;
  round: string;
}

interface MatchResultForPlayer {
  player_id: number;
  player_name: string;
  score: number;
}

const cachedPlayerResults: Record<number, MatchResultForPlayer[]> = {};

export class Match {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  isUndefined(): boolean {
    const matchRow = statsDb().match(this.id);
    return !matchRow;
  }

  getMatchResult(): MatchResult | undefined {
    const matchRow = statsDb().match(this.id);
    if (!matchRow) return undefined;

    const eventRoundRow = statsDb().eventRound(matchRow.event_round_id);
    const eventRow = eventRoundRow
      ? statsDb().event(eventRoundRow?.event_id)
      : undefined;
    const playstyle = eventRow
      ? statsDb().eventPlaystyle(eventRow.event_playstyle_id)
      : "";

    return {
      id: this.id,
      player_results: this.getPlayerResults(),
      match_date: matchRow.match_timestamp,
      playstyle: playstyle || "",
      event_short_name: eventRow?.event_short_name || "",
      round: eventRoundRow?.event_round_name || "",
    };
  }

  getPlayerResults(): MatchResultForPlayer[] {
    const cachedResult = cachedPlayerResults[this.id];
    if (cachedResult) return cachedResult;

    const gameRows = statsDb().query<{
      game_id: number;
      game_winner_player_id: number;
    }>(
      ` SELECT 
           game_id, 
           game_winner_player_id 
         FROM games 
         WHERE match_id = ?`,
      [this.id]
    );

    const placeholders = gameRows.map(() => "?").join(", ");
    const gameResultRows = statsDb().query<{ player_id: number }>(
      ` SELECT 
          player_id 
        FROM game_results 
        WHERE game_id IN (${placeholders})`,
      gameRows.map((row) => row.game_id)
    );

    const playerIds = [...new Set(gameResultRows.map((row) => row.player_id))];

    const playerResults = playerIds.map((id) => {
      return {
        player_id: id,
        player_name: statsDb().playerName(id) || "",
        score: gameRows.filter((row) => row.game_winner_player_id === id)
          .length,
      };
    });

    cachedPlayerResults[this.id] = playerResults;
    return playerResults;
  }
}
