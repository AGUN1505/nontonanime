# Task Context: Anime List feature

Session ID: 2026-07-11-anime-list
Created: 2026-07-11T12:00:00Z
Status: in_progress

## Current Request
Add "Anime List" feature with alphabetical filtering. Make it as user-friendly as possible.

## Reference Files
- `src/services/otakudesu.ts`
- `src/app/layout.tsx`

## Components
- Scraper: `src/services/otakudesu.ts` -> `getAnimeList()`
- UI Page: `src/app/anime-list/page.tsx`
- Navbar link: `src/app/layout.tsx`

## Exit Criteria
- Scraper successfully retrieves alphabetical items.
- UI Page displays alphabetical indexes (A-Z, #) with search filtering and direct jump anchors.
- Responsive mobile & desktop layout.
- Build compiles successfully.
