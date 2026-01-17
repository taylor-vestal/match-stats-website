# Match Stats Website

## Project Overview

A static site for displaying match statistics, built with Astro and SolidJS, hosted on Cloudflare Pages.

## Tech Stack

- **Framework**: Astro 5.x
- **UI Library**: SolidJS
- **UI Components**: Solid-UI (shadcn/ui port for Solid)
- **Styling**: Tailwind CSS 3.x (v4 has Astro and Biome compatibility issues; revisit later)
- **Linting**: Biome
- **Formatting**: Prettier
- **Git Hooks**: Lefthook
- **Database**: SQLite via @sqlite.org/sqlite-wasm (in-browser)
- **Hosting**: Cloudflare Pages (static)

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run Biome linting
npm run lint:fix      # Fix lint issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm run check         # Run lint + format check
```

## Project Structure

```
src/
├── components/        # Astro/Solid components
├── layouts/           # Page layouts
│   └── Layout.astro
├── lib/
│   ├── db/            # Database layer
│   │   └── stats-db.ts
│   └── stats/         # Statistics system
│       ├── index.ts   # Registry and exports
│       ├── types.ts   # NumericStatistic, StatisticalContext
│       ├── utils.ts   # buildWhere helper
│       └── offense.ts # Stat definitions
└── pages/             # File-based routing
    ├── index.astro
    ├── players.astro
    ├── player.astro
    ├── matches.astro
    ├── match.astro
    ├── compare.astro
    └── lb.astro
public/
└── nestris-db.sqlite3  # SQLite database (served statically)
```

## Routes

All dynamic data is passed via query parameters (static site compatible).

- `/` - Home page with navigation
- `/players` - List of all players
- `/player?id=X` - Individual player stats
- `/matches` - List of all matches
- `/match?id=X` - Individual match details
- `/compare?player1=X&player2=Y` - Player comparison
- `/lb` - Leaderboard

## Database

The site uses an in-browser SQLite database via `@sqlite.org/sqlite-wasm`.

```typescript
import { statsDb } from "@/lib/db/stats-db";

// All methods are synchronous after module import
const results = statsDb.query("SELECT ...");
const names = statsDb.playerNames(); // cached after first call
const name = statsDb.playerName(123);
```

- **Development**: Fetches `/nestris-db.sqlite3` from public/
- **Production**: TODO (not yet implemented)
- Database is loaded once (singleton via top-level await) and kept in memory
- Common lookups (e.g., `playerNames()`) are lazy-loaded and cached
- **Important**: Database must use DELETE journal mode, not WAL (convert with `sqlite3 db.sqlite3 "PRAGMA journal_mode=DELETE; VACUUM;"`)

## Statistics

Statistics are defined as objects implementing `NumericStatistic`:

```typescript
import { statsDb } from "@/lib/db/stats-db";
import { allStats, getStat } from "@/lib/stats";
import type { StatisticalContext } from "@/lib/stats/types";

// Evaluate a statistic
const winsStat = getStat("match_wins")!;
const ctx: StatisticalContext = { filters: {} };
const results = winsStat.evaluate(statsDb, ctx);

// With filters
const eventCtx: StatisticalContext = { filters: { eventIds: ["ctwc-2024"] } };
const filtered = winsStat.evaluate(statsDb, eventCtx);

// For a single player
const playerCtx: StatisticalContext = { filters: {}, playerId: 123 };
const playerResults = winsStat.evaluate(statsDb, playerCtx);
```

Add new stats to `src/lib/stats/` and register them in `index.ts`.

## Code Style

- Biome for linting, Prettier for formatting
- Run `npm run check` before committing
- Lefthook runs pre-commit hooks automatically

## Solid-UI Components

This project uses [Solid-UI](https://www.solid-ui.com/), a port of shadcn/ui for SolidJS.

### Adding Components

```bash
npx solidui-cli@latest add <component-name>
```

Examples:

```bash
npx solidui-cli@latest add button
npx solidui-cli@latest add card
npx solidui-cli@latest add table
```

Components are installed to `src/components/ui/`.

### Using Components

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Theming

Theme variables are defined in `src/styles/global.css`. The theme supports light/dark mode via CSS variables (e.g., `--background`, `--foreground`, `--primary`).

### Path Alias

Use `@/` to import from `src/`:

```tsx
import { Button } from "@/components/ui/button";
import { statsDb } from "@/lib/db/stats-db";
```
