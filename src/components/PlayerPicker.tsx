import { type Component, Show, createMemo } from "solid-js";
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

export type PlayerOption = { id: number; name: string };

export interface PlayerSelectProps {
  value: number | null;
  onChange: (id: number) => void;
  players: PlayerOption[];
}

export interface PlayerAvatarProps {
  url: string | null | undefined;
  alt: string;
  class?: string;
}

export const PlayerAvatar: Component<PlayerAvatarProps> = (props) => {
  return (
    <figure class={props.class ?? "aspect-square mb-4"}>
      <Show when={props.url} fallback={<div class="size-full bg-muted" />}>
        {(url) => (
          <img src={url()} alt={props.alt} class="size-full object-cover" />
        )}
      </Show>
    </figure>
  );
};

export const PlayerSelect: Component<PlayerSelectProps> = (props) => {
  // Compute selected player from props
  const selectedPlayer = createMemo(
    () => props.players.find((p) => p.id === props.value) ?? null
  );

  return (
    <Combobox<PlayerOption>
      value={selectedPlayer()}
      onChange={(val) => val && props.onChange(val.id)}
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
