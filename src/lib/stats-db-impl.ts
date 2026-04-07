import sqlite3InitModule, {
  type Sqlite3Static,
  type BindableValue,
} from "@sqlite.org/sqlite-wasm";
import type {
  NumericStatisticResult,
  EventRow,
  EventRoundRow,
  MatchRow,
} from "@/lib/stats/types";

type Database = InstanceType<Sqlite3Static["oo1"]["DB"]>;

export class StatsDB {
  private db: Database;

  // Lazy-loaded caches
  private _playerNames: Map<number, string> | null = null;
  private _events: Map<number, EventRow> | null = null;
  private _event_rounds: Map<number, EventRoundRow> | null = null;
  private _matches: Map<number, MatchRow> | null = null;

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
      db.pointer as number,
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

  query<T>(sql: string, params: BindableValue[] = []): T[] {
    return this.db.exec({
      sql,
      bind: params,
      returnValue: "resultRows",
      rowMode: "object",
    }) as unknown as T[];
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
        `SELECT 
          player_id, 
          username 
        FROM players`
      );
      this._playerNames = new Map(rows.map((r) => [r.player_id, r.username]));
    }
    return this._playerNames;
  }

  playerName(id: number): string | undefined {
    return this.playerNames().get(id);
  }

  events(): Map<number, EventRow> {
    if (!this._events) {
      const rows = this.query<EventRow>(
        ` SELECT 
            event_id, 
            event_short_name, 
            event_playstyle_id 
          FROM events`
      );
      this._events = new Map(rows.map((r) => [r.event_id, r]));
    }
    return this._events;
  }

  event(id: number): EventRow | undefined {
    return this.events().get(id);
  }

  eventPlaystyle(id: number): string | undefined {
    const rows = this.query<{ playstyle: string }>(
      ` SELECT playstyle 
        FROM playstyles 
        WHERE playstyle_id = ?`,
      [id]
    );
    return rows[0].playstyle;
  }

  eventRounds(): Map<number, EventRoundRow> {
    if (!this._event_rounds) {
      const rows = this.query<EventRoundRow>(
        ` SELECT 
            event_round_id, 
            event_id,
            event_round_name
          FROM event_rounds`
      );
      this._event_rounds = new Map(rows.map((r) => [r.event_round_id, r]));
    }
    return this._event_rounds;
  }

  eventRound(id: number): EventRoundRow | undefined {
    return this.eventRounds().get(id);
  }

  matches(): Map<number, MatchRow> {
    if (!this._matches) {
      const rows = this.query<MatchRow>(
        ` SELECT 
            match_id, 
            match_timestamp, 
            event_round_id 
          FROM matches `
      );
      this._matches = new Map(rows.map((r) => [r.match_id, r]));
    }
    return this._matches;
  }

  match(id: number): MatchRow | undefined {
    return this.matches().get(id);
  }
}

export type { Database };
