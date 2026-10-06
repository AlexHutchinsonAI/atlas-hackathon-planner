# Readable Atlas redesign — review notes

This change improves the existing application's presentation and navigation. It retains the existing repository, Vercel project, planning records, authentication and persistence implementation. It is prepared locally; no push, merge or deployment is authorized by this task.

## Baseline and review

- Source: `https://github.com/AlexHutchinsonAI/atlas-hackathon-planner.git`
- Baseline: `1fd84d3b167d5228a74b35b3cff91da40ed2f5e5`.
- Branch: `redesign/readable-planner`.
- Original checkout: `/Users/alexintellibus/Documents/ChatGPT/AI Hackathon China/output/github-share/atlas-hackathon-planner`. Its untracked duplicate source files were preserved. Work took place in a separate clone in the task directory.
- Existing Vercel project: `prj_0Id25ubkJCDz1ajnhEAvmDattsNk`; production deployment `dpl_7R32FwRWp1LXyjBDKJ86cgAix56o` matched the baseline commit when inspected read-only.
- Review URL: `http://127.0.0.1:8765/`. Start with `python3 tools/preview.py --port 8765` from this checkout. Auth is disabled and API writes return 405. It never proxies production APIs. Fresh browser contexts contain only isolated source fixtures; no existing user's browser storage was accessed or cleared.

## Route and interaction inventory

| Page / route | Preserved content and workflows |
| --- | --- |
| `index.html` | Plain-language introduction and links to six destinations; existing account, theme, backup and recent-change controls. `index.html#workspace` remains a workspace shortcut. |
| `workspace.html` | Search, area filters, status/tag views, headline measures, workstream register, attention items, timeline, personal/shared save status and import/export. |
| Workspace areas | `#area/<existing-area-id>`; workstreams in their existing event, website and network areas. |
| Workspace detail | Existing `?workstream=<id>` links; new `#workstream/<id>/list`, `/organize`, `/validate`, `/execute`, and `#list/<workstream-id>/<list-id>` route state. List and item IDs, ordering, reviews, owners, deadlines, notes, tags and statuses retain their meanings. Add forms now offer Cancel. |
| Delivery review | `#review/progress`, `/owners`, `/recruitment`, `/dependencies`, `/decisions`, `/publication`; filters, evidence and decision/readiness controls retained. |
| Operations | All twelve hashes: `#direction`, `#outcomes`, `#notebook`, `#people`, `#web`, `#transport`, `#open`, `#exec`, `#story`, `#baseline`, `#mobilize`, `#refs`. Primary tabs and a context/source disclosure make every section reachable. Deep links and browser history now retain the selected section. |
| Operations register | Existing workstream selection, owner-gap filter, five planning steps, checkboxes, notes, goals, task tables, status/review controls and append/reorder workflows. |
| People | Directory, stakeholders, communication (`map`) and schools subviews; role filters, all-role name search, pagination, source photographs, contacts and native profile dialogs. Prospects remain explicitly distinct from attendance confirmations. |
| Website | Area selector, publication gates, review statuses/evidence, judge/coach/speaker profiles, enterprise records and stable prize review IDs. All 14 original award images remain. |
| Transport | Search/category/status filters, pickup lists, unavailable-map feedback, full planning dialog, source tables and unchanged map implementation. |
| `assistant.html` | Existing Atlas Tech chatbot link, setup directions, offline/testing caveats and dated source snapshot. |
| `virtual-walkthrough.html` | Embedded original venue explorer. Manual viewpoint selection is the default; the existing scroll tour remains available. |
| `venue/index.html` | All original panorama IDs and six-face image assets, viewpoint selector, Previous/Next, pointer and keyboard controls, source floor-plan images and original tour/video links. |
| Repeated states | Light/dark themes, reduced motion, mobile menu/section selection, collapsed details, on-demand help, empty/filter results, native dialogs, login/cancel/error, saving/offline/retry/conflict states and personal/shared boundaries. |

