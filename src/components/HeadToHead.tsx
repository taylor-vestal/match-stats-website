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
import type { H2HMatchRow } from "@/lib/stats-db-impl";

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

const pctFormat = (n: number) => `${n}%`;

const CompareStats: Component = () => {
  return (
    <section
      class={cn(
        "h2h-compare-stats items-center grid gap-x-2 gap-y-1",
        "grid-cols-[auto_1fr_1.5rem_1fr_1.5rem_1fr_auto]"
      )}
    >
      <StatRow name="Stat" left={1000000} right={800000} />
      <StatRow name="Stat" left={100} right={100} format={pctFormat} />
      <StatRow name="Stat" left={100} right={100} format={pctFormat} />
    </section>
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

  const defaultRecord = { p1Wins: 0, p2Wins: 0 };

  const matchRecord = createMemo(() => {
    const db = statsDb();
    const p1 = player1Id();
    const p2 = player2Id();
    if (!db || !p1 || !p2) return defaultRecord;
    return db.h2hMatchRecord(p1, p2);
  });

  const gameRecord = createMemo(() => {
    const db = statsDb();
    const p1 = player1Id();
    const p2 = player2Id();
    if (!db || !p1 || !p2) return defaultRecord;
    return db.h2hGameRecord(p1, p2);
  });

  const h2hMatches = createMemo((): MatchResult[] => {
    const db = statsDb();
    const p1 = player1Id();
    const p2 = player2Id();
    if (!db || !p1 || !p2) return [];

    const rows = db.h2hMatchHistory(p1, p2);
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
        player1Topout: (first.p1Topout as "I" | "N" | undefined) ?? undefined,
        player2Topout: (first.p2Topout as "I" | "N" | undefined) ?? undefined,
        winnerId: String(first.matchWinnerId),
        roundName: first.eventRoundName,
        eventName: first.eventShortName,
        date: first.matchTimestamp?.slice(0, 10) ?? undefined,
        games: games
          .filter((g) => g.gameId != null)
          .toReversed()
          .map((g) => ({
            gameId: String(g.gameId),
            gameNumber: g.gameNumber!,
            date: first.matchTimestamp?.slice(0, 10) ?? "",
            eventName: first.eventShortName,
            player1Score: g.p1Score ?? undefined,
            player2Score: g.p2Score ?? undefined,
            winnerId: String(g.gameWinnerId),
          })),
      };
    });
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
        <CompareStats />
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
        <MatchHistory
          player1Id={String(player1Id() ?? "")}
          player2Id={String(player2Id() ?? "")}
          matches={h2hMatches()}
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
