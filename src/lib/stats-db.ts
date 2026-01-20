import { createSignal } from "solid-js";
import type { StatsDB, Database } from "./stats-db-impl";

const [statsDb, setStatsDb] = createSignal<StatsDB | null>(null);
const [dbReady, setDbReady] = createSignal(false);

// Initialize in browser only
if (typeof window !== "undefined") {
  import("./stats-db-impl").then(async ({ StatsDB }) => {
    setStatsDb(await StatsDB.create());
    setDbReady(true);
  });
}

export { statsDb, dbReady };
export type { StatsDB, Database };
