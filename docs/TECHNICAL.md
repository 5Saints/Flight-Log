# Flight Log — Technical Documentation

Progressive Web Application. Version: 1.0 | Cache: v13 | June 2026

## 1. Overview

Flight Log is a personal air travel tracking Progressive Web Application (PWA) built as a single self-contained HTML file. It allows the user to log individual flight legs, visualize them on an animated interactive US map, and review year-over-year travel statistics. The app is deployed via GitHub Pages and installable on iOS as a home screen app.

- **Developer:** Personal project — no commercial use
- **Platform:** Progressive Web App (PWA) — iOS Safari, desktop Chrome
- **Deployment:** GitHub Pages
- **Home airport:** DFW (Dallas-Fort Worth)
- **File structure:** Single HTML file + sw.js + manifest.json + 2 icons
- **Total file size:** ~92KB (index.html)
- **Airport database:** 131 airports (US domestic + select international)

## 2. Architecture

The application is intentionally built as a single-file HTML application with no build toolchain, no framework dependencies, and no backend. All state is managed in-browser.

### 2.1 File Structure

- `index.html` — Complete application (HTML + CSS + JavaScript, ~92KB)
- `sw.js` — Service worker for offline caching (cache version: v13)
- `manifest.json` — PWA manifest (name, icons, display mode)
- `icon-192.png` — App icon 192×192 (attitude indicator design)
- `icon-512.png` — App icon 512×512 (attitude indicator design)

### 2.2 External Dependencies

- SheetJS (xlsx.full.min.js v0.18.5) — lazy-loaded on first Excel import only
- Google Fonts — Share Tech Mono, Barlow Condensed (loaded at runtime)
- No framework, no bundler, no npm dependencies at runtime

### 2.3 Data Persistence

- localStorage key: `flightlog_v3`
- Structure: JSON object keyed by year (string), each containing an array of flight records

```json
{ "2025": [ { "from": "DFW", "to": "MCI", "date": "2025-01-19", "miles": 461 }, ... ] }
```

- No server-side storage — all data lives in the browser
- Export produces a JSON file; import merges without duplicating

## 3. Feature Inventory

### 3.1 Map

- SVG-based US map using real GeoJSON state boundaries (PublicaMundi dataset)
- Albers USA projection — bounds: minx=-0.3689, maxx=0.3532, miny=-0.2031, maxy=0.2447
- ViewBox: 960×580. Projection constants are load-bearing — do not modify casually
- DFW home airport shown as persistent red dot with ring marker
- Visited airport dots appear as flights are logged (scoped to selected year)
- Airport labels (13px, dark outline stroke) visible only during active playback flight
- State paths rendered from embedded GeoJSON-derived SVG path data

### 3.2 Flight Entry

- Modal sheet slides up from bottom — does not shrink map
- FROM / TO fields: 3-letter IATA codes, auto-uppercase, autocorrect disabled
- Date field: native iOS date picker
- Airport chip strip: top 5 favorites (gold) + 10 most recent (blue-gray)
- Chips auto-advance FROM → TO → Date on each tap
- Edit mode: tapping pencil icon on any flight pre-fills modal
- Mileage: great circle distance (haversine formula), radius 3958.8 miles

### 3.3 Playback

- Flights animate in chronological order for the selected year
- Arc drawn using SVG stroke-dashoffset technique
- Plane dot tracks along quadratic bezier curve
- Duplicate routes drawn only once (canonical key: sorted airport pair)
- Airport origin appears before arc; destination appears when arc lands
- Labels for active flight fade in/out during each leg
- Mileage, flight count, airports, and hours counters increment in real time
- Play / Pause / Stop controls — stop fully resets all state
- Speed slider: 1×–5× (affects animation duration and inter-flight delay)
- Panels close automatically when play is pressed
- Year change during playback triggers automatic stop

### 3.4 Statistics Overlay (top-left)

- Total miles (real-time during playback)
- Flight count
- Unique airport count
- Estimated hours in air: `(miles / 500) + (flights × 0.9)`
- All stats scoped to selected year; update dynamically during playback

### 3.5 Data Import / Export

- Export: downloads `flightlog_YYYY.json` (full multi-year dataset)
- Import JSON: re-merges exported file, deduplicates on from+to+date
- Import Excel (AAdvantage Activity): parses Type=Flights rows, Description as XXX-YYY route
- Import Excel (template): FROM/TO/DATE/MILES columns, auto-detects header row
- Date parsing handles Excel serial numbers, datetime strings, and ISO strings
- Airport codes stripped of non-alpha characters before lookup (handles trailing spaces)
- SheetJS loaded lazily — only fetched when an .xlsx file is selected

### 3.6 PWA / Mobile

- Installable on iOS via Safari → Add to Home Screen
- Service worker caches all assets for offline use
- Cache versioning: increment `CACHE` constant in `sw.js` to force update on all devices
- `viewport-fit=cover` with `env(safe-area-inset-top)` for notch/status bar handling
- Landscape mode: header and tab bar hidden, map fills screen, optimized for playback
- Touch targets: minimum 44px for all interactive controls