The old decorative scene modules and assets remain in the repository. The new home uses a clear destination layout, and working pages hide decorative ornaments. Source planning content remains available behind appropriately labelled disclosures. Task completion is labelled unweighted; five planning completeness checks remain a separate measure.

## Data and authentication boundaries

The deployed provider is Firebase with Google and verified email/password sign-in. Clerk remains a dormant fallback. Existing verified-email editor policy and the sole owner/admin distinction are unchanged. No accounts, provider settings, sharing permissions or credentials were modified or exported.

Neon stores the shared documents in `atlas_plans(scope text primary key, body jsonb, revision, updated_at, updated_by)`. The command document uses `production`/`preview` scope; Operations uses `production:operations`/`preview:operations`. The operations snapshot contains `plans`, `custom`, `execState`, `webState`, `judgeState`, `actState`, `qState`, `reviewState`, `ambassadorState`, and `goalState`. Command data remains version 1 with command metrics, workstreams, nested lists/items and stable IDs. Existing atomic revision checks, append-only activity attribution and durable cloud queue are unchanged.

Personal command drafts retain `intellibus-love-speed-universe-v1`. Operations retains `atlas-workbook-v1` and its existing state-suffix keys. Pending cloud drafts retain account-and-endpoint-specific `atlas-cloud-pending-*` keys. No key was renamed, cleared or migrated. URL state stores navigation only and never enters a record snapshot.

Production shared GET handlers can initialize a missing document with `INSERT ... ON CONFLICT`. For that reason, this task did not call those endpoints, create a production export or take a live database backup. No production credentials or records were inspected. Read-only deployment metadata established the code baseline. All write-flow tests use mocked APIs and identity in fresh local browser contexts.

## Preservation evidence

- SHA-256 checks match for all 28 protected files: every tracked `data/*`, `api/*`, `lib/*`, and the team, cloud queue, Firebase, save status, activity, saved-plan, update and theme scripts.
- Complete command and operations snapshots match before/after across all twelve operations sections, all six delivery review screens and all four People subviews. Fixtures include sentinel notes, attachments and unknown extension fields. The comparison uses strict deep equality, not only record counts.
- Source fixture counts are 35 command workstreams and 33 operations plans. These are not freshly measured production counts.
- Personal save/reload, complete export, cancelled additions/import, shared first-load isolation, no-op saves, offline retries, account-specific recovery, revision conflict protection and cancelled sign-out were exercised with isolated fixtures/mocks. No live write testing occurred.

## Verification and practical limits

The evidence directory beside the checkout contains machine-readable results, logs, baseline file hashes and desktop/mobile screenshots. The existing Node suite passes 34 tests, and the backup/update suite passes 2. The isolated workflow suite passes all 8 groups. The 116 route/viewport checks cover 29 routes at 1440, 390, 320 and 720 pixels. Automated accessibility checks cover 50 desktop/mobile screens plus 36 dark-mode, subview and dialog screens. The theme test exercises the actual toggle and navigation persistence across all six pages at desktop/mobile widths; the tutorial test checks every help target and transition at both widths. Final results are summarized in the task's review report. This static project has no lint or frontend build script. JavaScript syntax and Git whitespace checks complement browser verification.

The legacy `tests/kandia.cjs` has a stale assertion of 153 Operations tasks; both unchanged baseline and redesign produce 165 and fail that same assertion. Complete record equality provides preservation evidence for the current source. Its award/review assertions before the task-count assertion still pass, and the separate prize image test passes on desktop and mobile.

Live Firebase popup/real credential verification, cross-device production persistence, production record counts and live Mapbox imagery/routing were intentionally left unverified. The local preview shows a truthful unavailable-map state and retains the searchable lists and planning dialog. These external integrations and server files are unchanged. Automated accessibility checks supplement visual and keyboard review; they do not replace human assistive-technology testing.

Publication remains a separate approval step. Do not push this branch or deploy the review bundle until that approval arrives.
