# Flight Log

A personal air-travel tracking Progressive Web App. Log flight legs, watch them animate on an interactive US map, and review year-over-year travel stats.

Built as a single self-contained HTML file — no framework, no build step, no backend. Installable on iOS as a home-screen app.

## Features

- **Interactive map** — SVG US map (real GeoJSON state boundaries, Albers USA projection) with a home airport marker and visited-airport dots
- **Flight entry** — quick-add modal with favorite/recent airport chips, edit-in-place, great-circle mileage
- **Playback** — flights animate in chronological order along bezier arcs, with live mile/flight/airport/hours counters
- **Import/export** — JSON round-trip, plus Excel import for a custom template and for AAdvantage Activity exports
- **PWA** — offline-capable via service worker, installable to a home screen, landscape mode optimized for playback

## Project structure

```
index.html       Complete application (HTML + CSS + JS)
sw.js            Service worker / offline cache (bump CACHE version on every deploy)
manifest.json    PWA manifest
icon-192.png     App icon 192x192
icon-512.png     App icon 512x512
docs/            Technical documentation
```

## Getting started

This app has no build step. To work on it locally, serve the directory with any static file server (a service worker requires HTTP, not `file://`):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

Deployed via GitHub Pages from the `main` branch root. Every deploy that changes `index.html` must also bump the `CACHE` constant in `sw.js`, or installed PWAs will keep serving stale cached content. See [`docs/TECHNICAL.md`](docs/TECHNICAL.md#6-deployment) for the full deploy checklist, and the CI check in `.github/workflows/` that flags a missed bump.

## Documentation

Full architecture, feature inventory, known issues, airport-database format, and function reference: [`docs/TECHNICAL.md`](docs/TECHNICAL.md).

## Status

Personal project, not for commercial use. See [`LICENSE`](LICENSE).
