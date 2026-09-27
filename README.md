# Atlas Hackathon Planner

Private source for https://atlas-hackathon-planner.vercel.app/.

`index.html` is the Atlas Agentic AI Hackathon 2027 command view. It opens with targets and progress, seven main areas, items needing attention, and upcoming milestones. Each area opens its workstreams and editable planning lists. `atlas-reference.html` preserves the previous planner, including its people profiles, embedded photos, Leaflet/OpenStreetMap maps, and OSRM routes. The command view links to it under “Save or move this plan.”

Open `index.html` in a browser, or serve this folder with a local static server, to review changes. Some external services require internet access. Saved planning edits are browser-local; the repository does not synchronize those edits between people. Dashboard current values start blank until verified and can be edited in the browser; the readiness percentages reflect planning fields filled in, not event delivery.

Repository access does not grant Vercel access. The existing Vercel project is `atlas-hackathon-planner` in `alexhutchinson-3563s-projects`. Review a preview before deploying production changes. This repository is connected to the existing Vercel project. Pushes to `main` trigger production deployments at the live URL. Push changes to a separate branch to receive a preview, review it, then merge into `main` to publish. Commit authors must satisfy the Vercel team access requirements.

Do not commit environment files, access tokens, or the `.vercel` directory. The HTML includes contact information; keep the repository private.
