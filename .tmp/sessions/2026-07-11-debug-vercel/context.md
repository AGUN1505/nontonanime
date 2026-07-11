# Task Context: Debug Vercel Deployment & Fix Lint warnings

Session ID: 2026-07-11-debug-vercel
Created: 2026-07-11T12:38:00Z
Status: in_progress

## Current Request
Animes are not appearing on Vercel deployment. Investigate and fix, plus resolve lint warnings (<img> element usage and react-hooks/exhaustive-deps).

## Reference Files
- `src/app/page.tsx`
- `src/components/WatchHistoryTracker.tsx`
- `src/services/otakudesu.ts`

## Components
- Scraper: `src/services/otakudesu.ts`
- UI: `src/app/page.tsx`
- History Tracker: `src/components/WatchHistoryTracker.tsx`
- Debug Route: `src/app/api/debug/route.ts`

## Exit Criteria
- ESLint warning on image tags fixed.
- ESLint warning on useEffect in WatchHistoryTracker fixed.
- Debug route available to verify Otakudesu connectivity from Vercel servers.
- Build compiles successfully.
