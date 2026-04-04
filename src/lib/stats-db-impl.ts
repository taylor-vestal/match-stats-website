import sqlite3InitModule, { type Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import type { NumericStatisticResult } from "@/lib/stats/types";

type Database = InstanceType<Sqlite3Static["oo1"]["DB"]>;

export class StatsDB {
  private db: Database;

  // Lazy-loaded caches
  private _playerNames: Map<number, string> | null = null;

  private constructor(db: Database) {
    this.db = db;
  }

  static async create(): Promise<StatsDB> {
    const mode = import.meta.env.MODE;

    if (mode === "development") {
      return StatsDB.loadFromUrl("/nestris-db.sqlite3");
    } else if (mode === "production") {
      // TODO: Implement production database loading
      throw new Error("Production database loading not yet implemented");
    } else {
      throw new Error(`Unknown mode: ${mode}`);
    }
  }

  private static async loadFromUrl(url: string): Promise<StatsDB> {
    const sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    const p = sqlite3.wasm.allocFromTypedArray(new Uint8Array(arrayBuffer));
    const db = new sqlite3.oo1.DB();
    if (db.pointer === undefined) throw new Error("DB pointer is undefined");

    const rc = sqlite3.capi.sqlite3_deserialize(
      db.pointer,
      "main",
      p,
      arrayBuffer.byteLength,
      arrayBuffer.byteLength,
      sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE |
        sqlite3.capi.SQLITE_DESERIALIZE_READONLY
    );
    db.checkRc(rc);

    return new StatsDB(db);
  }

  query<T>(sql: string): T[] {
    return this.db.exec({
      sql,
      returnValue: "resultRows",
      rowMode: "object",
    }) as T[];
  }

  evaluateQuery(sql: string): NumericStatisticResult[] {
    const rows = this.query<{ player_id: string; value: number }>(sql);

    return rows.map((r) => ({
      value: r.value,
      playerId: r.player_id,
      toString: () => r.value.toString(),
    }));
  }

  playerNames(): Map<number, string> {
    if (!this._playerNames) {
      const rows = this.query<{ player_id: number; username: string }>(
        "SELECT player_id, username FROM players"
      );
      this._playerNames = new Map(rows.map((r) => [r.player_id, r.username]));
    }
    return this._playerNames;
  }

  playerName(id: number): string | undefined {
    return this.playerNames().get(id);
  }

  h2hMatchRecord(p1: number, p2: number): { p1Wins: number; p2Wins: number } {
    const rows = this.query<{ p1_wins: number; p2_wins: number }>(
      `SELECT
        SUM(m.match_winner_player_id = ${p1}) AS p1_wins,
        SUM(m.match_winner_player_id = ${p2}) AS p2_wins
      FROM match_results mr1
      JOIN match_results mr2 ON mr1.match_id = mr2.match_id
      JOIN matches m ON mr1.match_id = m.match_id
      WHERE mr1.player_id = ${p1}
        AND mr2.player_id = ${p2}`
    );
    const row = rows[0];
    return { p1Wins: row?.p1_wins ?? 0, p2Wins: row?.p2_wins ?? 0 };
  }

  h2hGameRecord(p1: number, p2: number): { p1Wins: number; p2Wins: number } {
    const rows = this.query<{ p1_wins: number; p2_wins: number }>(
      `SELECT
        SUM(g.game_winner_player_id = ${p1}) AS p1_wins,
        SUM(g.game_winner_player_id = ${p2}) AS p2_wins
      FROM match_results mr1
      JOIN match_results mr2 ON mr1.match_id = mr2.match_id
      JOIN games g ON mr1.match_id = g.match_id
      WHERE mr1.player_id = ${p1}
        AND mr2.player_id = ${p2}`
    );
    const row = rows[0];
    return { p1Wins: row?.p1_wins ?? 0, p2Wins: row?.p2_wins ?? 0 };
  }

  h2hMatchHistory(p1: number, p2: number): H2HMatchRow[] {
    return this.query<H2HMatchRow>(
      `SELECT
        m.match_id AS matchId,
        m.match_winner_player_id AS matchWinnerId,
        m.match_timestamp AS matchTimestamp,
        e.event_short_name AS eventShortName,
        er.event_round_name AS eventRoundName,
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
}

export interface H2HMatchRow {
  matchId: number;
  matchWinnerId: number | null;
  matchTimestamp: string | null;
  eventShortName: string;
  eventRoundName: string;
  gameId: number | null;
  gameNumber: number | null;
  gameWinnerId: number | null;
  p1Score: number | null;
  p2Score: number | null;
  p1Playstyle: string | null;
  p2Playstyle: string | null;
  p1Topout: string | null;
  p2Topout: string | null;
}

export type { Database };
