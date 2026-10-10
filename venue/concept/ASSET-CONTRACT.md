# AI Concept Tour: 3D and still-image contract

The concept tour is a separate continuous procedural Three.js scene. Generated 2:1 images failed spherical seam/pole QA and are **ordinary stills only**. They must never be used as finished 360 panoramas.

## Source geometry

`cad-layout.json` preserves all 448 original table centers (A 256 / B 192), 896 schematic chair marks, original row and four-table group IDs, eight column footprints, 48 equipment-well references, one separately outlined duplicate and all supplied review flags. Source X/Y map directly to Three.js X/Z. Nothing is respaced. Table, physical chair, wall and ceiling heights remain illustrative. Original source chair bounds remain retained; 3D chair silhouettes do not certify occupied fit. No three extra chairs per table are inferred.

The exact geometry input is Library `libfile_51439a07bb5c8191b60dca034fb0406a`, derived from unchanged DXF SHA256 `b75d923b31467a0821404b72ad637194a5bd5fc0ab966663ad9291a10323034e`. The supplied source metadata distinguishes nominal structural grids from as-built clear wall faces.

## Concept equipment

`model-specs.json` keeps source dimensions separate from explicit modeling assumptions. Alex confirmed a **50 × 12 ft stage footprint** and **75 × 20 ft main screen face** (15.24 × 3.6576 m and 22.86 × 6.096 m). Those dimensions remain adjustable parameters; height, rigging, structural fit and placement are not approved by this concept. The proposed stage footprint follows the delivered concept layer and preserves the two equipment-well review references beneath it.

Do not expose private prices, supplier contacts or procurement claims. Do not distribute whole-event quantities across every room. The requested seven SA-50 and seven SA-21 sectional sofas belong to **one proposed judges/VIP lounge**; exact dimensions, room allocation and fit remain unverified. Do not shrink the furniture to force fit.

## Images and other spaces

Put ordinary reviewed concept previews under `stills/`, keep their original image bytes, and describe them as **AI concept stills**. Pictured totals are illustrative and cannot verify the 14-sofa allocation. Photographic IDs five-BIGRONE / five-BIGRTWO do not establish Hall A/B identity. six-DINNEROUT1/2 show indoor pre-function corridors; four-OUTWED1/2 are exterior covered-walkway references. A proposed larger lounge may reference six-C456 architecture without claiming a verified event allocation.

## Routes and interaction

`venue-tours.html` offers Original Venue Tour and AI Concept Tour. The existing `virtual-walkthrough.html`, `venue/index.html`, all 25 original viewpoints, photographs and reference drawings stay unchanged. `venue/concept/index.html#<concept-stop-id>` supports first-person looking, touch/drag/pinch/keyboard controls, a cutaway orbit overview, spatial pins plus equivalent detail buttons, source comparison, loading/error/retry, reduced motion and Back/Forward. Local previews disable authentication and all shared API writes. No new backend or provider is required.

## Completed scene inventory

Nine modeled spaces are reached through eleven camera stops: CAD Hall A and Hall B (four stops across the halls), registration foyer, rest/wellness, one judges/VIP allocation study, exterior covered dining, private meeting room, small-business room and exterior arrival. Existing first-proof fragments remain valid. Each stop points to its actual photographic source ID and one of nine reviewed ordinary stills. All nine PNG files retain their supplied bytes and include SHA256 metadata in `stills-manifest.json`.

The judges/VIP study derives its displayed totals by traversing the rendered, catalog-tagged objects: seven SA-50 and seven SA-21, scale 1. No other modeled space contains these sofas. Its open floor is an allocation diagram, not a measured room fit. The private meeting reference has ten representative chairs and no repeated sofa inventory.

One renderer/context is reused when changing scenes; outgoing geometry, materials, textures and shadow targets are disposed. Native dialogs return focus, Escape closes comparisons/details/images, and malformed fragments return to the first view with a notice. With WebGL unavailable, source comparisons display the unchanged front-face photograph explicitly labelled as a photograph; the nine still previews remain usable. No panorama projection is applied to generated images.

## Verification and data boundary

`npm test` includes the concept metadata, exact rendered CAD matrices, image hashes/dimensions and actual sofa allocation tests. `node --test tests/members.test.cjs` remains separate. Browser checks use disposable Chrome/WebKit contexts with record writes and external providers blocked. This change adds no database schema, migration, authentication rules, permissions, providers or planning storage keys. Existing source-tour files, data seeds and backend/persistence modules are checked against release `6d9f071`.

The reviewable local preview uses `python3 tools/preview.py --port 8790`. It disables auth and refuses shared writes. Production publication uses the established GitHub main-to-Vercel integration after the explicit October 10 user instruction to push live when complete. No direct Vercel upload is used.