## 4. Known Issues & Technical Debt

### 4.1 Known Limitations

- Single HTML file architecture — all logic, styles, and airport data in one file (~92KB). Maintainable at current scale but will become unwieldy if features grow significantly.
- Airport database is hand-curated (131 airports). Missing airports must be added manually with projected x/y coordinates derived from the Albers USA formula.
- Label collision in dense areas (Northeast US) — no collision detection implemented. Labels only show during active playback which mitigates this in practice.
- localStorage is the only persistence layer — clearing browser data loses all flight history. Export before clearing.
- Video export not implemented. Landscape + screen recording is the current workaround.
- International airports use manually placed x/y coordinates near map edges rather than true projected positions.

### 4.2 Technical Debt

- Duplicate CSS rules exist for `#speed-label` (lines 40-41 in current build) — harmless but should be cleaned up.
- The Albers USA projection is reimplemented in JavaScript rather than using D3.js. This is intentional (no dependency) but means any projection changes require manual recalculation of all airport coordinates.
- No unit tests. The app has been developed iteratively with manual mobile testing.
- AAdvantage import date parsing handles multiple date formats with a cascade of try/catch — could be consolidated.

## 5. Airport Database

131 airports are stored as inline JavaScript objects with SVG x/y coordinates (Albers USA projection, viewBox 960×580) and lat/lon for distance calculation.

### 5.1 Projection Formula

All airport positions must be calculated using the same Albers USA projection used for the state boundaries:

```
minx=-0.3689, maxx=0.3532, miny=-0.2031, maxy=0.2447
W=920, H=520, PADX=20, PADY=20
px = (x - minx)/(maxx-minx) * W + PADX
py = H + 2*PADY - ((y - miny)/(maxy-miny) * H + PADY)
```

Using different bounds will misplace airports on the map. These constants were derived from the PublicaMundi GeoJSON dataset and must not be changed without recalculating all airport positions.

### 5.2 Adding New Airports

To add a new airport, calculate its projected x/y using the formula above with the correct bounds, then add an entry to the `AIRPORTS` object:

```
XYZ:{x:123.4,y:456.7,lat:34.5678,lon:-98.7654},
```

The lat/lon values are used for haversine distance calculation. The x/y values must be derived from the same projection as the map.

## 6. Deployment

### 6.1 GitHub Pages

- Repository: public GitHub repo
- Branch: `main`, root directory
- URL pattern: `https://username.github.io/repo-name`
- Deploy: upload files via GitHub web UI or `git push` — Pages rebuilds automatically

### 6.2 Updating the PWA Cache

Every deployment that changes `index.html` must also increment the cache version in `sw.js`. Failing to do this leaves installed PWAs on stale cached content.

```js
const CACHE = 'flightlog-v14'; // increment on every deploy
```

The service worker's activate event deletes all caches except the current version, forcing a fresh fetch on the user's next app open.

### 6.3 Deploy Checklist

- [ ] Increment `CACHE` version in `sw.js`
- [ ] Upload `index.html` and `sw.js` to GitHub
- [ ] Confirm green checkmark in Actions tab
- [ ] Force-refresh in Safari to verify (pull down on page)
- [ ] Test on device after PWA cache update (close and reopen app)

## 7. Function Reference

### 7.1 Data

- `loadFlights()` — reads localStorage, returns parsed JSON object
- `saveFlights(data)` — serializes and writes to localStorage
- `getYearFlights(year)` — returns sorted array of flights for a given year
- `getMiles(apA, apB)` — haversine great circle distance in miles
- `populateYears()` — rebuilds year selector dropdown

### 7.2 Map

- `drawMap()` — renders state SVG paths and ocean background
- `drawHomeMarker()` — renders DFW red dot and ring
- `addAirportMarker(code)` — adds dot + label for a visited airport
- `showFlightLabels(from, to)` — makes only the active flight's labels visible
- `hideAllLabels()` — hides all airport labels
- `renderVisitedAirports()` — clears and redraws all visited airport markers
- `getVisitedCodes()` — returns Set of airport codes from current year's flights

### 7.3 Animation

- `animateFlight(from, to, onProgress, onComplete)` — draws arc + moves plane dot
- `arcCP(x1,y1,x2,y2)` — calculates quadratic bezier control point (lifts arc upward)
- `bezierPt(x1,y1,cx,cy,x2,y2,t)` — point on quadratic bezier at parameter t
- `clearArc()` — removes current animating arc and hides plane dot
- `freezeArc()` — converts animating arc to static-arc class; deduplicates by route key
- `clearPlaybackArcs()` — removes all frozen static arcs from DOM

### 7.4 Playback

- `pbPlayFlight()` — plays the next flight in the queue; handles pause state
- `stopPlayback()` — cancels animation frame, resets all playback state
- `setPlayBtn(state)` — updates play/stop button appearance ('play'|'pause'|'done')

### 7.5 UI

