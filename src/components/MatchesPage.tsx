import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  type Component,
} from "solid-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { statsDb, statsDbSignal } from "@/lib/stats-db";
import { Match, type MatchResult } from "@/lib/match";

interface MatchFilter {
  numberOfMatches: number;
}

const MatchesPageInner: Component = () => {
  const [matchFilter, setMatchFilter] = createSignal<MatchFilter>({
    numberOfMatches: 20,
  });
  const [filteredMatches, setFilteredMatches] = createSignal<Match[]>([]);

  const allMatches = createMemo(() => {
    const db = statsDb();
    const matchRows = db.matches();
    const matches = [...matchRows.keys()].map((id) => new Match(id));
    return matches;
  });

  createEffect(() => {
    setFilteredMatches(allMatches().filter((m) => !m.isUndefined()));
  });

  return (
    <Card>
      <CardContent class="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="text-center">Event</TableHead>
              <TableHead class="text-center">Round</TableHead>
              <TableHead class="text-center">Style</TableHead>
              <TableHead class="text-center">Date</TableHead>
              <TableHead class="text-center">Player 1</TableHead>
              <TableHead class="text-center">Player 2</TableHead>
              <TableHead class="text-center">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For
              each={filteredMatches().slice(0, matchFilter().numberOfMatches)}
            >
              {(match) => (
                <MatchRow
                  {...(match.getMatchResult() as MatchResult)}
                ></MatchRow>
              )}
            </For>
          </TableBody>
        </Table>
        {matchFilter().numberOfMatches < filteredMatches().length ? (
          <button
            type="button"
            class="flex justify-center w-full border-y transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            onClick={() =>
              setMatchFilter({
                ...matchFilter(),
                numberOfMatches: matchFilter().numberOfMatches + 20,
              })
            }
          >
            <span class="m-8 text-muted-foreground">more</span>
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
};

const MatchRow: Component<MatchResult> = (props) => {
  const is2p = props.player_results.length === 2;
  return (
    <TableRow>
      <TableCell class="text-center text-muted-foreground">
        {props.event_short_name}
      </TableCell>
      <TableCell class="text-center text-muted-foreground">
        {props.round}
      </TableCell>
      <TableCell class="text-center text-muted-foreground">
        {props.playstyle}
      </TableCell>
      <TableCell class="text-center text-muted-foreground">
        {props.match_date?.slice(0, 10)}
      </TableCell>
      <TableCell class="text-center text-muted-foreground">
        {is2p
          ? props.player_results[0].player_name
          : `(${props.player_results.length} players)`}
      </TableCell>
      <TableCell class="text-center text-muted-foreground">
        {is2p ? props.player_results[1].player_name : ""}
      </TableCell>
      <TableCell class="text-center text-muted-foreground">
        {is2p
          ? `${props.player_results[0].score}-${props.player_results[1].score}`
          : ""}
      </TableCell>
    </TableRow>
  );
};

const MatchesPage: Component = () => (
  <Show when={statsDbSignal()}>
    <MatchesPageInner />
  </Show>
);

export default MatchesPage;
