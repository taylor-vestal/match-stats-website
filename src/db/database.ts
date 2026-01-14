import sqlite3InitModule, { type Sqlite3Static } from "@sqlite.org/sqlite-wasm";

type Database = InstanceType<Sqlite3Static["oo1"]["DB"]>;

class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private db: Database | null = null;
  private sqlite3: Sqlite3Static | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(): Promise<Database> {
    if (this.db) return this.db;

    const mode = import.meta.env.MODE;

    if (mode === "development") {
      return this.loadFromUrl("/nestris-db.sqlite3");
    } else if (mode === "production") {
      // TODO: Implement production database loading
      throw new Error("Production database loading not yet implemented");
    } else {
      throw new Error(`Unknown mode: ${mode}`);
    }
  }

  private async loadFromUrl(url: string): Promise<Database> {
    this.sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    const p = this.sqlite3.wasm.allocFromTypedArray(
      new Uint8Array(arrayBuffer)
    );
    this.db = new this.sqlite3.oo1.DB();

    const rc = this.sqlite3.capi.sqlite3_deserialize(
      this.db.pointer,
      "main",
      p,
      arrayBuffer.byteLength,
      arrayBuffer.byteLength,
      this.sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE |
        this.sqlite3.capi.SQLITE_DESERIALIZE_READONLY
    );
    this.db.checkRc(rc);

    return this.db;
  }

  getDb(): Database {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }
}

export const dbManager = DatabaseManager.getInstance();
export type { Database };
