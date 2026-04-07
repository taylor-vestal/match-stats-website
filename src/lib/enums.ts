/** Player-level playstyle (per game_result): DAS, Tap, Roll, Butterfly */
export type Playstyle = "DAS" | "Tap" | "Roll" | "Butterfly";

/** Event-level playstyle (per event): Open, DAS, Tap */
export type EventPlaystyle = "Open" | "DAS" | "Tap";

/** Topout type as stored in the database */
export type TopoutType = "Natural" | "Intentional" | "Aggressive" | "Unknown";

/** Abbreviated topout type for display */
export type TopoutAbbrev = "N" | "I" | "A" | "U";

const topoutAbbrevMap: Record<TopoutType, TopoutAbbrev> = {
  Natural: "N",
  Intentional: "I",
  Aggressive: "A",
  Unknown: "U",
};

export function abbreviateTopout(
  value: TopoutType | null | undefined
): TopoutAbbrev | undefined {
  if (value == null) return undefined;
  return topoutAbbrevMap[value];
}

/** Event type: Tournament, League */
export type EventType = "Tournament" | "League";
