---
phase: 03-canli-istihbarat-paneli
plan: "01"
subsystem: ui
tags: [html, css, live-intel, panel, dom]

# Dependency graph
requires:
  - phase: 01-reddit-veri-cekme
    provides: window.liveIntelData global object with redditTarget/redditSubreddits arrays
  - phase: 02-rss-ve-google-news-veri-cekme
    provides: window.liveIntelData rssFeeds/googleNews arrays
provides:
  - "#live-intel DOM panel with header, refresh button, filter buttons, sources container"
  - "CSS classes for live-intel-* elements including loading/ok/error badge states"
  - "showLiveIntelPanel() function wired into startSearch() flow"
  - "DOM contract (IDs, classes, onclick handlers) for 03-02 renderLiveIntel()"
affects:
  - 03-02-canli-istihbarat-paneli

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Section separator comments (// =====================) for JS function grouping"
    - "Panel hidden by default (display:none), shown via JS after search completes"
    - "Filter buttons with onclick handlers that will be implemented in follow-up plan"

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "showLiveIntelPanel() placed in its own section before VERİ ÇEKME section — keeps panel logic separate from data fetching"
  - "showLiveIntelPanel() called immediately after showResults(q) in setInterval else block — panel appears together with tool results"
  - "refreshLiveIntel() and setLiveIntelFilter() handler names defined in HTML now, implementations deferred to 03-02"
  - "id=liveIntelSources as the render target — 03-02 will fill this container via renderLiveIntel()"

patterns-established:
  - "DOM contract: #live-intel contains .live-intel-header, .live-intel-filters, #liveIntelSources"
  - "Badge states: .live-intel-source-badge.loading / .ok / .error"
  - "Filter type values: 'all', 'reddit', 'rss' — matched to liveIntelData key types"

requirements-completed: [PANEL-01, PANEL-03, PANEL-04, PANEL-05]

# Metrics
duration: 5min
completed: 2026-02-28
---

# Phase 3 Plan 01: Canlı İstihbarat Panel Summary

**Live intel panel DOM skeleton with CSS badge states and showLiveIntelPanel() wired into startSearch(), ready for renderLiveIntel() in Phase 03-02**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-28T19:10:00Z
- **Completed:** 2026-02-28T19:16:55Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added 29 CSS rules for `.live-intel-*` classes covering header, refresh button, filter buttons, source blocks, badge states (loading/ok/error), item list, and empty state
- Added `#live-intel` HTML panel inside `#results`, positioned after `#toolsGrid` and before `#results` closing tag — visible only after search
- Added `showLiveIntelPanel()` function and wired it into `startSearch()`'s setInterval else block immediately after `showResults(q)`

## Task Commits

Each task was committed atomically:

1. **Task 1: Canlı İstihbarat panel CSS'ini yaz** - `29d7f15` (feat)
2. **Task 2: Panel HTML'ini #results içine ekle ve showLiveIntelPanel() fonksiyonunu yaz** - `680e940` (feat)

**Plan metadata:** (to be added in final commit)

## Files Created/Modified
- `index.html` - Added CSS block (lines 195-222), HTML panel (lines 528-542), showLiveIntelPanel() function (lines 987-993), and wired call in setInterval else block (line 816)

## HTML Element Details

| Element | ID / Class | Location (line) | Purpose |
|---------|-----------|-----------------|---------|
| Panel container | `id="live-intel"` | 529 | Root panel div, display:none by default |
| Title | `.live-intel-title` | 531 | "// CANLİ İSTİHBARAT" heading |
| Refresh button | `id="liveIntelRefreshBtn"` | 532 | onclick="refreshLiveIntel()" — handler in 03-02 |
| Filter: All | `.live-intel-filter-btn.active` | 535 | onclick="setLiveIntelFilter(this,'all')" |
| Filter: Reddit | `.live-intel-filter-btn` | 536 | onclick="setLiveIntelFilter(this,'reddit')" |
| Filter: RSS | `.live-intel-filter-btn` | 537 | onclick="setLiveIntelFilter(this,'rss')" |
| Sources container | `id="liveIntelSources"` | 539 | renderLiveIntel() fills this in 03-02 |

## CSS Classes Added

```
#live-intel                    — root panel (display:none default)
.live-intel-header             — flex row: title + refresh button
.live-intel-title              — "// CANLİ İSTİHBARAT" label
.live-intel-refresh-btn        — refresh button with :hover and :disabled states
.live-intel-filters            — flex row of filter buttons
.live-intel-filter-btn         — individual filter button
.live-intel-filter-btn.active  — active filter state (green border + glow)
.live-intel-sources            — column flex container for source blocks
.live-intel-source-block       — per-source section wrapper
.live-intel-source-header      — flex row: source name + badge
.live-intel-source-name        — source label text (uppercase, dim)
.live-intel-source-badge       — base badge style
.live-intel-source-badge.loading — yellow badge for in-progress state
.live-intel-source-badge.ok    — green badge for success state
.live-intel-source-badge.error — red badge for error state
.live-intel-items              — list of intel items (no bullets)
.live-intel-item               — single item with left border accent
.live-intel-item a             — item link (hover: green)
.live-intel-item-meta          — date/source meta text (small, dim)
.live-intel-empty              — "no results" placeholder text
```

## DOM Contract for 03-02

03-02 plan (`renderLiveIntel()`) must:
- Target `document.getElementById('liveIntelSources')` as the render container
- Use `data-type="reddit"` or `data-type="rss"` on `.live-intel-source-block` elements for filtering
- Apply `.live-intel-source-badge.loading` / `.ok` / `.error` based on `window.liveIntelData.loading` state
- Implement `refreshLiveIntel()` function (currently `onclick` set, no handler)
- Implement `setLiveIntelFilter(btn, type)` function (currently `onclick` set, no handler)

## Decisions Made

- `showLiveIntelPanel()` placed in its own PANEL section before VERİ ÇEKME section, keeping panel UI logic separate from data fetching logic
- Panel visibility triggered immediately after `showResults(q)` (not after fetch completes) so panel frame appears instantly during data load
- Handler names (`refreshLiveIntel`, `setLiveIntelFilter`) defined in HTML markup now but intentionally left unimplemented — this creates a clear interface boundary for 03-02

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- DOM skeleton complete — 03-02 can immediately target `#liveIntelSources` for rendering
- CSS classes cover all states needed by renderLiveIntel()
- Filter button onclick handlers (`setLiveIntelFilter`) and refresh handler (`refreshLiveIntel`) defined in HTML, ready to be implemented in 03-02
- No blockers

## Self-Check: PASSED

- FOUND: `.planning/phases/03-canli-istihbarat-paneli/03-01-SUMMARY.md`
- FOUND: commit `29d7f15` (Task 1 - CSS)
- FOUND: commit `680e940` (Task 2 - HTML + JS)
- FOUND: 1x `id="live-intel"` in index.html
- FOUND: 2x `showLiveIntelPanel` in index.html (definition + call)

---
*Phase: 03-canli-istihbarat-paneli*
*Completed: 2026-02-28*
