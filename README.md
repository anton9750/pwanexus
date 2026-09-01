# Nexus Hub

Personal all-purpose command center dashboard — works as a **Progressive Web App** you can install from the website.

## Features

- **Install from the web** — PWA: home-screen icon, standalone window, offline shell
- **Google Search** — Type anything and jump straight to Google results
- **Quick Links** — YouTube, Netflix, Spotify, X/Twitter, Instagram, Facebook, Steam, Amazon, and more
- **Files & Images** — Drag & drop workspace; files stored in browser IndexedDB (per device)
- **Notes** — Two-pane local notes editor with Share
- **Tasks** — To-dos with priority levels
- **Bookmarks** — Save and tag links
- **Spotify Music** — Paste any Spotify link to embed and listen; embeds saved locally
- **Stock Market** — Live-feel ticker board with links to Yahoo Finance charts
- **YouTube** — Search and watch embedded videos (cast via player / browser controls)
- **Weather** — City search + 7-day forecast via Open-Meteo (no API key)
- **Tools** — Calculator, unit converter, password generator, color picker, QR code, world clock, pomodoro timer
- **Repos** — Browse public GitHub repositories
- **Theme** — Dark / light mode toggle
- **Command palette** — Press `Ctrl/⌘ K` to jump anywhere or run actions
- **Settings** — Install app, share link, export/import all local data as JSON backup, clear data, cast tips

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build & deploy (so people can load the app from your website)

```bash
npm run build
```

Deploy the `dist/` folder to any static host:

- **Vercel**: `npx vercel`
- **Netlify**: drag `dist` or connect the repo
- **GitHub Pages**, Cloudflare Pages, Firebase Hosting, etc.

After deploy, visitors can:

1. Open your URL
2. Go to **Settings** → **Install app**, or use the browser install prompt / “Add to Home Screen”
3. Use **Share** to send the link to others
4. **Export backup** / **Import backup** to move data between devices

## PWA notes

- Service worker (`/sw.js`) caches the app shell for offline use.
- Manifest is at `/manifest.webmanifest`.
- Install works best over **HTTPS** (localhost is fine for testing).

## Cast

YouTube embeds expose the official cast control when the browser/device supports it. Spotify casting is best from the Spotify app. Chrome’s “Cast…” menu can mirror the tab.

## Notes

- All personal data (files, notes, tasks, bookmarks, Spotify embeds) lives on the current browser/device only unless you export it.
- Stock prices are simulated for demo purposes. Connect a free market data API for live quotes.
- Spotify full OAuth login is not included; embed players work without an account key.
- Weather uses the free Open-Meteo APIs. QR codes use api.qrserver.com.
