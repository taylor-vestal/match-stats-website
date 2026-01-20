import { For, type Component } from "solid-js";
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
  date: string;
  eventName?: string;
  player1Score?: number;
  player2Score?: number;
  winnerId: string;
}

type TopoutType = "I" | "N";

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
  games: GameResult[];
}

interface MatchHistoryProps {
  matches: MatchResult[];
  player1Id: string;
  player2Id: string;
}

const MatchHistory: Component<MatchHistoryProps> = (props) => {
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

  return (
    <Card>
      <CardContent class="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="text-center">Result</TableHead>
              <TableHead class="text-center">Style</TableHead>
              <TableHead class="text-center">Topout</TableHead>
              <TableHead class="text-center">Score</TableHead>
              <TableHead class="text-center">Game</TableHead>
              <TableHead class="text-center">Score</TableHead>
              <TableHead class="text-center">Topout</TableHead>
              <TableHead class="text-center">Style</TableHead>
              <TableHead class="text-center">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={props.matches}>
              {(match) => (
                <TableRow>
                  <TableCell class="text-center">
                    {getResultBadge(props.player1Id, match.winnerId)}
                  </TableCell>
                  <TableCell class="text-center text-muted-foreground">
                    {match.player1Style ?? "-"}
                  </TableCell>
                  <TableCell class="text-center text-muted-foreground">
                    {match.player1Topout ?? "-"}
                  </TableCell>
                  <TableCell class="text-center font-mono font-semibold">
                    {match.player1Score}
                  </TableCell>
                  <TableCell class="text-center">
                    <div class="space-y-1">
                      <For each={match.games}>
                        {(game) => (
                          <div class="text-xs text-muted-foreground">
                            {game.eventName && (
                              <span class="font-medium">{game.eventName}</span>
                            )}
                            {game.eventName && game.date && " - "}
                            {game.date}
                          </div>
                        )}
                      </For>
                    </div>
                  </TableCell>
                  <TableCell class="text-center font-mono font-semibold">
                    {match.player2Score}
                  </TableCell>
                  <TableCell class="text-center text-muted-foreground">
                    {match.player2Topout ?? "-"}
                  </TableCell>
                  <TableCell class="text-center text-muted-foreground">
                    {match.player2Style ?? "-"}
                  </TableCell>
                  <TableCell class="text-center">
                    {getResultBadge(props.player2Id, match.winnerId)}
                  </TableCell>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MatchHistory;
export type { MatchHistoryProps, MatchResult, GameResult, TopoutType };
