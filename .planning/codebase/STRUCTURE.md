# Codebase Structure

**Analysis Date:** 2026-02-27

## Directory Layout

```
osint-lens/
├── index.html              # Main OSINT analysis tool (entire application)
├── world-monitor.html      # Global monitoring dashboard
├── CNAME                   # GitHub Pages domain configuration
├── .git/                   # Git repository
└── .planning/
    └── codebase/           # Architecture documentation directory
```

## Directory Purposes

**Repository Root:**
- Purpose: Single-page application deployed as static HTML files
- Contains: Two standalone HTML applications, no server-side code
- Key files:
  - `index.html`: 1050 lines - Main OSINT tool with search, analysis, chat
  - `world-monitor.html`: ~1700 lines - Real-time global event monitoring dashboard

**/.planning/codebase/:**
- Purpose: Generated architecture and design documentation
- Contains: Markdown analysis documents created by GSD system
- Generated files: `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `CONCERNS.md`

## Key File Locations

**Entry Points:**

- `index.html`: Main OSINT tool
  - Purpose: User-facing intelligence analysis platform
  - Structure: Single HTML file with embedded CSS and JavaScript
  - Key sections:
    - Header with logo, navigation, API key panel
    - Hero section with branding
    - How-to instructions and API key setup guide
    - Search input area with category tags
    - Results display with tool grid
    - Analysis output panel (Groq results)
    - Chat interface for follow-up analysis
    - Footer with copyright/disclaimer

- `world-monitor.html`: Global monitoring dashboard
  - Purpose: Real-time visualization of global events and crises
  - Structure: Single HTML file with embedded CSS and JavaScript
  - Key sections:
    - Sticky header with logo and layer controls
    - Leaflet map container (main visualization)
    - Map legend with color-coded event types
    - Info panel (left sidebar) showing recent events
    - News channels panel (bottom-left) with YouTube embeds
    - Clock display (bottom-right) showing UTC and local time
    - Loading indicators for data fetch

**Configuration:**

- `CNAME`: Single line with domain name
  - Purpose: GitHub Pages custom domain configuration
  - Content: Specifies the domain for the deployed application

## Naming Conventions

**Files:**
- Pattern: kebab-case for filenames (`world-monitor.html`)
- HTML files: Single comprehensive file per application (no modularization)

**Functions (JavaScript):**
- Pattern: camelCase for all function names
- Conventions:
  - Verbs prefixed: `startSearch()`, `renderResults()`, `loadNaturalEvents()`
  - Getters: `getApiKey()`, `getHistory()`
  - Setters: `saveApiKey()`, `setTag()`, `setCount()`
  - Event handlers: `closeTab()`, `switchTab()`, `toggleLayer()`
  - Update methods: `updateApiStatus()`, `updateTotal()`, `updateClock()`
  - Render methods: `renderResults()`, `renderHistory()`, `renderTabs()`, `renderMarkdown()`

**Variables (JavaScript):**
- Pattern: camelCase for all variables
- Conventions:
  - Constants in UPPERCASE: `TOOLS`, `LOADING_STEPS`, `APPROACH_MAP`, `DETECT_LABELS`
  - Module-level state: `tabs`, `activeTabId`, `activeTag`, `chatHistory`
  - Local variables: `q` (query), `key` (API key), `md` (markdown), `url`, `id`, `el` (element)
  - Abbreviated globals: `res` (response), `data` (API response), `blob` (file data)

**CSS Classes:**
- Pattern: kebab-case for all class names
- Conventions:
  - Component prefix: `.search-section`, `.analysis-box`, `.chat-section`
  - Modifiers with suffix: `.api-key-panel`, `.tab-btn`, `.tool-card`
  - State classes: `.active`, `.open`, `.hidden`, `.disabled`
  - Responsive classes: Media query based layout changes
  - Semantic sections: `.hero`, `.header`, `.footer`, `.container`

**HTML IDs:**
- Pattern: camelCase IDs
- Conventions:
  - Form inputs: `queryInput`, `apiKeyInput`, `chatInput`
  - Panels: `groqOutput`, `chatSection`, `analysisBox`, `loading`
  - Grids: `toolsGrid`, `chatMessages`, `toolsSection`
  - Buttons: `groqBtn`, `chatSendBtn`, `searchBtn`

## Where to Add New Code

**New OSINT Tool:**
- Location: `TOOLS` array in `index.html` (around line 559)
- Structure: Add object with `{name, cat, desc, url, query}`
- Example:
  ```javascript
  { name: 'Example Tool', cat: 'domain', desc: 'Tool description', url: 'https://...', query: true }
  ```
- Categories: Use existing: `'şirket'`, `'kişi'`, `'domain'`, `'ip'`, `'email'`, `'olay'`, `'sosyal medya'`, `'görsel'`, `'telefon'`
- URL pattern: Direct link or `+ encodeURIComponent(query)` appended if `query: true`

**New Search Category Tag:**
- Location: Category tag buttons in search section (around line 460-480 in HTML)
- Also add to: `DETECT_LABELS` object, `APPROACH_MAP` object, `catIcons` and `catLabels` in `renderResults()`
- Pattern: Use same category name (e.g., `'domain'`) across all three places

**New World Monitor Data Source:**
- Location: `loadAllLayers()` function (around line 1567)
- Add async data fetch function:
  - Check pattern: Other functions like `loadNaturalEvents()` (line 1203), `loadEarthquakes()` (line 1286)
  - Return: Array of objects with `{type, title, lat, lon, meta}`
- Register layer: Add toggle control, color/icon definition, marker creation
- Update legend: Add row to `.map-legend` HTML for new event type

**New Analysis Framework Section:**
- Location: Groq system prompts in two places:
  1. Chat prompt: `chatSystemPrompt` assignment (line 864)
  2. Analysis prompt: `prompt` variable in `runGroqAnalysis()` (line 956)
- Pattern: Markdown-formatted instructions for AI analysis methodology
- Example: Add new "## Section Name" with methodology steps

**New API Integration:**
- Location: Fetch calls in function bodies
- Pattern 1 - Groq API: POST to `https://api.groq.com/openai/v1/chat/completions` with Bearer token
- Pattern 2 - External APIs: GET/POST to external OSINT service URLs
- Implementation: Try-catch block with error handling in UI

