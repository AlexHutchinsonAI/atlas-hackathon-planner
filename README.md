# Intellibus Atlas Planner

Source for [atlas-hackathon-planner.vercel.app](https://atlas-hackathon-planner.vercel.app/). The interface is static HTML/CSS/JavaScript. Optional Vercel API functions provide Firebase-verified team access and Neon-backed shared plans; no frontend build step is required.

## Current redesign review — 6 October 2026

The home introduces planner areas through album-style covers. Every page uses a collapsible left menu, readable spacing and clear purpose text. Workspace and Operations show proportional graphics with exact recorded values. Signed-in account settings include appearance and the existing guarded sign-out action. Working records, source content, authentication and shared saves retain their existing implementation. The venue opens with manual controls and keeps the scroll tour available. Detailed route inventory, data boundaries and verification limits are in [REDESIGN.md](REDESIGN.md). Earlier visual-experience notes below document the retained legacy scene assets.

For an isolated local review, run `python3 tools/preview.py --port 8765` and open `http://127.0.0.1:8765/`. This server disables auth and refuses shared API writes. Do not point write tests at production. With Playwright available, `node tests/readable-check.cjs` compares local baseline/updated fixtures (`ATLAS_BASELINE_URL`, `ATLAS_URL`) and uses mocked authentication/APIs for save and recovery tests. `ATLAS_EVIDENCE` selects the result JSON path. The existing `npm test` authorization, audit and cloud tests remain unchanged. Alex requested publication to the existing live Vercel site after this revision passes verification.

The collapsed navigation header uses an outlined split-panel control, a divider and breadcrumbs for the current section and page. The section breadcrumb opens its overview; the control reopens the existing sidebar. Narrow screens use two label lines, and the header/drawer respect available safe-area insets. `node tests/header-check.cjs` checks all page families and nested routes at desktop and mobile widths, keyboard/tap entry, focus, history and complete planning-snapshot equality. `node tests/header-editor-check.cjs` checks isolated fixture edits through breadcrumb/menu navigation, Save now, reload and Cancel, including unknown fields and attachments. Set `ATLAS_BROWSER=webkit` for WebKit, `ATLAS_EVIDENCE_DIR` for screenshots/results, and optionally `ATLAS_AXE_PATH` to the installed axe-core script for header accessibility checks. This sidebar refinement is prepared locally and requires separate approval before publication.

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

The command plan and operations records retain their original, separate browser storage keys. Existing saved edits survive this refactor. Counts marked unknown remain unknown until someone supplies a verified value. Directory counts describe roster prospects, not confirmed attendance. GitHub changes deploy the application. Signed-in shared edits synchronize through the existing Neon database; personal browser drafts remain separate. Use the export controls to keep a copy.

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

Firebase Authentication uses the existing production address without a custom domain. The approved project is `atlas-planner-auth` on Spark (no paid upgrade). Google and verified email/password sign-in are enabled; magic-link sign-in is disabled. Firebase-managed domains remain, and the planner production domain is authorized. The application imports no Analytics SDK and sends no Analytics events.

Any currently verified email may view the shared internal planner, as approved by Alex. With the approved `ATLAS_VERIFIED_EDITORS=true` setting, every currently verified signed-in email may edit and save planner content, including external addresses. The exact verified email `alex.hutchinson@intellibus.com` remains the sole owner for baseline/import controls. This grants no Firebase, database, Vercel or credential administration rights. The server verifies token signature, project, expiry and current account state on every shared request; disabled, deleted, unverified, changed-email and revoked accounts fail closed. Anonymous, unverified, disabled, changed-email and revoked accounts cannot write even if they bypass the UI. Existing revisions and conflict protection remain unchanged.

- `ATLAS_AUTH_PROVIDER=firebase`, `ATLAS_ACCESS_POLICY=verified-email`, and `ATLAS_FIREBASE_WEB_CONFIG` (public apiKey/authDomain/projectId/appId JSON) enable the production provider. The existing `DATABASE_URL` remains server-only.
- Firebase uses its managed `atlas-planner-auth.firebaseapp.com` callback domain and Google popup flow. No service-account private key is generated or committed.
- Workspace and Operations retain separate documents with optimistic revision checks. A conflict blocks saves instead of overwriting another revision.
- Clerk remains a dormant fallback; its existing resources and credentials were not deleted. Its production path still requires live credentials and approved access configuration.

Database schema (already initialized): `atlas_plans(scope text primary key, body jsonb not null, revision integer not null default 0, updated_at timestamptz not null default now(), updated_by text)`. Preview and production documents use distinct scope values.

Run `npm test` for authorization checks and `node tests/walkthrough-check.cjs` for the new browser flows. Existing browser, sphere and surfaces checks remain applicable. Tests use isolated contexts and do not change a user's saved plan.

### Remaining decisions

The two headline measures can be selected in target/current-number settings; registrations and participation confirmations are provisional defaults. Meeting proposals (wave times, targets/buffers, fair scope, contracts, confirmed speakers, medical/food/volunteer coverage) are pending records, not invented commitments. Private HR, other projects and personal transcript content were not added to the site.

### Cloud autosave and activation — October 2026

Both Workspace/Command and the legacy Operations register use the existing authenticated Neon documents. Every persisted edit is queued for a debounced save; **Save now** commits the current field and immediately flushes that queue. Saving, saved, offline, retry and conflict states are visible. Temporary network failures retry with bounded backoff; 400/401/403/409 require attention. Conflicts never overwrite a newer revision. Personal browser records remain separate and unchanged.

Pending cloud edits use account-specific recovery keys. On sign-in, the server document is loaded first; a pending draft is only resumed explicitly with its original revision. Signing out never loads another user's draft. Pending records are excluded from general backups. Managers can explicitly import the pre-sign-in browser snapshot only while the shared document remains at revision zero. Existing cloud edits are never silently replaced by an old browser backup. Workspace and Operations have separate import actions; import both to transfer both datasets. Existing private drafts are kept locally.

Firebase production activation requires the three approved environment variables above and a normal GitHub deployment. Preview remains separately scoped and unconfigured. Production rejects an authentication emulator configuration. Public web configuration excludes measurement IDs; database credentials and bearer tokens are never exposed by `/api/team-config`.

Run `npm test` for permissions, Internet-register preservation, queue/recovery and Firebase current-account checks. Unit tests are separate from live verification of sign-in, cross-browser persistence and email verification. No production account is created through email/password testing without its owner privately entering the credential.

### Recent changes and account attribution

A responsive recent-changes bar displays the current verified account, last recorded editor, timestamps, and concise affected workstream/record summaries for Workspace and Operations. It refreshes after successful saves, every 30 seconds while the page is visible, and on demand. It records content changes, not logins or full user sessions. Unchanged Save now operations create no invented content-change entry.

`atlas_activity` is an additive table initialized by the authenticated server. Entries are append-only through planner APIs and generated from the verified server actor and database timestamp. A single SQL statement atomically updates the document at the expected revision and inserts its activity entry; conflict or audit failure cannot leave a false successful event. No credentials, tokens, private note values or full duplicated documents are stored in activity. Only affected field names, record/workstream labels and action counts are recorded. Existing documents and revisions are retained. Older changes are not reconstructed; existing last-save metadata is labelled separately before history begins. Activity reads require the same current verified identity as shared planner reads.

`npm test` covers attribution/spoofing, concise summaries, grouped changes, concurrent revision conflicts, failed transactions, unchanged saves and anonymous activity denial.