- `updateMileCount(value, pbFlights?)` — updates all four stat displays
- `renderList()` — rebuilds All Flights panel for current year
- `deleteFlight(year, idx)` — removes flight by raw index, saves, re-renders
- `openEditModal(year, idx)` — pre-fills modal with existing flight data
- `resetModal()` — clears edit state, restores Add Flight defaults
- `openModal()` / `closeModal()` — shows/hides add flight modal sheet
- `renderChips()` — builds favorites + recents airport chip strip
- `getChipAirports()` — returns `{favorites[5], recents[10]}` airport code arrays
- `addFlight()` — validates form, adds or updates flight, saves, closes modal
- `showToast(msg, duration?)` — displays ephemeral notification
- `formatDate(dateStr)` — converts YYYY-MM-DD to "JAN 15" format

### 7.6 Import

- `importJSON(text)` — parses and merges exported JSON file
- `importAAdvantage(buffer)` — auto-detects template vs AAdvantage format, dispatches
- `importTemplate(rows, headerIdx)` — handles FROM/TO/DATE/MILES template format
- `importAAdvantageRows(rows, headerIdx)` — handles AAdvantage Activity export format
- `mergeFlights(data)` — deduplicates and merges imported data into allFlights

## 8. Import Formats

### 8.1 JSON (App Export)

Produced by the Export button. Structure: year-keyed object of flight arrays.

```json
{ "2025": [{"from":"DFW","to":"MCI","date":"2025-01-19","miles":461}] }
```

### 8.2 Flight Log Excel Template

Custom template with columns: FROM, TO, DATE, MILES (optional). Header detection looks for a row containing both FROM and TO. Rows 1-2 are title/instruction rows and are skipped. Dates accepted as ISO strings, datetime strings, or Excel serial numbers. MILES column left blank triggers auto-calculation.

### 8.3 AAdvantage Activity Export

American Airlines AAdvantage Activity download (.xlsx). Detection: looks for a row containing "Activity Date". Filters: Type = "Flights" only. Route parsed from Description column as XXX-YYY. Mileage calculated from coordinates, not from AAdvantage miles column.

## 9. Design System

### 9.1 Color Palette

- `--bg`: `#04080f` (page background)
- `--surface`: `#080e1a` (panels, header)
- `--border`: `#1a2a3a` (borders)
- `--accent`: `#00c8ff` (cyan — primary interactive color)
- `--accent2`: `#e03030` (red — home marker, delete actions)
- `--text`: `#d0e8f0` (primary text)
- `--muted`: `#4a6070` (secondary text)
- `--land`: `#0d2230` (map state fill)
- `--land-border`: `#1e3f55` (map state stroke)

### 9.2 Typography

- Share Tech Mono — monospace display font (stats, labels, codes, inputs)
- Barlow Condensed — sans-serif UI font (buttons, tabs)

### 9.3 Layout

- Portrait: header → map (flex:1) → tab bar → panels
- Landscape (<500px height): header hidden, tab bar hidden, panels hidden — map fills screen
- Modal sheet slides up over map — map never shrinks for flight entry
- Safe area insets applied: top (status bar), bottom (home indicator)

## 10. iOS App (Capacitor)

The web app is wrapped, unmodified, into a native iOS project using [Capacitor](https://capacitorjs.com) rather than rewritten. This keeps `index.html` as the single source of truth for both the GitHub Pages PWA and the App Store build.

### 10.1 How it fits together

- `capacitor.config.json` — `appId` (bundle identifier), `appName`, `webDir` (`www`), WebView background color.
- `scripts/build-www.js` — copies `index.html`, `sw.js`, `manifest.json`, and the icons into `www/`. `www/` is generated (gitignored), never edited directly.
- `ios/` — native Xcode project created by `npx cap add ios`. Committed to the repo. Uses Swift Package Manager for the Capacitor runtime (no CocoaPods).
- `ios/App/App/public/` — Capacitor's copy of `www/` inside the Xcode project. Regenerated by `npx cap sync`, gitignored.

### 10.2 Workflow

```bash
npm run build:www   # copies root web assets into www/
npm run cap:sync    # build:www, then npx cap sync (updates ios/App/App/public)
npm run ios:open    # cap:sync, then opens the Xcode project
```

Building an `.ipa` and running on a simulator/device requires Xcode and a Mac; this repo only carries the buildable source, not build artifacts.

### 10.3 App icon and launch screen

Generated from `icon-512.png`: flattened onto the app's background color (`#04080f`, no alpha, since App Store icons must be opaque) and upscaled to 1024×1024 for `ios/App/App/Assets.xcassets/AppIcon.appiconset/`. The launch screen (`Assets.xcassets/Splash.imageset/`) centers the same icon on the same background color. Regenerate both if the app icon changes.

### 10.4 Before submitting to the App Store

- Replace the placeholder `appId` (`com.saints5.flightlog`) in `capacitor.config.json` with a bundle identifier registered to your own Apple Developer account, then run `npm run cap:sync`.
- Set the code signing team and provisioning in Xcode (`ios/App/App.xcodeproj`).
- Verify the service worker registers correctly under Capacitor's `capacitor://localhost` origin on-device — this hasn't been device-tested yet.
