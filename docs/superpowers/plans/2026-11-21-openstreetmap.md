# OpenStreetMap Integration Implementation Plan

**Goal:** Let the team use destination map and search without a Mapbox key or billing account.

**Architecture:** Use MapLibre GL JS with OpenStreetMap raster tiles and explicit, cached Photon searches. Preserve the existing destination and trip flow.

**Tech Stack:** React, TypeScript, MapLibre GL JS, OpenStreetMap tiles, Photon.

**Spec:** [Issue #69 teammate request](https://github.com/CSC-3380-Fall-2026/Team-14/issues/69#issuecomment-6992640913).

## Global Constraints

- No Mapbox requests or token requirement; preserve map click, draggable pin, keyboard selection, names and trip lookup fallback.
- Keep visible OpenStreetMap attribution and browser cache/referrer defaults; no tile prefetch or offline download.
- Search only after explicit submit, at most one new request per second per client; cache repeated searches and expose a configurable Photon endpoint.
- Public community providers are best effort and intended here for moderate classroom project usage; document limits and provider switch before wider deployment.

## Review Focus

- A checkout without environment variables still enables destination search and initializes a map.
- Malformed coordinates never enter the trip draft; zero coordinates remain valid.
- Repeated searches reuse cached results; rapid searches show a useful message; cancellation prevents stale selection.
- Search stays available when WebGL or map tiles fail.
- Attribution remains visible at narrow widths; a selected place keeps its label until its pin changes.

### Task 1: Remove the paid provider requirement

**Files:** `frontend/src/destinationSearch.ts`, `frontend/src/components/DestinationSearch.tsx`, `frontend/src/components/MapPage.tsx`, `frontend/src/components/MapPage.css`, frontend package files, `frontend/tests/destinationSearch.test.ts`, `frontend/tests/mapPage.test.ts`, `frontend/README.md`.

**Interfaces:** Search returns existing `DestinationSearchResult[]`; map selection continues to use `Destination`.

- [x] Write and run failing tests for keyless Photon requests, address labels, response validation, cache, pacing, cancellation, and enabled search without configuration.
- [x] Replace Mapbox with MapLibre and a raster source, preserve controls/selection and add visible attribution.
- [x] Implement bounded search cache, request pacing and configurable Photon endpoint.
- [x] Update setup and provider usage notes.
- [x] Run full frontend tests, lint, build, and diff checks (74 tests passed).
- [x] Complete independent review and browser failure/recovery checks; commit explicit task files after the final staged review.

## Regression evidence

The original keyless regression run failed on Photon labels/requests, query caching and pacing, cancellation, and the disabled search field without a token. These pass after the provider replacement.

Independent review identified that MapLibre emits `load` even when every raster image fails, and 404 images do not emit the public error event. A browser check reproduced a blank map with an enabled map-center action using the local all-404 tile fixture. Four of five event-sequence tests failed against the original unconditional-ready handler; all five pass with readiness gated on a successful `sourcedata` event for the raster source. Source metadata alone cannot prove that an image loaded. Mixed failures can recover after a successful image, and a late successful image can recover from the unavailable state.

Current verification: 74 frontend tests passed; lint, build, and whitespace checks passed. Browser checks passed for real OpenStreetMap tiles and Photon search, named destination continuity, keyboard movement, and trip lookup fallback. All-404 and all-500 fixtures retained search, fallback and retry with map-center selection disabled; switching to mixed successful/failed images and retrying recovered a usable map. The default real-provider map still worked afterward. Final independent review found no remaining issues.
