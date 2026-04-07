import "@/styles/HeadToHead.css";
import {
  createSignal,
  createMemo,
  createResource,
  onMount,
  Show,
  type Component,
} from "solid-js";
import { cn } from "@/lib/utils";
import { statsDb, statsDbSignal } from "@/lib/stats-db";
import { Player, ensureAvatarManifest } from "@/lib/player";
import {
  PlayerAvatar,
  PlayerSelect,
  PlayerIcons,
} from "@/components/PlayerComponents";
import MatchHistory, { type MatchResult } from "@/components/MatchHistory";
import type { EventPlaystyle } from "@/lib/enums";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { h2hMatchHistory, type H2HMatchRow } from "@/lib/stats/h2h";
import { FairMedianScore, HighRange, LowRange } from "@/lib/stats/player";
import type { StatisticalContext, StatisticalFilters } from "@/lib/stats/types";

const CURRENT_YEAR = 2025;

type EventPlaystyleOption = "All" | "Open" | "DAS";
type DisplayMode = "Game" | "Match";

function playstyleFilterToEventPlaystyle(
  p: EventPlaystyleOption
): EventPlaystyle | undefined {
  switch (p) {
    case "All":
      return undefined;
    case "Open":
      return "Open";
    case "DAS":
      return "DAS";
  }
}

interface RecordDisplayProps {
  label: string;
  left: number;
  right: number;
}

const RecordDisplay: Component<RecordDisplayProps> = (props) => {
  return (
    <div class="flex flex-col items-center">
      <span class="text-lg text-muted-foreground">{props.label}</span>
      <div class="flex items-center gap-2">
        <span class="text-4xl font-bold">{props.left}</span>
        <span class="text-xl text-muted-foreground">-</span>
        <span class="text-4xl font-bold">{props.right}</span>
      </div>
    </div>
  );
};

interface OverallStatsProps {
  matchRecord: { p1Wins: number; p2Wins: number };
  gameRecord: { p1Wins: number; p2Wins: number };
}

const OverallStats: Component<OverallStatsProps> = (props) => {
  return (
    <aside
      class={cn(
        "h2h-overall flex flex-col items-center justify-evenly",
        "min-[1200px]:grid min-[1200px]:grid-cols-2 min-[1200px]:items-center"
      )}
    >
      <div class="min-[1200px]:justify-self-end min-[1200px]:pr-6">
        <RecordDisplay
          label="Match Record"
          left={props.matchRecord.p1Wins}
          right={props.matchRecord.p2Wins}
        />
      </div>
      <div class="min-[1200px]:justify-self-start min-[1200px]:pl-6">
        <RecordDisplay
          label="Game Record"
          left={props.gameRecord.p1Wins}
          right={props.gameRecord.p2Wins}
        />
      </div>
    </aside>
  );
};

interface StatRowProps {
  name: string;
  left: number;
  right: number;
  format?: (n: number) => string;
}

const StatRow: Component<StatRowProps> = (props) => {
  const fmt = () => props.format ?? ((n: number) => n.toLocaleString());
  const diff = () => Math.abs(props.left - props.right);

  return (
    <>
      <span class="text-xl text-left text-muted-foreground pr-4">
        {props.name}
      </span>
      <span class="text-2xl text-left font-bold">{fmt()(props.left)}</span>
      <span class="text-2xl text-center">
        {props.left > props.right ? "◀" : ""}
      </span>
      <span class="text-2xl text-center font-bold">{fmt()(diff())}</span>
      <span class="text-2xl text-center">
        {props.right > props.left ? "▶" : ""}
      </span>
      <span class="text-2xl text-right font-bold">{fmt()(props.right)}</span>
      <span class="text-xl text-right text-muted-foreground pl-4">
        {props.name}
      </span>
    </>
  );
};

interface CompareStatsProps {
  player1Id: number | null;
  player2Id: number | null;
  playstyle: EventPlaystyleOption;
}

