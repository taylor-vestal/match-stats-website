import "@/styles/HeadToHead.css";
import {
  createSignal,
  createMemo,
  createResource,
  Show,
  type Component,
} from "solid-js";
import { statsDb } from "@/lib/stats-db";
import { Player } from "@/lib/player";
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemLabel,
  ComboboxTrigger,
} from "@/components/ui/combobox";

type PlayerOption = { id: string; name: string };

interface PlayerSelectProps {
  value: string;
  onChange: (id: string) => void;
  players: PlayerOption[];
}

interface PlayerAvatarProps {
  url: string | null | undefined;
  alt: string;
}

const PlayerAvatar: Component<PlayerAvatarProps> = (props) => {
  return (
    <figure class="aspect-square mb-4">
      <Show when={props.url} fallback={<div class="size-full bg-muted" />}>
        {(url) => (
          <img src={url()} alt={props.alt} class="size-full object-cover" />
        )}
      </Show>
    </figure>
  );
};

const PlayerSelect: Component<PlayerSelectProps> = (props) => {
  return (
    <Combobox<PlayerOption>
      value={props.players.find((p) => p.id === props.value) ?? null}
      onChange={(val) => props.onChange(val?.id ?? "")}
      options={props.players}
      optionValue="id"
      optionTextValue="name"
      optionLabel="name"
      placeholder="Select player"
      itemComponent={(itemProps) => (
        <ComboboxItem item={itemProps.item}>
          <ComboboxItemLabel>{itemProps.item.rawValue.name}</ComboboxItemLabel>
          <ComboboxItemIndicator />
        </ComboboxItem>
      )}
    >
      <ComboboxControl>
        <ComboboxInput />
        <ComboboxTrigger />
      </ComboboxControl>
      <ComboboxContent />
    </Combobox>
  );
};

const CompareStats: Component = () => {
  return (
    <section class="h2h-compare-stats grid gap-4">
      BIG BOX 67 VS 69 AYYYYYY
    </section>
  );
};

const HeadToHead: Component = () => {
  const [player1Id, setPlayer1Id] = createSignal<string>("");
  const [player2Id, setPlayer2Id] = createSignal<string>("");

  // Reactive player list - updates when statsDb becomes available
  const allPlayers = createMemo(() => {
    const db = statsDb();
    if (!db) return [];
    const names = db.playerNames();
    return Array.from(names.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const [player1Avatar] = createResource(player1Id, (id) =>
    id ? new Player(id).getAvatarUrl() : null
  );
  const [player2Avatar] = createResource(player2Id, (id) =>
    id ? new Player(id).getAvatarUrl() : null
  );

  return (
    <main class="container">
      <section class="h2h-summary grid gap-4 mt-8 mb-4">
        <article class="h2h-player l">
          <PlayerAvatar url={player1Avatar()} alt="Player 1" />
          <PlayerSelect
            value={player1Id()}
            onChange={setPlayer1Id}
            players={allPlayers()}
          />
        </article>
        <aside class="h2h-icons l" />
        <aside class="h2h-overall" />
        <CompareStats />
        <aside class="h2h-icons r" />
        <article class="h2h-player r">
          <PlayerAvatar url={player2Avatar()} alt="Player 2" />
          <PlayerSelect
            value={player2Id()}
            onChange={setPlayer2Id}
            players={allPlayers()}
          />
        </article>
      </section>
      <section id="match-history" class="h-48 mt-4">
        MATCH HISTORY
      </section>
    </main>
  );
};

export default HeadToHead;
