# Handoff: SentinelLog 3D Redesign

## Overview
A 3D-styled redesign of SentinelLog, an open-source SIEM-lite dashboard for monitoring server logs (auth, nginx, sudo) and surfacing security alerts. Covers all 5 screens of the existing Flask app: Login, Dashboard, Alerts (list + detail), Blocked IPs, and New Monitor / live Monitor session.

## About the Design Files
The bundled file (`SentinelLog-3D-reference.dc.html`) is a **design reference**, not production code. It was authored in a proprietary internal templating format (custom `{{ }}` bindings, `<x-dc>` wrapper, a `support.js` runtime) that only renders inside the design tool it was built in — **this is why Claude Code can't load or execute it directly.** Do not try to run it as-is or copy its markup verbatim.

Treat it as an HTML/CSS/JS *reference* to read for exact colors, spacing, copy, and structure, then **recreate the design inside SentinelLog's actual Flask/Jinja templates** (`templates/*.html` + `base.html`'s existing CSS variable system), replacing the current gold/teal light theme with the dark 3D theme described below. All data displayed (alerts, sessions, blocks, live feed) should be wired back to SentinelLog's real Flask routes/APIs (`/api/sessions`, `/api/alerts`, SSE stream, etc.) — the reference file uses fake mock data and a `setInterval` simulation for demo purposes only.

## Fidelity
**High-fidelity.** Colors, type, spacing, and copy below are final. Recreate pixel-perfectly using the existing Jinja templates and vanilla CSS/JS already in the codebase (no new framework needed — the current app is server-rendered Flask + vanilla JS/SSE).

## Design Tokens

**Colors**
- Background: `#0B0D12` (near-black graphite)
- Surface (cards/panels): `#151922`
- Surface 2 (inputs, inner tiles): `#1C212C`
- Dark nav/terminal bg: `#0E1117`, terminal well: `#05060A`
- Border: `rgba(255,255,255,.08)`, strong border: `rgba(255,255,255,.15–.18)`
- Text primary: `#EDEFF3`
- Text muted: `#8A8F9C`
- Green accent (primary / safe / brand): `#4ADE9C`, deep `#1F8F63`, bg tint `rgba(74,222,156,.14–.15)`
- Cyan accent (secondary / info): `#4FC3E8`, deep `#1E7FA8`, bg tint `rgba(79,195,232,.14–.15)`
- Red (critical): `#F0564A`, bg tint `rgba(240,86,74,.15)`
- Amber (warning): `#E8B34F`, bg tint `rgba(232,179,79,.15)`

**Typography**
- Display/headings: `Outfit` (weights 500–800), letter-spacing -0.02em on titles
- Body: `Source Sans 3` (weights 400–700)
- Monospace (log/terminal text): `ui-monospace` / system monospace stack
- Page title: 25px/700. Card section labels: 10.5–11px/700, uppercase, 0.08–0.1em letter-spacing. Metric values: 26–30px/700.

**Shape & depth (the "3D" signature)**
- Border radius: 14–16px on cards/panels, 10px on buttons/inputs, 20px+ (pill) on badges
- Every card/panel/metric tile uses a **layered hard-edge box-shadow** to read as an extruded 3D block sitting above the background, e.g.:
  `box-shadow: 6px 6px 0 #05060A, 12px 12px 0 #020304, 0 20px 40px rgba(0,0,0,.35)` (larger cards)
  `box-shadow: 4px 4px 0 #05060A, 8px 8px 0 #020304, 0 16px 32px rgba(0,0,0,.3)` (metric tiles, smaller offset)
  On hover, the panel lifts: `transform: translate(-3px,-3px)` and the shadow offsets increase by ~50%.
- A fixed, full-bleed **isometric grid floor** sits behind all content: two diagonal 1px line-gradients (green + cyan tinted, ~30deg/-30deg) plus a vertical line-gradient, `background-size: 64px 110px`, tilted via `perspective(700px) rotateX(58deg)`, faded to transparent upward via a mask gradient, positioned along the bottom third of the viewport, `pointer-events:none`, opacity low (~0.1–0.15 effective).
- **Logo**: a circular medallion with a shield-check glyph, continuously animating — `rotateY` oscillating roughly ±32deg with a slight `rotateX` counter-tilt (never reaching 90deg, so the face never flips out of view), via `perspective` + `transform-style: preserve-3d`. A slightly darker/smaller disc sits behind it (`translateZ(-4px to -10px)`) to suggest thickness. Front face: green radial gradient (`#8CF4C7` → `#4ADE9C`), back plate: `#0D5A3F` with a `#17703F` ring outline. Used at 3 sizes: ~30px (nav bar + login form header), ~170px (login hero).

## Screens

