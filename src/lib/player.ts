import { statsDb } from "./stats-db";

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

export class Player {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  getName(): string | undefined {
    const db = statsDb();
    if (!db) return undefined;
    return db.playerNames().get(this.id);
  }

  async getAvatarUrl(): Promise<string | null> {
    const manifest = await loadAvatarManifest();
    const ext = manifest[this.id];
    if (!ext) return null;
    return `/img/avatar/${this.id}${ext}`;
  }
}
