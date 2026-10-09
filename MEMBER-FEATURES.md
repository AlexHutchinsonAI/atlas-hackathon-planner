# Member photos and connection status

Review branch: `feature/atlas-profile-presence-20261009`.
Baseline: the already published enterprise redesign, `6bac0474d21321d8b02cb41c4e264f62481a1283`.

The sidebar uses the symbol from the existing Intellibus SVG at the top left, beside ATLAS. Alex confirmed this placement in text. The logo asset itself is unchanged.

Account settings let a verified, authorized member choose, preview, save, cancel or remove their own photo. The same private avatar appears in the header, navigation and workspace member list. The list provides name search and pagination, with Online, Offline and Unknown connection states. It includes members who have used the feature since activation; it does not enumerate Firebase users or turn the existing people directory into an account list.

## Data and access boundaries

- Existing Firebase/Clerk verification and the planner identity guard authorize all three new API endpoints. Existing owner, editor and view-only planning roles are unchanged. A view-only member may manage their own photo without gaining planning write access.
- Ownership is derived from the server-verified provider identity and deployment scope. Requests cannot nominate a profile owner or another member's session. Photos can be fetched by any account admitted by the existing planner identity guard in the same deployment scope. They have no public image URL; responses are private and `no-store`.
- The browser accepts PNG/JPEG/WebP up to 6 MB, checks dimensions before decoding, and previews a centre-cropped 256 × 256 PNG. The server checks bounded PNG structure, CRC and decoded pixel length, rejects animation, and reconstructs a PNG containing only its header, compressed pixel stream and ending. EXIF, location text, original filenames and other optional chunks are not stored. The stored PNG is at most 300,000 bytes.
- New tables store a scoped SHA-256 member key, display name, optional PNG/version, and session UUID/timestamps. They do not store raw authentication UID, email, IP, original filename, location metadata or planning content. Member names are shared display names; missing names use “Workspace member”.
- A photo remains until its owner removes or replaces it. Its roster profile/name remains. Removing a photo clears its PNG and version. Optimistic version checks prevent a stale tab from overwriting a newer photo.
- Each tab/device has a separate session. A heartbeat runs every 30 seconds. Any session seen by the server within 120 seconds makes that member Online. Logout/page exit attempts to end that session; if exit delivery fails, it expires by server time. Another live tab/device keeps the account Online. Stale session rows are removed after 24 hours during a successful heartbeat; this is not an activity history.
- Online means a recent connection, not proof that the person is currently reading or working. Browser background throttling and device sleep can expire a session. Network/API failures display Unknown rather than guessing Online or Offline. Authorized roster responses omit emails, raw UIDs and session timestamps.
- Browser avatar caches are temporary private Blob URLs in memory, revoked on disconnect, account change and page exit. No new profile/presence data is written to localStorage. Existing planner storage keys and persistence APIs are unchanged.

## Activation requires separate approval

The implementation is local. No push, new deployment, production SQL, environment change, permission change or production profile/presence write was performed.

After approval for these exact targets, activation would require:

1. Run the reviewed [tools/member-features.sql](tools/member-features.sql) against the existing Neon database used by `atlas-hackathon-planner`. It creates `atlas_member_profiles`, `atlas_member_sessions` and the live-session index only. It contains no changes to existing tables, records, roles or grants. No handler runs DDL automatically.
2. Set `ATLAS_MEMBER_FEATURES=true` for the approved Vercel environment. Any other value leaves the APIs disabled with HTTP 503 before authentication or storage access. Preview and production use the unchanged server-side environment scope; private member records stay separate by scope.
3. Deploy this feature branch's reviewed commit to the existing Vercel project `prj_0Id25ubkJCDz1ajnhEAvmDattsNk`, team `team_Ku2pNaA5ct1Sg2dDUVthoW3l` (`alexhutchinson-3563s-projects`). Do not redeploy the older redesign commit as this feature release. Existing `DATABASE_URL` and auth configuration are reused; no new credentials or storage provider are needed.

The new endpoints are `/api/member-profile` (GET/PUT/DELETE), `/api/member-photo` (GET) and `/api/member-presence` (GET/PUT/DELETE). Their gate must remain off until the two tables exist. Approval should cover the shared visibility and retention described above.

## Review and validation

The live site remains at the published baseline. The local fixture preview is `http://127.0.0.1:8788/index.html`; the signed-out static preview is `http://127.0.0.1:8789/index.html`. The fixture uses two fictional identities, an in-memory PostgreSQL implementation, and synthetic images. It serves the real new member handlers and never connects to production Neon, Firebase or Clerk. All planning write attempts and external provider requests are blocked in the final browser harnesses.

Evidence and reproducible local harnesses are in the sibling `evidence/account-presence` directory. Existing `npm test` covers the unchanged 34 baseline checks; `node --test tests/members.test.cjs` covers new boundary tests. The PostgreSQL fixture covers ownership, optimistic concurrency, session aggregation/tombstones, expiry, pagination, scope separation and an unchanged planner sentinel. Browser checks cover uploads/removal, failures, offline/reconnect, account rejection, multiple tabs, final tab close, informational pages, keyboard/focus, responsive themes and all 728 inventoried routes.

Real production authentication, Neon deployment, production avatars/presence and physical Safari/iOS behavior remain unverified because the new live activation is held. Automated Chromium and WebKit checks use isolated fixtures. No claim is made that those mocks prove production credentials or deployment wiring.
