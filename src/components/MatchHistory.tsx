import { createSignal, For, Show, type Component } from "solid-js";
import type { TopoutType } from "@/lib/enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface GameResult {
  gameId: string;
  gameNumber: number;
  date: string;
  eventName?: string;
  player1Score?: number;
  player2Score?: number;
  player1Style?: string;
  player2Style?: string;
  player1Topout?: TopoutType;
  player2Topout?: TopoutType;
  winnerId: string;
}

interface MatchResult {
  matchId: string;
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  player1Style?: string;
  player2Style?: string;
  player1Topout?: TopoutType;
  player2Topout?: TopoutType;
  winnerId: string;
  roundName?: string;
  eventName?: string;
  eventPlaystyle?: string;
  date?: string;
  games: GameResult[];
}

interface MatchHistoryProps {
  matches: MatchResult[];
  player1Id: string;
  player2Id: string;
  displayMode?: "Game" | "Match";
}

const topoutAbbrev: Record<TopoutType, string> = {
  Natural: "N",
  Intentional: "I",
  Aggressive: "A",
  Unknown: "U",
};

function toTopoutAbbrev(value: TopoutType | undefined): string | undefined {
  if (value === undefined) return undefined;
  return topoutAbbrev[value];
}

const MatchHistory: Component<MatchHistoryProps> = (props) => {
  const [expanded, setExpanded] = createSignal<Set<string>>(new Set());

  const toggleExpand = (matchId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };

  const getResultBadge = (playerId: string, winnerId: string) => {
    const isWinner = playerId === winnerId;
    return (
      <Badge
        variant={isWinner ? "success" : "error"}
        class="w-14 justify-center"
      >
        {isWinner ? "WIN" : "LOSS"}
      </Badge>
    );
  };

  const isMatchMode = () => props.displayMode === "Match";

  const gameRows = (match: MatchResult, matchIdx: () => number) => {
    const matchBorder = () =>
      matchIdx() > 0
        ? { "border-top": "3px solid hsl(var(--foreground) / 0.4)" }
        : {};

    return match.games.length > 0 ? (
      <For each={match.games}>
        {(game, gameIdx) => (
          <TableRow
            class="text-center"
            style={gameIdx() === 0 ? matchBorder() : {}}
          >
            <TableCell>
              {getResultBadge(props.player1Id, game.winnerId)}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {game.player1Style ?? match.player1Style ?? "-"}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {toTopoutAbbrev(game.player1Topout) ??
                toTopoutAbbrev(match.player1Topout) ??
                "-"}
            </TableCell>
            <TableCell class="text-right font-mono font-semibold">
              {game.player1Score?.toLocaleString()}
            </TableCell>
            <TableCell>
              <div class="text-xs text-muted-foreground">
                <span class="font-medium">#{game.gameNumber}</span>
                {game.eventName && (
                  <>
                    {" "}
                    - <span>{game.eventName}</span>
                  </>
                )}
                {match.roundName && (
                  <>
                    {" ("}
                    <span>{match.roundName}</span>
                    {")"}
                  </>
                )}
                {game.date && <> - {game.date}</>}
              </div>
            </TableCell>
            <TableCell class="text-left font-mono font-semibold">
              {game.player2Score?.toLocaleString()}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {toTopoutAbbrev(game.player2Topout) ??
                toTopoutAbbrev(match.player2Topout) ??
                "-"}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {game.player2Style ?? match.player2Style ?? "-"}
            </TableCell>
            <TableCell>
              {getResultBadge(props.player2Id, game.winnerId)}
            </TableCell>
          </TableRow>
        )}
      </For>
    ) : (
      <TableRow style={matchBorder()}>
        <TableCell class="text-center">
          {getResultBadge(props.player1Id, match.winnerId)}
        </TableCell>
        <TableCell class="text-center text-muted-foreground">-</TableCell>
        <TableCell class="text-center text-muted-foreground">-</TableCell>
        <TableCell class="text-right font-mono font-semibold">-</TableCell>
        <TableCell class="text-center">
          <div class="text-xs text-muted-foreground">
            <span class="italic">No game data</span>
            {match.roundName && (
              <>
                {" "}
                - <span>{match.roundName}</span>
              </>
            )}
            {match.eventName && (
              <>
                {" "}
                - <span>{match.eventName}</span>
              </>
            )}
            {match.date && <> - {match.date}</>}
          </div>
        </TableCell>
        <TableCell class="text-left font-mono font-semibold">-</TableCell>
        <TableCell class="text-center text-muted-foreground">-</TableCell>
        <TableCell class="text-center text-muted-foreground">-</TableCell>
        <TableCell class="text-center">
          {getResultBadge(props.player2Id, match.winnerId)}
        </TableCell>
      </TableRow>
    );
  };

  const matchSummaryRow = (match: MatchResult, matchIdx: () => number) => {
    const isExpanded = () => expanded().has(match.matchId);
    const matchBorder = () =>
      matchIdx() > 0
        ? { "border-top": "3px solid hsl(var(--foreground) / 0.4)" }
        : {};

    return (
      <>
        <TableRow
          style={matchBorder()}
          class="cursor-pointer hover:bg-muted/50"
          onClick={() => toggleExpand(match.matchId)}
        >
          <TableCell class="text-center">
            {getResultBadge(props.player1Id, match.winnerId)}
          </TableCell>
          <TableCell class="text-center text-muted-foreground">
            {match.player1Style ?? "-"}
          </TableCell>
          <TableCell class="text-center text-muted-foreground">
            {toTopoutAbbrev(match.player1Topout) ?? "-"}
          </TableCell>
          <TableCell class="text-right font-mono font-semibold">
            {match.player1Score}
          </TableCell>
          <TableCell class="text-center">
            <div class="flex items-center justify-center gap-2">
              <span class="text-xs text-muted-foreground">
                {match.roundName && <span>{match.roundName}</span>}
                {match.eventName && (
                  <>
                    {match.roundName && " - "}
                    <span>{match.eventName}</span>
                  </>
                )}
                {match.date && (
                  <>
                    {(match.roundName || match.eventName) && " - "}
                    {match.date}
                  </>
                )}
              </span>
              <span class="text-muted-foreground text-xs">
                {isExpanded() ? "▲" : "▼"}
              </span>
            </div>
          </TableCell>
          <TableCell class="text-left font-mono font-semibold">
            {match.player2Score}
          </TableCell>
          <TableCell class="text-center text-muted-foreground">
            {toTopoutAbbrev(match.player2Topout) ?? "-"}
          </TableCell>
          <TableCell class="text-center text-muted-foreground">
            {match.player2Style ?? "-"}
          </TableCell>
          <TableCell class="text-center">
            {getResultBadge(props.player2Id, match.winnerId)}
          </TableCell>
        </TableRow>
        <Show when={isExpanded()}>
          <For each={match.games}>
            {(game) => (
              <TableRow class="bg-muted/30 text-center">
                <TableCell>
                  {getResultBadge(props.player1Id, game.winnerId)}
                </TableCell>
                <TableCell class="text-muted-foreground">
                  {game.player1Style ?? match.player1Style ?? "-"}
                </TableCell>
                <TableCell class="text-muted-foreground">
                  {toTopoutAbbrev(game.player1Topout) ??
                    toTopoutAbbrev(match.player1Topout) ??
                    "-"}
                </TableCell>
                <TableCell class="text-right font-mono font-semibold">
                  {game.player1Score?.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div class="text-xs text-muted-foreground">
                    <span class="font-medium">Game {game.gameNumber}</span>
                  </div>
                </TableCell>
                <TableCell class="text-left font-mono font-semibold">
                  {game.player2Score?.toLocaleString()}
                </TableCell>
                <TableCell class="text-muted-foreground">
                  {toTopoutAbbrev(game.player2Topout) ??
                    toTopoutAbbrev(match.player2Topout) ??
                    "-"}
                </TableCell>
                <TableCell class="text-muted-foreground">
                  {game.player2Style ?? match.player2Style ?? "-"}
                </TableCell>
                <TableCell>
                  {getResultBadge(props.player2Id, game.winnerId)}
                </TableCell>
              </TableRow>
            )}
          </For>
        </Show>
      </>
    );
  };

  return (
    <Card class="border-[3px] border-foreground/40 overflow-hidden">
      <CardContent class="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="text-center">Result</TableHead>
              <TableHead class="text-center">Style</TableHead>
              <TableHead class="text-center">Topout</TableHead>
              <TableHead class="text-center">Score</TableHead>
              <TableHead class="text-center">
                {isMatchMode() ? "Match" : "Game"}
              </TableHead>
              <TableHead class="text-center">Score</TableHead>
              <TableHead class="text-center">Topout</TableHead>
              <TableHead class="text-center">Style</TableHead>
              <TableHead class="text-center">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Show
              when={isMatchMode()}
              fallback={
                <For each={props.matches}>
                  {(match, matchIdx) => gameRows(match, matchIdx)}
                </For>
              }
            >
              <For each={props.matches}>
                {(match, matchIdx) => matchSummaryRow(match, matchIdx)}
              </For>
            </Show>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MatchHistory;
export type { MatchHistoryProps, MatchResult, GameResult };