**Chat Features:**
- User message input: Handled by `sendChatMessage()` (line 900)
- AI response: Posted to Groq, parsed from response
- Message display: `appendChatMsg()` (line 874) adds to DOM
- Markdown rendering: `renderMarkdown()` (line 985) converts text to HTML

**Export Functionality:**
- Text export: `exportTXT()` (line 1003) - Creates blob, triggers download
- PDF export: `exportPDF()` (line 1010) - Opens new window, renders HTML, triggers print
- Copy to clipboard: `copyReport()` (line 1017) - Uses Clipboard API

## Special Directories

**/.git/:**
- Purpose: Version control repository
- Generated: Yes (git repository)
- Committed: Yes

**/.planning/codebase/:**
- Purpose: Architecture documentation generated by GSD mapping system
- Generated: Yes (created by Claude agent)
- Committed: Yes (part of repository)

## Module Organization

**Single-File SPA Structure:**
- No separate module files (CommonJS, ES6 modules, or build process)
- All code within `<script>` tags in HTML
- Code organization by function:
  - API key management (lines 507-539)
  - Target detection (lines 541-661)
  - Tab system (lines 663-714)
  - Search flow (lines 752-856)
  - Chat flow (lines 858-944)
  - Groq analysis (lines 946-982)
  - Markdown rendering (lines 984-1000)
  - Export functions (lines 1003-1022)
  - Initialization (lines 1025-1047)

**World Monitor Module Organization:**
- Clock management (lines 986-1025)
- News channel initialization (lines 1026-1114)
- Layer controls (lines 1115-1160)
- Map marker creation (lines 1132-1172)
- Data loading functions (lines 1193-1551)
- Event rendering (lines 1553-1590)
- Channel switching (lines 1591-1616)
- YouTube player initialization (lines 1617-1681)
- Page initialization (lines 1681-end)

## Component Hierarchy (DOM Tree)

**index.html:**
```
<body>
├── #apiModal (API key modal dialog)
├── .container
│   ├── <header>
│   │   ├── .logo (with SVG)
│   │   ├── .header-nav (links)
│   │   └── .api-key-panel (status indicator)
│   ├── .hero (hero section with title/subtitle)
│   ├── .howto-section (4-step guide)
│   ├── .apikey-guide-section (API setup guide)
│   ├── .search-section
│   │   ├── .search-input
│   │   ├── .search-btn
│   │   ├── .detect-badge
│   │   └── .tags (category buttons)
│   ├── .tabs-section (multi-search tabs)
│   ├── .history-section (recent searches)
│   ├── #loading (loading spinner)
│   ├── #results (results container)
│   │   ├── .analysis-box (detected type info)
│   │   └── #toolsGrid (tool cards)
│   ├── #groqOutput (analysis results)
│   │   ├── #groqText (markdown output)
│   │   └── .export-row (export buttons)
│   ├── #chatSection (chat interface)
│   │   ├── .chat-messages (message list)
│   │   └── .chat-input-row (input/send)
│   └── <footer>
└── <script> (all JavaScript)
```

**world-monitor.html:**
```
<body>
├── <header> (sticky)
│   ├── .logo
│   ├── .nav-controls
│   └── .layer-controls (.layer-btn x 8)
├── .main-grid
│   ├── .map-container
│   │   ├── #map (Leaflet)
│   │   ├── .map-legend
│   │   └── .map-controls
│   └── .bottom-row
│       ├── .info-panel (event list)
│       ├── .news-panel (YouTube channels)
│       │   ├── .news-tabs
│       │   └── .player-container
│       └── .clock-panel
└── <script> (all JavaScript)
```

## Dependency Locations

**External Library CDNs:**
- Google Fonts: Linked in `<head>` (Share Tech Mono, Rajdhani)
- Leaflet Map: `https://unpkg.com/leaflet@1.9.4/` (world-monitor.html)
- HLS.js: `https://cdn.jsdelivr.net/npm/hls.js@latest/` (world-monitor.html)
- YouTube IFrame API: `https://www.youtube.com/iframe_api` (world-monitor.html)

**API Endpoints:**
- Groq API: `https://api.groq.com/openai/v1/chat/completions` (POST)
- All OSINT tools: External URLs in `TOOLS` array (direct links, no API calls)
- World Monitor data:
  - NASA EONET: Natural events (async fetch)
  - USGS/EMSC: Earthquakes (async fetch)
  - Static data: Hardcoded fallbacks for conflicts, bases, nuclear, sanctions, outages

---

*Structure analysis: 2026-02-27*
