import sqlite3InitModule, { type Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import type { NumericStatisticResult } from "@/lib/stats/types";

type Database = InstanceType<Sqlite3Static["oo1"]["DB"]>;

export class StatsDB {
  private db: Database;

  // Lazy-loaded caches
  private _playerNames: Map<string, string> | null = null;

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

  playerNames(): Map<string, string> {
    if (!this._playerNames) {
      const rows = this.query<{ player_id: string; username: string }>(
        "SELECT player_id, username FROM players"
      );
      this._playerNames = new Map(rows.map((r) => [r.player_id, r.username]));
    }
    return this._playerNames;
  }

  playerName(id: string): string | undefined {
    return this.playerNames().get(id);
  }
}

export type { Database };
