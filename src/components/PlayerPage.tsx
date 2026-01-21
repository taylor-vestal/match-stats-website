import {
  createSignal,
  createResource,
  createMemo,
  onMount,
  type Component,
} from "solid-js";
import { cn } from "@/lib/utils";
import { Player } from "@/lib/player";
import { statsDb } from "@/lib/stats-db";
import { PlayerAvatar, PlayerSelect } from "@/components/PlayerPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "@/styles/PlayerPage.css";

const PlayerPage: Component = () => {
  const [playerId, setPlayerId] = createSignal<number | null>(null);

  // Read URL on mount - handles both initial load and client-side navigation
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");
    setPlayerId(p ? Number(p) : null);
  });

  const [avatarUrl] = createResource(playerId, (id) =>
    new Player(id).getAvatarUrl()
  );

  const allPlayers = createMemo(() => {
    const db = statsDb();
    if (!db) return [];
    const names = db.playerNames();
    return Array.from(names.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const handlePlayerChange = (id: number) => {
    setPlayerId(id);
    history.replaceState(null, "", `/player?p=${id}`);
  };

  return (
    <main
      class={cn(
        "player-page",
        "flex flex-col gap-4 p-4 min-h-[calc(100vh-60px)]"
      )}
    >
      <header
        class={cn("player-header", "grid gap-6 items-center p-4", "bg-card")}
      >
        <aside class="flex flex-col items-center gap-2">
          <PlayerAvatar
            url={avatarUrl()}
            alt="Player avatar"
            class="w-40 h-40 rounded-md overflow-hidden m-0"
          />
          <PlayerSelect
            value={playerId()}
            onChange={handlePlayerChange}
            players={allPlayers()}
          />
          <div class="text-xs text-muted-foreground">Social Icons</div>
        </aside>
        <div class={cn("player-key-stats", "flex gap-8 justify-center")}>
          <div class="flex flex-col items-center gap-1">
            <span class="text-xs text-muted-foreground uppercase">
              2025 FMS
            </span>
            <span class="text-xl font-bold font-mono text-foreground">
              9,999,999
            </span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-xs text-muted-foreground uppercase">
              2025 F29%
            </span>
            <span class="text-xl font-bold font-mono text-foreground">
              99.9%
            </span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-xs text-muted-foreground uppercase">
              2025 FM29S
            </span>
            <span class="text-xl font-bold font-mono text-foreground">
              999,999
            </span>
          </div>
        </div>
        <aside
          class={cn("flex items-center justify-center", "max-md:hidden")}
        ></aside>
      </header>

      <Tabs defaultValue="career" class="flex-1 flex flex-col">
        <TabsList class="w-fit">
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="event">Event</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
        </TabsList>

        <TabsContent value="career" class="flex-1 flex flex-col gap-4">
          <section
            class={cn(
              "p-4 overflow-x-auto",
              "bg-card rounded-md border border-border"
            )}
          >
            <div class="p-8 rounded-md text-center bg-muted text-muted-foreground">
              Career Stats Table (Years 2017-2024)
            </div>
          </section>

          <div class="flex flex-wrap gap-4">
            <div
              class={cn(
                "flex-1 min-w-[200px] p-4",
                "bg-card rounded-md border border-border"
              )}
            >
              <h3 class="mb-2 text-sm font-semibold text-foreground">
                Custom Stat Range Setup
              </h3>
              <div
                class={cn(
                  "p-2 rounded-md text-center",
                  "bg-muted text-xs text-muted-foreground"
                )}
              >
                Filters
              </div>
            </div>
          </div>

          <section class={cn("py-3 px-4 rounded-md bg-green-600")}>
            <div class="text-center text-white font-medium">
              Custom Stats Summary Row
            </div>
          </section>
        </TabsContent>

        <TabsContent value="event" class="flex-1 flex flex-col gap-4">
          <section
            class={cn(
              "p-4 overflow-x-auto",
              "bg-card rounded-md border border-border"
            )}
          >
            <div class="p-8 rounded-md text-center bg-muted text-muted-foreground">
              Event Stats Table (to be implemented)
            </div>
          </section>
        </TabsContent>

        <TabsContent value="games" class="flex-1 flex flex-col gap-4">
          <div class="flex flex-wrap gap-4">
            <div
              class={cn(
                "flex-1 min-w-[200px] p-4",
                "bg-card rounded-md border border-border"
              )}
            >
              <h3 class="mb-2 text-sm font-semibold text-foreground">
                Custom Stat Range Setup
              </h3>
              <div
                class={cn(
                  "p-2 rounded-md text-center",
                  "bg-muted text-xs text-muted-foreground"
                )}
              >
                Filters
              </div>
            </div>
            <div
              class={cn(
                "flex-1 min-w-[200px] p-4",
                "bg-card rounded-md border border-border"
              )}
            >
              <h3 class="mb-2 text-sm font-semibold text-foreground">
                Game History Setup
              </h3>
              <div
                class={cn(
                  "p-2 rounded-md text-center",
                  "bg-muted text-xs text-muted-foreground"
                )}
              >
                Filters
              </div>
            </div>
          </div>

          <section
            class={cn(
              "flex-1 p-4 overflow-x-auto",
              "bg-card rounded-md border border-border"
            )}
          >
            <div class="p-8 rounded-md text-center bg-muted text-muted-foreground">
              Game History Table
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default PlayerPage;
