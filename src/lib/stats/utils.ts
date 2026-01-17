import type { StatisticalContext } from "./types";

/**
 * Build WHERE clause from statistical context.
 * @param ctx - Context with filters and optional playerId
 * @param baseConditions - Additional conditions to include
 * @returns WHERE clause string (empty string if no conditions)
 */
export function buildWhere(
  ctx: StatisticalContext,
  baseConditions: string[] = []
): string {
  const conditions = [...baseConditions];

  if (ctx.filters?.eventIds?.length) {
    const ids = ctx.filters.eventIds.map((id) => `'${id}'`).join(",");
    conditions.push(
      `event_round_id IN (SELECT event_round_id FROM event_rounds WHERE event_id IN (${ids}))`
    );
  }
  if (ctx.filters?.startDate) {
    conditions.push(`match_timestamp >= '${ctx.filters.startDate}'`);
  }
  if (ctx.filters?.endDate) {
    conditions.push(`match_timestamp <= '${ctx.filters.endDate}'`);
  }
  if (ctx.playerId) {
    conditions.push(`player_id = '${ctx.playerId}'`);
  }

  return conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
}
