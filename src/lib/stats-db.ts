import { createSignal } from "solid-js";
import type { StatsDB, Database } from "./stats-db-impl";

const [statsDbSignal, setStatsDb] = createSignal<StatsDB>();

if (typeof window !== "undefined") {
  import("./stats-db-impl").then(async ({ StatsDB }) => {
    setStatsDb(await StatsDB.create());
  });
}

function statsDb(): StatsDB {
  const db = statsDbSignal();
  if (db === undefined) throw new Error("StatsDB not loaded");
  return db;
}

export { statsDb, statsDbSignal };
export type { StatsDB, Database };
