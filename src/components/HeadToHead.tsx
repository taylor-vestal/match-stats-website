import "@/styles/HeadToHead.css";
import {
  createSignal,
  createMemo,
  createResource,
  Show,
  type Component,
} from "solid-js";
import { BsFlag, BsTwitch, BsYoutube, BsPersonFill } from "solid-icons/bs";
import { statsDb } from "@/lib/stats-db";
import { Player, type PlayerSocials } from "@/lib/player";
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

interface PlayerIconsProps {
  class?: string;
  playerId?: string;
  socials?: PlayerSocials;
}

const PlayerIcons: Component<PlayerIconsProps> = (props) => {
  const iconClass = "w-full h-auto";

  return (
    <aside class={`flex flex-col justify-between h-full ${props.class ?? ""}`}>
      <BsFlag class={iconClass} />
      <Show
        when={props.socials?.twitch}
        fallback={<BsTwitch class={`${iconClass} opacity-30`} />}
      >
        {(url) => (
          <a href={url()} target="_blank" rel="noopener noreferrer">
            <BsTwitch class={iconClass} style={{ color: "#944cff" }} />
          </a>
        )}
      </Show>
      <Show
        when={props.socials?.youtube}
        fallback={<BsYoutube class={`${iconClass} opacity-30`} />}
      >
        {(url) => (
          <a href={url()} target="_blank" rel="noopener noreferrer">
            <BsYoutube class={iconClass} style={{ color: "#fe0034" }} />
          </a>
        )}
      </Show>
      <Show
        when={props.playerId}
        fallback={<BsPersonFill class={`${iconClass} opacity-30`} />}
      >
        {(id) => (
          <a href={`/player?p=${id()}`}>
            <BsPersonFill class={iconClass} />
          </a>
        )}
      </Show>
    </aside>
  );
};

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
            onChange={setPlayer1Id}
            players={allPlayers()}
          />
        </article>
        <PlayerIcons
          class="h2h-icons l"
          playerId={player1Id()}
          socials={player1Socials()}
        />
        <aside class="h2h-overall" />
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
