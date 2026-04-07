import { statsDb } from "@/lib/stats-db";

// Cached avatar manifest
let avatarManifest: Record<string, string> | null = null;

async function loadAvatarManifest(): Promise<Record<string, string>> {
  if (!avatarManifest) {
    try {
      const response = await fetch("/img/avatar/manifest.json");
      if (!response.ok) {
        console.warn("Avatar manifest not found, avatars will not load");
        avatarManifest = {};
      } else {
        avatarManifest = await response.json();
      }
    } catch {
      console.warn("Failed to load avatar manifest");
    }
  }
  if (avatarManifest === null) {
    avatarManifest = {};
  }
  return avatarManifest;
}

/** Ensure avatar manifest is loaded. Call this early in app lifecycle. */
export async function ensureAvatarManifest(): Promise<void> {
  await loadAvatarManifest();
}

export interface PlayerSocials {
  twitch: string | null;
  youtube: string | null;
}

export class Player {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  getName(): string | undefined {
    return statsDb().playerName(this.id);
  }

  getSocials(): PlayerSocials | undefined {
    const rows = statsDb().query<{
      twitch: string | null;
      youtube: string | null;
    }>(`SELECT twitch, youtube FROM players WHERE player_id = ${this.id}`);
    if (rows.length === 0) return undefined;
    return rows[0];
  }

  /** Get avatar URL asynchronously. Loads manifest if needed. */
  async getAvatarUrl(): Promise<string | undefined> {
    if (typeof window === "undefined") return undefined;
    const manifest = await loadAvatarManifest();
    const ext = manifest[this.id];
    if (!ext) return undefined;
    return `/img/avatar/${this.id}${ext}`;
  }

  /**
   * Get avatar URL synchronously. Returns undefined if manifest not loaded yet.
   * Call ensureAvatarManifest() first to ensure the manifest is loaded.
   */
  getAvatarUrlSync(): string | undefined {
    if (!avatarManifest) return undefined;
    const ext = avatarManifest[this.id];
    if (!ext) return undefined;
    return `/img/avatar/${this.id}${ext}`;
  }
}
