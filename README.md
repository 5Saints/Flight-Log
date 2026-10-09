# Flight Log

A personal air travel tracker built as a Progressive Web App. Log individual flight legs, watch them animate on an interactive US map, and review year-over-year travel statistics.

Live app: https://5saints.github.io/Flight-Log/

## Features

Flight Log plots each leg as an arc on an SVG map of the United States and plays a year of travel back in chronological order, with running totals for miles, flights, airports visited, and estimated hours in the air. Flights are entered in a slide-up sheet with airport shortcut chips. Starring an airport pins it as a favorite, and the ten most recently used airports appear below. Data can be exported to JSON, and imported from JSON, from an Excel template, or from an American Airlines AAdvantage activity download. Distances are great-circle miles.

The app is installable on iOS and works offline. A banner reminds you to export a backup when none has been made in 30 days.

## Use it on a phone

Open the live link in Safari, tap Share, then Add to Home Screen. All flight data is stored in the browser on that device (localStorage), so each person starts with an empty log. Clearing browser data or removing the app deletes the log, so export a backup from time to time.

## Run it locally

There is no build step and no dependencies to install. Serve the folder over HTTP and open it in a browser. Service workers do not run from `file://` URLs, so a local server is required for offline behavior.

```
python -m http.server 8000
```

Then visit http://localhost:8000.

## Project layout

| Path | Purpose |
| --- | --- |
| `index.html` | The entire app: markup, styles, script, and the airport database |
| `sw.js` | Service worker. Network-first with a cache fallback for offline use |
| `manifest.json` | PWA manifest |
| `icon-192.png`, `icon-512.png` | App icons |
| `tools/airport-coords.html` | Calculator that converts an airport's latitude and longitude into map coordinates |
| `restaurant-picker/` | A separate small PWA that lives in the same repository |

## Deploying

The site is served by GitHub Pages from the `main` branch root. Pushing to `main` publishes the change. Because the service worker fetches from the network first, installed copies pick up new versions the next time they open while online. Bump the `CACHE` name in `sw.js` only when you add or remove files from its `ASSETS` list.

## Customizing

DFW (Dallas-Fort Worth) is hardcoded as the home airport. It appears as the red marker on the map and as the placeholder in the entry form, so search `index.html` for `DFW` to change it.

The map includes 131 airports. To add one, open `tools/airport-coords.html`, enter its latitude and longitude, and paste the generated line into the `AIRPORTS` object in `index.html`. The tool is calibrated for the continental US. Alaska, Hawaii, and international airports are placed by hand near the map edges.

## Technical notes

The map uses an Albers equal-area conic projection (standard parallels 29.5 and 45.5 degrees north, central meridian 96 degrees west) drawn on a 960 by 580 viewBox. State outlines come from the PublicaMundi GeoJSON dataset and are embedded as SVG paths. The airport coordinate tool was fit against the existing airport data and matches it to about 0.2 pixels on average for continental airports. SheetJS (v0.18.5) loads lazily and only when an Excel file is imported. Fonts load from Google Fonts.

Local storage keys:

| Key | Contents |
| --- | --- |
| `flightlog_v3` | Flights, as an object keyed by year |
| `flightlog_favorite_airports` | Airport codes starred as favorites |
| `flightlog_last_export` | Timestamp of the last export |
| `flightlog_export_snooze` | Snooze expiry for the backup reminder |

## License

No license has been specified. All rights are reserved by the author until one is added.
