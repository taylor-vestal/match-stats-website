import { statsDb } from "./stats-db";

class Player {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  getName() {
    return statsDb.playerNames().get(this.id);
  }
  getAvatarUrl(): string {
    return `/img/avatar/${this.id}`;
  }
}
