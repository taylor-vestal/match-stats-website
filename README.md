# Match Stats Website

A static site for displaying match statistics for competitive Classic Tetris. Built with Astro and SolidJS.

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd match-stats-website
```

2. Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:4321`.

## Database Setup

The site requires a SQLite database file to display match statistics.

1. Obtain the database file (e.g. `nestris-db.sqlite3`)
2. Place it in the `public/` directory:

```
public/nestris-db.sqlite3
```

You will also need to create a file named `.env.development` containing the file name (not the full path) of the database file. Look at `.env.development.example` to see how it works.

**Note:** The database must use DELETE journal mode (not WAL). If needed, convert it with:

```bash
sqlite3 nestris-db.sqlite3 "PRAGMA journal_mode=DELETE; VACUUM;"
```

## Avatar Setup

Player avatars are downloaded from a CSV file containing player profile URLs.

1. Obtain the CSV file (exported from the Player Profiles Google Sheet)
2. Run the download script:

```bash
npm run download-avatars "Match Stats Player Profiles - Player Info URLs.csv"
```

This will:
- Download avatar images to `public/img/avatar/`
- Generate a manifest file at `public/img/avatar/manifest.json`

## Build

Build the site for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