const CompareStats: Component<CompareStatsProps> = (props) => {
  const stats = createMemo(() => {
    const db = statsDb();
    const p1 = props.player1Id;
    const p2 = props.player2Id;
    if (!p1 || !p2) return null;
    const ep = playstyleFilterToEventPlaystyle(props.playstyle);
    const filters: StatisticalFilters = {
      eventPlaystyle: ep,
      startDate: `${CURRENT_YEAR}-01-01`,
      endDate: `${CURRENT_YEAR}-12-31`,
    };
    const ctx: StatisticalContext = { playerId: [p1, p2], filters };
    const p1s = String(p1);
    const p2s = String(p2);
    const val = (
      results: ReturnType<typeof FairMedianScore.evaluate>,
      id: string
    ) => results.find((r) => r.playerId === id)?.value ?? 0;
    const hr = HighRange.evaluate(db, ctx);
    const fms = FairMedianScore.evaluate(db, ctx);
    const lr = LowRange.evaluate(db, ctx);
    return {
      p1HR: val(hr, p1s),
      p2HR: val(hr, p2s),
      p1FMS: val(fms, p1s),
      p2FMS: val(fms, p2s),
      p1LR: val(lr, p1s),
      p2LR: val(lr, p2s),
    };
  });

  return (
    <Show when={stats()}>
      {(s) => (
        <section
          class={cn(
            "h2h-compare-stats items-center grid gap-x-2 gap-y-1",
            "grid-cols-[auto_1fr_1.5rem_1fr_1.5rem_1fr_auto]"
          )}
        >
          <StatRow
            name={`${CURRENT_YEAR} HR`}
            left={s().p1HR}
            right={s().p2HR}
          />
          <StatRow
            name={`${CURRENT_YEAR} FMS`}
            left={s().p1FMS}
            right={s().p2FMS}
          />
          <StatRow
            name={`${CURRENT_YEAR} LR`}
            left={s().p1LR}
            right={s().p2LR}
          />
        </section>
      )}
    </Show>
  );
};

