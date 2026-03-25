# POC Learning Notes: NSW Transport Hazards API

Latest Update: 25 March 2026

## 1. API access and auth
- Endpoint: `https://api.transport.nsw.gov.au/v1/live/hazards/incident/all`
- Required header: `Authorization: apikey <token>`.
- Avoid browser CORS by using Expo mobile simulator (Android/iOS), because the API doesn't return permissive CORS headers.
- For production, do not hardcode keys. use env or secure backend proxy.

## 2. Response shape
- Root may be `FeatureCollection` with `features` array.
- Each entry: `Feature` object with fields:
  - `geometry` (point),
  - `properties` (displayName, mainCategory, incidentKind, adviceA, roads[]). 
- Render metrics from `features`, or from root array if this endpoint returns it directly.

## 3. Correct UI mapping
- Keep safe navigation: `firstFeature?.properties?.displayName`, `roads?.[0]?.region` etc.
- Avoid previous wrong properties like `title`, `description`, `location`, `severity`.

## 4. Robust fetch pattern
- `loading` state toggled at start and always off in both success/error paths.
- Use `AbortController` + timeout (e.g. 15s) to prevent hang states.
- Log and expose to UI:
  - `status=success` / `status=error`
  - `responseCode=200`
  - `responseSize=<bytes>`
  - `root=keys ...` or `array:<n>`
- Use `text()` then `JSON.parse()` with try/catch for better debug.

## 5. Debug and developer feedback
- Bubbled `debugInfo` as visible UI panel for quick check with simulator.
- Add direct log in `console` and state for immediate inspection.

## 6. Next enhancements
- Add full list rendering for 5-10 hazards.
- Provide empty state when no incidents: `No hazards currently`.
- Add paging/refresh.
- Infinitely scrollable hazards list.
- Use TypeScript interfaces for `FetureCollection` etc.

## 7. Recommended structure for future notes
- `docs/` folder with class/feature-specific markdowns.
- `POC_LEARNING_NOTES.md` for experiment log each day.
- `README.md` with quick start + API setup section.

## 8. Suggested files for this repo (next step)
- `docs/API.md` with endpoint details and header sample.
- `docs/EXPERIMENTS.md` for each test run, status, and outcomes.
- `docs/SECURITY.md` for auth key handling guidelines.
- `package.json` scripts for `lint`, `test`, `start`.

## 9. New learnings from filter + UI expansion (today)
- Added third filter dimension: `incidentKind` (in addition to region + street).
- Reliable modal pattern: keep each filter with its own state pair:
  - `search` state for query typing,
  - `selected` state for chosen option,
  - apply button computes final values and calls one fetch.
- Filter order now works as expected:
  1) region filter on `roads[].region`,
  2) street filter on `roads[].mainStreet/crossStreet`,
  3) incident filter on `properties.incidentKind`.
- Options should be generated from fresh API data each fetch:
  - `getUniqueRegions(features)`
  - `getUniqueStreets(features)`
  - `getUniqueIncidents(features)`

## 10. Dependency resilience takeaway
- `@react-native-async-storage/async-storage` may be missing in clean environments.
- Direct import can crash Metro bundling with "Unable to resolve module".
- Safer pattern used in POC:
  - dynamic `require` in init (`useEffect`),
  - graceful fallback to in-memory store if unavailable,
  - keep app functional even without persistence package.
- For production/lab submission, install the package to keep cache across restarts.

## 11. Results UI learnings
- Summary section now presents latest 4 incidents instead of 1.
- Flex card approach (`2 columns`) uses screen space better on mobile.
- Compact labels + icon prefixes improve scan speed:
  - 🚨 total,
  - 🗂️ category,
  - ⚠️ kind,
  - 📍 region,
  - 🏘️ suburb,
  - 🛣️ main street.

## 12. Practical pitfalls to avoid next time
- When adding a new filter, update all 4 areas together:
  1) state declarations,
  2) option extraction + persistence,
  3) fetch signature + filtering logic,
  4) modal apply/clear UI wiring.
- If any style key is newly referenced in JSX, add it immediately in `StyleSheet.create` to avoid TS compile errors.
- Keep labels consistent with functionality (e.g., button text `Filters` once multiple filters exist).
