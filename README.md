# Intellibus Atlas Planner

Source for [atlas-hackathon-planner.vercel.app](https://atlas-hackathon-planner.vercel.app/). This is a static application: no build step or new backend is required.

## Screens and source structure

- `index.html`: the planning command center, verified targets, searchable workstreams and editable lists.
- `atlas-reference.html#people`: the redesigned people directory. The route is retained so existing bookmarks still work. `#transport`, `#direction`, `#outcomes`, `#notebook`, `#web` and `#open` open the other operations sections.
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

## Local review

Run `python3 -m http.server 8765 --bind 127.0.0.1` in this directory, then open `http://127.0.0.1:8765/`. Maps and external source links require network access. Motion can be paused and respects reduced-motion preferences.

With Playwright available in the development environment, run `node tests/browser-check.cjs`. Set `ATLAS_URL` to review a different deployment and `BROWSER_CHANNEL` if Chrome is not the browser to use. The checks use a fresh browser context and do not alter real users' saved plans.

## Deployment

The existing Vercel project is `atlas-hackathon-planner` in `alexhutchinson-3563s-projects`. A branch push creates a preview; `main` deploys production. Review changes before publishing. Do not commit environment files, credentials or `.vercel/`. Repository membership and Vercel access are separate.
