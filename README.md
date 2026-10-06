# Ben Jam / Brain Kat Records — Website

DJ/label website: Express (TS, run via `tsx`) API server + React 19 / Vite / Tailwind CSS v4 front end. No database — content is served from hand-edited JSON files in `server/data/`.

## Requirements

- Node.js 18+ (20 LTS recommended)
- npm (comes with Node)
- A POSIX-ish shell is assumed for the npm scripts (`cross-env` is used so they also work on Windows)

## Setup

```bash
npm install
```

## Running the dev server

```bash
npm run dev
```

This starts the Express server with Vite running in middleware mode (HMR included) on **http://localhost:5000** (override with a `PORT` env var). There is a single server for both the API and the front end — no separate Vite dev server to run.

Other useful scripts:

```bash
npm run check   # TypeScript type-check (tsc --noEmit), no emit
npm run build   # production build (see below)
npm start        # run the production build (NODE_ENV=production)
```

## Production build

```bash
npm run build
```

This runs `vite build`, which compiles `client/` into static assets at `dist/public/`. There is no separate server build step — `server/` is TypeScript run directly via `tsx` in both dev and prod.

## Deploying to a web server

1. On the server/host, install dependencies and build:
   ```bash
   npm ci
   npm run build
   ```
2. Start the app in production mode:
   ```bash
   npm start
   ```
   This sets `NODE_ENV=production` and runs `server/index.ts` with `tsx`, which serves the built static files from `dist/public/` (via Express `express.static`, with a catch-all falling back to `dist/public/index.html` for client-side routing) and the `/api/*` routes from the same process/port.
3. Configure the port via the `PORT` environment variable (defaults to `5000`). Put a reverse proxy (nginx, Caddy, etc.) in front of this port for TLS/HTTP(S) termination, and run the Node process under a process manager (e.g. `pm2`, `systemd`, or the host's built-in Node process support) so it restarts on crash/reboot.
4. The app needs no database and no external services beyond outbound HTTPS access (used for embeds and any live-feed API calls in `server/mixcloud.ts`, `server/bandcamp.ts`, `server/odysee.ts`). Only `node_modules`, `dist/`, `server/`, `shared/`, and `server/data/*.json` need to exist on the deployed host — `client/` source isn't needed at runtime once built, but is required at build time.
5. Content updates (releases, events, gallery, etc.) are made by editing the JSON files in `server/data/` directly and restarting/redeploying — there is no admin UI or database.

## Project structure

- `client/` — React front end (built with Vite, Tailwind v4)
- `server/` — Express API + static file serving + dev Vite middleware
- `server/data/*.json` — all site content
- `shared/` — TypeScript types shared between client and server