### 1. Login
- Full-viewport dark screen, centered content, isometric grid floor behind.
- Large (170px) rotating logo medallion on the left, wordmark "SentinelLog" (Outfit 20px/700) + login card on the right.
- Login card: `#151922` panel, 16px radius, extruded shadow, 340px wide. Fields: Username, Password (uppercase 11px/700 muted labels, dark `#1C212C` inputs, cyan focus ring). Primary button: solid green `#4ADE9C`, dark text, hover → deep green `#1F8F63` with white text.
- Footnote: "Demo prototype — any credentials work" (remove/replace with real copy in production, since real login has server-side auth).

### 2. Dashboard
- Sticky top nav (64px, `#0E1117`): small rotating logo + wordmark on the left, nav links (Dashboard / Alerts / Blocked IPs / New Monitor — icon + label, active state = green tinted background + green text) center, "Engine online" status pill (green pulsing dot, `white-space:nowrap`) + logout icon on the right.
- Page header: "Dashboard" title + dynamic subtitle ("Monitoring N log sources · last updated just now").
- 4-column metric tile row: Active monitors, Critical alerts, Suspicious logins, Events processed — icon+label header, big colored number, muted sub-label.
- Two-column row: "Recent alerts" card (icon + title + truncated description + relative time, click → alert detail) and "Monitor sessions" card (icon + session name + mode/event count + live/replay pill, click → monitor view).
- Full-width "Live event feed" panel styled as an embedded terminal: monospace lines, colored by event type (green = success, red = failure/404, amber = sudo), timestamp in dim gray, newest line on top, auto-scrolling, capped list length.

### 3. Alerts (list)
- Header: "Alerts" + count of total alerts.
- Stacked list of alert cards (one per alert), each: severity icon in a tinted rounded square (red=critical, amber=high, cyan=info), title + severity pill, description, meta row (source IP / username / relative time), "View →" affordance on the right. Whole card clickable → detail. Hover lifts the card slightly.

### 4. Alert detail
- Back link ("← Back to alerts").
- Header card: severity icon, title, description, severity pill top-right; meta strip (source IP, account, event count, time) with top/bottom dividers; an "AI triage" callout box (green-tinted, green heading) with a plain-language verdict.
- Separate terminal-style panel below: "Raw log evidence" — monospace, red-tinted log lines exactly as captured.

### 5. Blocked IPs
- Header: "Blocked IPs" + count.
- Stacked cards per block: ban/clock-off icon, monospace IP address, active/expired pill, "offense #N" amber pill, note text, meta row (blocked-at relative time, duration).

### 6. New Monitor
- Header + single centered form card (max-width ~560px).
- "Mode" section: two selectable mode cards side by side (Replay sample log / Tail real file) — selected state = green border + tinted background + green icon chip.
- "Log type" section: a select (SSH/Auth, Nginx/Apache, Sudo).
- Primary "Start monitoring" button (full width, green, same hover treatment as login button) → navigates to the Monitor session view.

### 7. Monitor (live session)
- Header: "Monitor — {session name}" + mode/event-count subtitle; Stop/Resume toggle button on the right (red-tinted when live/stoppable, green when resumable).
- 4-column metric row: Lines processed, Auth failures, Auth successes, Alerts fired.
- Two-column layout: large terminal-style live log feed panel (left) + "Live alerts" list panel (right, compact alert rows, click → detail).

## Interactions & Behavior
- Nav is a simple client-side view switch (no full page reloads in the reference); in Flask this maps to actual page navigation between routes, as in the current app.
- Cards/metrics/list rows: hover lifts the element via `translate(-2px to -3px)` and deepens the extruded shadow — apply as a CSS `:hover` transition (`transform, box-shadow 0.2s`).
- Buttons: solid green primary buttons darken to `#1F8F63` with white text on hover.
- Live feed: new lines should insert at the top and animate in (fade + slide from left, ~0.4s ease-out), capped at a reasonable max length with old lines dropped from the bottom — mirrors the existing app's real SSE-driven feed behavior, just restyled.
- Status "Engine online" pill's dot pulses (opacity 1 → 0.35 → 1, 2s loop).
- Logo medallion animates continuously and independent of user interaction (looping wobble, ~5s ease-in-out).

## State Management
This is cosmetic — SentinelLog's existing state model doesn't change:
- Session list from `/api/sessions`, alerts from `/api/alerts`, blocks from the blocks endpoint, live events via the existing SSE stream per session.
- Selected alert (for detail view) and active session id (for monitor view) are the only "new" pieces of local UI state, matching the current app's routing (`/alerts/<id>`, `/monitor/<id>`).

## Assets
- Icons: Tabler Icons webfont (`@tabler/icons-webfont`, already used by the current app) — no new icon set introduced.
- Fonts: Google Fonts `Outfit` (500/600/700/800) and `Source Sans 3` (400/500/600/700) — replaces the current Space Grotesk/Inter/JetBrains Mono trio.
- No raster images. The logo is built entirely from CSS (radial gradients + shadows), no exported asset needed.

## Files
- `SentinelLog-3D-reference.dc.html` — full interactive reference covering all 7 screens/states above (read for exact markup/CSS values; do not execute or copy verbatim — see "About the Design Files").
