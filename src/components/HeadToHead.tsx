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
    <div class="h2h-compare-stats grid gap-4">BIG BOX 67 VS 69 AYYYYYY</div>
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
    <div class="container">
      <div class="h2h-summary grid gap-4 mt-8 mb-4">
        <div class="h2h-player l">
          <div id="avatar1" class="aspect-square mb-4">
            <Show
              when={player1Avatar()}
              fallback={<div class="size-full bg-muted" />}
            >
              {(url) => (
                <img
                  src={url()}
                  alt="Player 1"
                  class="size-full object-cover"
                />
              )}
            </Show>
          </div>
          <PlayerSelect
            value={player1Id()}
            onChange={setPlayer1Id}
            players={allPlayers()}
          />
        </div>
        <div class="h2h-icons l"></div>
        <div class="h2h-overall"></div>
        <CompareStats />
        <div class="h2h-icons r"></div>
        <div class="h2h-player r">
          <div id="avatar2" class="aspect-square mb-4">
            <Show
              when={player2Avatar()}
              fallback={<div class="size-full bg-muted" />}
            >
              {(url) => (
                <img
                  src={url()}
                  alt="Player 2"
                  class="size-full object-cover"
                />
              )}
            </Show>
          </div>
          <PlayerSelect
            value={player2Id()}
            onChange={setPlayer2Id}
            players={allPlayers()}
          />
        </div>
      </div>
      <div id="match-history" class="h-48 mt-4">
        MATCH HISTORY
      </div>
    </div>
  );
};

export default HeadToHead;