const HeadToHeadInner: Component = () => {
  const [player1Id, setPlayer1Id] = createSignal<number | null>(null);
  const [player2Id, setPlayer2Id] = createSignal<number | null>(null);
  const [avatarsLoaded, setAvatarsLoaded] = createSignal(false);

  // Read URL on mount
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const l = params.get("l");
    const r = params.get("r");
    if (l) setPlayer1Id(Number(l));
    if (r) setPlayer2Id(Number(r));

    // Load avatar manifest for player selector
    ensureAvatarManifest().then(() => setAvatarsLoaded(true));
  });

  const updateUrl = () => {
    const l = player1Id();
    const r = player2Id();
    const params = new URLSearchParams();
    if (l) params.set("l", String(l));
    if (r) params.set("r", String(r));
    const query = params.toString();
    history.replaceState(null, "", query ? `/compare?${query}` : "/compare");
  };

  const handlePlayer1Change = (id: number) => {
    setPlayer1Id(id);
    updateUrl();
  };

  const handlePlayer2Change = (id: number) => {
    setPlayer2Id(id);
    updateUrl();
  };

  // Reactive player list - updates when statsDb becomes available
  const allPlayers = createMemo(() => {
    const db = statsDb();
    const names = db.playerNames();
    // Re-run when avatars load to include avatar URLs
    const _loaded = avatarsLoaded();
    return Array.from(names.entries())
      .map(([id, name]) => ({
        id,
        name,
        avatarUrl: new Player(id).getAvatarUrlSync(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const [player1Avatar] = createResource(player1Id, (id) =>
    id ? new Player(id).getAvatarUrl() : null
  );
  const [player2Avatar] = createResource(player2Id, (id) =>
    id ? new Player(id).getAvatarUrl() : null
  );

  const defaultPlaystyle: EventPlaystyleOption = "Open";
  const [playstyleFilter, setPlaystyleFilter] =
    createSignal<EventPlaystyleOption>(defaultPlaystyle);
  const [displayMode, setDisplayMode] = createSignal<DisplayMode>("Game");

  const h2hMatches = createMemo((): MatchResult[] => {
    const db = statsDb();
    const p1 = player1Id();
    const p2 = player2Id();
    if (!db || !p1 || !p2) return [];

    const rows = h2hMatchHistory(db, p1, p2);
    const grouped = new Map<number, H2HMatchRow[]>();
    for (const row of rows) {
      let group = grouped.get(row.matchId);
      if (!group) {
        group = [];
        grouped.set(row.matchId, group);
      }
      group.push(row);
    }

    return Array.from(grouped.values()).map((games) => {
      const first = games[0];
      return {
        matchId: String(first.matchId),
        player1Id: String(p1),
        player2Id: String(p2),
        player1Score: games.reduce((sum, g) => sum + (g.p1Score ?? 0), 0),
        player2Score: games.reduce((sum, g) => sum + (g.p2Score ?? 0), 0),
        player1Style: first.p1Playstyle ?? undefined,
        player2Style: first.p2Playstyle ?? undefined,
        player1Topout: first.p1Topout ?? undefined,
        player2Topout: first.p2Topout ?? undefined,
        winnerId: String(first.matchWinnerId),
        roundName: first.eventRoundName,
        eventName: first.eventShortName,
        eventPlaystyle: first.eventPlaystyle,
        date: first.matchTimestamp?.slice(0, 10) ?? undefined,
        games: games
          .filter(
            (g): g is H2HMatchRow & { gameId: number; gameNumber: number } =>
              g.gameId != null && g.gameNumber != null
          )
          .toReversed()
          .map((g) => ({
            gameId: String(g.gameId),
            gameNumber: g.gameNumber,
            date: first.matchTimestamp?.slice(0, 10) ?? "",
            eventName: first.eventShortName,
            player1Score: g.p1Score ?? undefined,
            player2Score: g.p2Score ?? undefined,
            player1Style: g.p1Playstyle ?? undefined,
            player2Style: g.p2Playstyle ?? undefined,
            player1Topout: g.p1Topout ?? undefined,
            player2Topout: g.p2Topout ?? undefined,
            winnerId: String(g.gameWinnerId),
          })),
      };
    });
  });

  const filteredMatches = createMemo(() => {
    const filter = playstyleFilter();
    const matches = h2hMatches();
    if (filter === "All") return matches;
    return matches.filter((m) => m.eventPlaystyle === filter);
  });

  const defaultRecord = { p1Wins: 0, p2Wins: 0 };

  const matchRecord = createMemo(() => {
    const matches = filteredMatches();
    const p1 = player1Id();
    if (!p1) return defaultRecord;
    const p1Str = String(p1);
    return {
      p1Wins: matches.filter((m) => m.winnerId === p1Str).length,
      p2Wins: matches.filter(
        (m) => m.winnerId !== p1Str && m.winnerId !== "null"
      ).length,
    };
  });

  const gameRecord = createMemo(() => {
    const matches = filteredMatches();
    const p1 = String(player1Id());
    let p1Wins = 0;
    let p2Wins = 0;
    for (const m of matches) {
      for (const g of m.games) {
        if (g.winnerId === p1) p1Wins++;
        else if (g.winnerId !== "null") p2Wins++;
      }
    }
    return { p1Wins, p2Wins };
  });

  const player1Socials = createMemo(() => {
    const id = player1Id();
    return id ? new Player(id).getSocials() : undefined;
  });
  const player2Socials = createMemo(() => {
    const id = player2Id();
    return id ? new Player(id).getSocials() : undefined;
  });

  return (
    <main class="container">
      <section class="h2h-summary grid gap-4 mt-8 mb-4">
        <article class="h2h-player l">
          <PlayerAvatar url={player1Avatar()} alt="Player 1" />
          <PlayerSelect
            value={player1Id()}
            onChange={handlePlayer1Change}
            players={allPlayers()}
          />
        </article>
        <PlayerIcons
          class="h2h-icons l"
          playerId={player1Id()}
          socials={player1Socials()}
        />
        <OverallStats matchRecord={matchRecord()} gameRecord={gameRecord()} />
        <CompareStats
          player1Id={player1Id()}
          player2Id={player2Id()}
          playstyle={playstyleFilter()}
        />
        <PlayerIcons
          class="h2h-icons r"
          playerId={player2Id()}
          socials={player2Socials()}
        />
        <article class="h2h-player r">
          <PlayerAvatar url={player2Avatar()} alt="Player 2" />
          <PlayerSelect
            value={player2Id()}
            onChange={handlePlayer2Change}
            players={allPlayers()}
          />
        </article>
      </section>
      <section id="match-history" class="mt-4">
        <div class="flex justify-between items-center mb-2">
          <Tabs
            defaultValue={defaultPlaystyle}
            onChange={(v) => setPlaystyleFilter(v as EventPlaystyleOption)}
          >
            <TabsList class="w-fit">
              <TabsTrigger value="Open">Open</TabsTrigger>
              <TabsTrigger value="DAS">DAS</TabsTrigger>
              <TabsTrigger value="All">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs
            defaultValue="Game"
            onChange={(v) => setDisplayMode(v as DisplayMode)}
          >
            <TabsList class="w-fit">
              <TabsTrigger value="Game">Games</TabsTrigger>
              <TabsTrigger value="Match">Matches</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <MatchHistory
          player1Id={String(player1Id() ?? "")}
          player2Id={String(player2Id() ?? "")}
          matches={filteredMatches()}
          displayMode={displayMode()}
        />
      </section>
    </main>
  );
};

const HeadToHead: Component = () => (
  <Show when={statsDbSignal()}>
    <HeadToHeadInner />
  </Show>
);

export default HeadToHead;
