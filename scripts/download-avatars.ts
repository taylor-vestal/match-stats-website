import Database from "better-sqlite3";
import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { config } from "dotenv";

// Load .env.development
config({ path: ".env.development" });

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: npm run download-avatars <csv-file>");
  process.exit(1);
}

const dbPath = process.env.DB_PATH;
if (!dbPath) {
  console.error("DB_PATH not set in .env.development");
  process.exit(1);
}

// 1. Read CSV
const csv = readFileSync(csvPath);
const records = parse(csv, { columns: true }) as {
  to: string;
  Photo: string;
}[];

// 2. Open database
const db = new Database(`public/${dbPath}`, { readonly: true });
const stmt = db.prepare<string, { player_id: number }>(
  "SELECT player_id FROM players WHERE username = ?"
);

// Get all players from DB to track coverage
const allPlayers = db
  .prepare("SELECT player_id, username FROM players")
  .all() as {
  player_id: number;
  username: string;
}[];
const allPlayerIds = new Set(allPlayers.map((p) => p.player_id));
const processedPlayerIds = new Set<number>();
const avatarExtensions: Record<number, string> = {};

// 3. Clean output directory
const outputDir = "public/img/avatar";
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// 4. For each row, fetch and save
for (const row of records) {
  const username = row.to;
  const photoUrl = row.Photo;

  if (!username || !photoUrl) continue;

  const player = stmt.get(username);
  if (!player) {
    console.warn(`No player found for: ${username}`);
    continue;
  }

  // Extract extension from URL
  const ext =
    photoUrl.match(/\.(png|jpe?g|gif|webp)$/i)?.[0]?.toLowerCase() || ".png";

  const response = await fetch(photoUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  writeFileSync(`${outputDir}/${player.player_id}${ext}`, buffer);
  processedPlayerIds.add(player.player_id);
  avatarExtensions[player.player_id] = ext;
  console.log(`Saved avatar for ${username} (ID: ${player.player_id}${ext})`);
}

// Report players without avatars
const missingPlayerIds = [...allPlayerIds].filter(
  (id) => !processedPlayerIds.has(id)
);
if (missingPlayerIds.length > 0) {
  console.warn(`\n${missingPlayerIds.length} players without avatars:`);
  for (const id of missingPlayerIds) {
    const player = allPlayers.find((p) => p.player_id === id);
    console.warn(`  - ${player?.username} (ID: ${id})`);
  }
}

// Write manifest file
writeFileSync(
  `${outputDir}/manifest.json`,
  JSON.stringify(avatarExtensions, null, 2)
);
console.log(
  `Wrote manifest with ${Object.keys(avatarExtensions).length} entries`
);

db.close();
console.log(
  `\nDone! ${processedPlayerIds.size}/${allPlayerIds.size} players have avatars.`
);
