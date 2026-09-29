# Intellibus Atlas Planner

Source for [atlas-hackathon-planner.vercel.app](https://atlas-hackathon-planner.vercel.app/). The interface is static HTML/CSS/JavaScript. Optional Vercel API functions provide Clerk-verified team access and Neon-backed shared plans; no frontend build step is required.

## Screens and source structure

- `index.html`: the planning command center, verified targets, searchable workstreams and editable lists.
- `atlas-reference.html#people`: the redesigned people directory. The route is retained so existing bookmarks still work. `#transport`, `#direction`, `#outcomes`, `#notebook`, `#web` and `#open` open the other operations sections.
- `scripts/sphere-view.js`: accessible dashboard markup and navigation shortcuts.
- `scripts/sphere.js`: the Three.js scene, native-scroll camera, scene lifecycle and motion preferences.
- `styles/sphere.css`: responsive glass dashboard, cinematic stages and static fallbacks.
- `styles/surfaces.css` and `scripts/surfaces.js`: scoped glass surfaces and small orbital sculptures for the workspace and operations pages.
- `vendor/three/`: pinned Three.js 0.180.0 ES modules and MIT license, served locally.
- `scripts/command.js`: dashboard navigation, filtering, editing and persistence.
- `scripts/operations.js`: the original operations workflows, with the redesigned directory and profile dialog.
- `scripts/experience.js`: shared progressive reveals, hero lighting and decorative-motion preference. It does not change planning records.
- `data/*-seed.js`: preserved source planning data, kept separate from rendering behavior.
- `styles/*-layout.css`: layout primitives for each planning application.
- `styles/*-theme.css`: Intellibus navy and royal-blue surfaces.
- `styles/experience.css`: shared navigation and motion rules.
- `assets/people/`: the original embedded photos extracted byte-for-byte into cacheable image files. Filenames are content hashes; no photos were replaced or generated.

The white logo is the asset used by [Intellibus's official website](https://www.intellibus.com/). Existing contact details remain part of this application; keep the source repository private.

## Data behavior

The command plan and operations records retain their original, separate browser storage keys. Existing saved edits survive this refactor. Counts marked unknown remain unknown until someone supplies a verified value. Directory counts describe roster prospects, not confirmed attendance. GitHub changes deploy the application; browser edits do not automatically synchronize between people. Use the existing export controls to keep a copy.

The directory displays 8 records per page on desktop and 4 on phones. Category counters act as filters. Search matches names, roles, organizations, statuses and contact fields; profiles open in a native dialog with keyboard focus containment and Escape dismissal. Transport retains Leaflet/OpenStreetMap attribution, OSRM routes and the source pickup tables. Additional planning tables are collapsed below the main map.

## Inside Atlas experience

The overview is a real WebGL scene: a transparent sphere containing curved neural connections, metallic orbital ribbons and a procedural skyline. Native scrolling moves the camera from the overview through the shell into the network; reverse scrolling retraces that path. Stage buttons provide an alternate way to move between the three views. The Workspace shortcut and `index.html#workspace` bypass the introduction.

The surrounding cards open the existing people, competition and transport workflows. Target cards use the saved command-plan targets; they are not attendance claims. The underlying workspace retains the original search, edits and import/export behavior.

Pause motion or the system's reduced-motion preference turns the scene into a still and removes the extra scroll distance. Browsers without WebGL receive a CSS globe and the same functional HTML controls. Rendering pauses offscreen and in background tabs, resolution is capped, and GPU resources are released when navigating away. No map API key, rendering service or new backend is needed.

## Working-page design

The `.atlas-surface` scope covers the lower dashboard, command detail screens and operations pages. The original sphere markup, scene and stylesheet remain unchanged. Glass cards have pointer lighting, perspective tilt, layered bevels and rotating CSS glass cubes or orbital emblems; tables and form rows stay stationary. Four workspace utilities use two columns on desktop and expand to full width when opened.

A separate small Three.js scene renders one orbital sculpture on the active working page. People uses a connected polyhedron, Transport an orbital globe, and planning pages a continuous knot. The shared Pause motion control and reduced-motion preference stop these scenes and card effects. Rendering stops when the sculpture is offscreen or the tab is hidden. CSS sculptures pause offscreen and stay decorative to assistive technology. Page sculptures include orbiting crystal satellites. Navigation releases GPU resources; a CSS orbital fallback remains available without WebGL.

## Local review

Run `python3 -m http.server 8765 --bind 127.0.0.1` in this directory, then open `http://127.0.0.1:8765/`. Maps and external source links require network access. Motion can be paused and respects reduced-motion preferences.

With Playwright available in the development environment, run `node tests/browser-check.cjs`, `node tests/sphere-check.cjs`, and `node tests/surfaces-check.cjs`. Set `ATLAS_URL` to review a different deployment and `BROWSER_CHANNEL` if Chrome is not the browser to use. The checks use a fresh browser context and do not alter real users' saved plans.

## Deployment

The existing Vercel project is `atlas-hackathon-planner` in `alexhutchinson-3563s-projects`. A branch push creates a preview; `main` deploys production. Review changes before publishing. Do not commit environment files, credentials or `.vercel/`. Repository membership and Vercel access are separate.

## Walkthrough update — 29 September 2026

The sphere heading now reads **Atlas Agentic AI Hackathon 2027**. The scene geometry and camera animation remain unchanged. Larger working text, two configurable headline measures, all-role people search, per-role roster statuses and completed-task grouping implement the walkthrough feedback.

Delivery views provide all attention items, accountable versus supporting ownership, a recruitment funnel, acyclic workstream dependencies, unresolved decisions and website readiness. Forecasts preserve unknown values and are not summed across overlapping audiences. Decision/readiness changes require an owner, date and evidence. Progress remains explicitly unweighted until a scoring model is approved. Source data and existing personal browser saves are preserved.

### Team connection

Clerk (Hobby) and Neon (Free) were provisioned through the existing Vercel project. No paid upgrade was selected. Clerk's company-domain allowlist is configured. The server additionally requires a currently verified primary `@intellibus.com` email; test addresses cannot access shared plans.

- `scripts/team.js` connects explicitly to a shared baseline; it never automatically uploads an old personal draft. Personal and shared draft storage keys are separate.
- `api/team-plan.js` applies server-side owner/manager permissions and optimistic revision checks. A conflict stops saves and asks the editor to export/reload; it never silently overwrites a concurrent save.
- `api/team-operations.js` retains the separate operations model. All authorized company users may read it; managers approve shared operations/roster changes.
- `ATLAS_MANAGER_EMAILS` must contain the explicitly approved manager emails, comma-separated. It defaults to no managers. Owners are assigned with their verified company email, not their display name.
- Clerk production requires a custom domain/DNS and live keys. Production requests fail closed while only development keys exist. `/api/team-config` exposes no secrets and reports team access disabled until ready. Configure `ATLAS_ALLOWED_ORIGINS` for any custom domain.
- Live email login and multi-person synchronization cannot be marked verified until the production domain and manager setup are complete. Do not use `pk_test` credentials as production auth.

Database schema (already initialized): `atlas_plans(scope text primary key, body jsonb not null, revision integer not null default 0, updated_at timestamptz not null default now(), updated_by text)`. Preview and production documents use distinct scope values.

Run `npm test` for authorization checks and `node tests/walkthrough-check.cjs` for the new browser flows. Existing browser, sphere and surfaces checks remain applicable. Tests use isolated contexts and do not change a user's saved plan.

### Remaining decisions

The two headline measures can be selected in target/current-number settings; registrations and participation confirmations are provisional defaults. Meeting proposals (wave times, targets/buffers, fair scope, contracts, confirmed speakers, medical/food/volunteer coverage) are pending records, not invented commitments. Private HR, other projects and personal transcript content were not added to the site.
