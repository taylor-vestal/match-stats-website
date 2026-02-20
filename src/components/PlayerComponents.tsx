import { type Component, Show, createMemo } from "solid-js";
import { BsFlag, BsTwitch, BsYoutube, BsPersonFill } from "solid-icons/bs";
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
import type { PlayerSocials as PlayerSocialsData } from "@/lib/player";

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

// Icons for the HeadToHead page (vertical layout, includes player link)
export interface PlayerIconsProps {
  class?: string;
  playerId?: number | null;
  socials?: PlayerSocialsData;
}

export const PlayerIcons: Component<PlayerIconsProps> = (props) => {
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

// Smaller horizontal icons for the player page (no player link since we're on it)
export interface PlayerSocialsProps {
  class?: string;
  socials?: PlayerSocialsData;
}

export const PlayerSocials: Component<PlayerSocialsProps> = (props) => {
  const iconClass = "size-6";

  return (
    <div class={`flex w-full justify-evenly ${props.class ?? ""}`}>
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
    </div>
  );
};
