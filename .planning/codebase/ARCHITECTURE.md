# Architecture

**Analysis Date:** 2026-02-27

## Pattern Overview

**Overall:** Single-Page Application (SPA) with Client-Side Intelligence Analysis

**Key Characteristics:**
- Browser-based OSINT (Open Source Intelligence) platform
- Client-side API integration with third-party tools and AI services
- Real-time data visualization and multi-tool filtering
- Stateful search with tab-based result management
- AI-powered analysis via Groq LLM API with chat interface
- Dual-application structure: main OSINT tool + world monitoring dashboard

## Layers

**Presentation Layer:**
- Purpose: Render UI, handle user interactions, display results
- Location: `index.html`, `world-monitor.html` (embedded CSS + inline JavaScript)
- Contains: HTML structure, CSS styling (grid layouts, responsive design), DOM event handlers
- Depends on: Browser DOM APIs, localStorage, fetch API
- Used by: User interactions trigger search, analysis, and export flows

**Business Logic Layer:**
- Purpose: Search filtering, target detection, tool organization, analysis orchestration
- Location: `<script>` sections in both HTML files
- Contains:
  - Target detection (`detectTargetType()` - IP/email/domain/company classification)
  - Tool filtering and categorization (47+ OSINT tools in `TOOLS` array)
  - Tab management system (multi-search capability)
  - Search history management (localStorage-based)
- Depends on: DOM, Groq API, external OSINT tool URLs
- Used by: Search workflow, results rendering

**Integration Layer:**
- Purpose: External API communication and third-party tool linking
- Location: Groq API calls, OSINT tool URL generation, video/map APIs
- Contains:
  - Groq Chat Completions API (`https://api.groq.com/openai/v1/chat/completions`)
  - 47+ OSINT tool links (LinkedIn, Shodan, VirusTotal, GDELT, etc.)
  - Leaflet mapping library (world-monitor)
  - HLS video streaming (world-monitor cameras)
  - YouTube IFrame API (world-monitor news channels)
- Depends on: External services availability, API keys (Groq)
- Used by: AI analysis, tool discovery, real-time data visualization

**Data Storage Layer:**
- Purpose: Persistent and in-memory state management
- Location: Browser localStorage, in-memory JavaScript objects
- Contains:
  - Groq API key (`groq_api_key`)
  - Search history (`osint_history` JSON array)
  - Tab state (`tabs[]` array with query, results, detection metadata)
  - Chat history (`chatHistory[]` with role/content messages)
- Depends on: Browser APIs
- Used by: API authentication, history recall, tab persistence

## Data Flow

**Search Flow:**

1. User enters query (e.g., "example.com")
2. Real-time detection triggers (`detectTargetType()`)
3. User selects category tag or auto-detection applies
4. Click "TARA" (SCAN) button → `startSearch()`
5. Loading animation cycles through 5 steps (sources → databases → filtering → analysis → complete)
6. `filterTools()` returns matching tools for detected type
7. `createTab()` stores results in `tabs[]`
8. `renderResults()` displays tools grouped by category with direct links
9. Results populate tools grid with external links (URL construction with query param)

**Analysis Flow:**

1. User clicks "GROQ İSTİHBARAT ANALİZİ" (Groq Analysis) button
2. Check API key availability → open modal if missing
3. `runGroqAnalysis()` creates detailed prompt with analysis framework:
   - BLUF (Bottom Line Up Front) summary
   - Target profile
   - Inductive analysis (pattern detection)
   - Deductive analysis (hypothesis validation)
   - ACH (competing hypotheses)
   - Risk assessment
4. POST to Groq LLM with system prompt defining methodology
5. Markdown response rendered and stored in `currentRawText`
6. Export buttons enabled (TXT, PDF, copy)
7. Chat interface auto-initializes with analysis context

**Chat Flow:**

1. Analysis completes → `initChat()` sets system prompt with methodology
2. User types question in chat input
3. `sendChatMessage()` appends user message, disables send button
4. Last 10 messages sent to Groq for context (token optimization)
5. Groq responds with markdown-formatted analysis
6. Response appended to chat, auto-scrolls
7. Chat maintains methodology: inductive→deductive→ACH framework

**World Monitor Flow:**

1. Page loads → `loadAllLayers()` initializes async data fetching
2. Multiple data sources load in parallel:
   - Natural events from NASA EONET API
   - Earthquakes from USGS/EMSC
   - Conflicts from Liveuamap
   - Military bases (static)
   - Nuclear facilities (static)
   - Economic sanctions (static)
   - Internet outages (static)
   - Weather alerts (static)
3. Data markers rendered on Leaflet map with color-coded icons
4. Events listed in right sidebar with timestamps
5. YouTube news channels embedded in bottom panel
6. Real-time clock updates (UTC + local)
7. Layer toggle controls show/hide data by type
8. Time range selector filters historical events

**State Management:**

- **In-Memory State:**
  - `tabs[]`: Array of search results with query, detected type, filtered tools
  - `activeTabId`: Currently displayed tab ID
  - `activeTag`: Selected category filter
  - `currentTarget`: Last searched query
  - `currentRawText`: Last Groq analysis output
  - `chatHistory[]`: OpenAI-compatible message array for chat
  - `chatSystemPrompt`: System instructions for OSINT analyst role

- **Persistent State:**
  - `localStorage['groq_api_key']`: Groq authentication
  - `localStorage['osint_history']`: JSON array of recent searches

## Key Abstractions

**Target Detection:**
- Purpose: Classify user input automatically (IP/email/domain/company)
- Examples: `detectTargetType()` in `index.html`
- Pattern: Regex-based classification with fallback to null
- Used by: Search initialization, tag activation, approach selection

**Tool Definition:**
- Purpose: Represent OSINT tools with metadata for filtering and linking
- Examples: `TOOLS` array (47+ entries) in `index.html`
- Pattern: Objects with `{name, cat, desc, url, query}` properties
- URL generation: Conditional query param appending for dynamic searches
- Used by: Filter logic, results rendering, external linking

**Category Grouping:**
- Purpose: Organize tools and analysis by target type (شرکت/کسی/domain/etc.)
- Examples: Category labels, icons, counts in results
- Pattern: Dynamic grouping in `renderResults()` with `groups{}` object
- Used by: Tool filtering, results presentation, approach suggestion

**Markdown Rendering:**
- Purpose: Convert markdown text from Groq API to HTML for display
- Examples: `renderMarkdown()` function with regex replacements
- Pattern: Simple regex-based transformations (headers, bold, lists, code)
- Used by: Chat messages, analysis output, export preview

**Approach Mapping:**
- Purpose: Suggest investigation methodology for each target type
- Examples: `APPROACH_MAP` object (company→corporate records→news→social)
- Pattern: Target type → comma-separated methodology steps
- Used by: Analysis presentation, search results display

## Entry Points

**index.html (Main OSINT Tool):**
- Location: `index.html`
- Triggers: User opens page or clicks "OSINT Lens" logo
- Responsibilities:
  - Initialize API key status check
  - Render search interface
  - Set up event listeners (Enter key, tag clicks, button clicks)
  - Load and display search history
  - Manage all search, analysis, and chat flows

**world-monitor.html (Global Monitoring Dashboard):**
- Location: `world-monitor.html`
- Triggers: User clicks "DÜNYA MONİTÖRÜ" (World Monitor) link
- Responsibilities:
  - Initialize Leaflet map and layer controls
  - Load multiple real-time data sources asynchronously
  - Render event markers and legend
  - Display news channels and clock
  - Manage map interactions and layer visibility

**Initialization Events:**
- `DOMContentLoaded`: Triggers API status update, history render, event listener setup
- `window.onYouTubeIframeAPIReady`: Initializes YouTube players after API loads

## Error Handling

**Strategy:** Try-catch blocks with user-facing error messages in UI

**Patterns:**
- API errors: Catch fetch errors, display in Groq output panel with "Hata:" prefix
- Network timeouts: Show connection error message in chat
- Invalid input: Border color flash on empty search, modal prompt for missing API key
- Missing API key: Open modal dialog requiring configuration
- Fallback data: World monitor loads hardcoded static data if APIs fail

## Cross-Cutting Concerns

**Logging:**
- No centralized logging system
- Error messages logged to UI (Groq output panel, chat messages)
- Browser console available for debugging

**Validation:**
- Input validation: Search query must be non-empty (trim check)
- API key validation: Must start with `gsk_` prefix (Groq format check)
- URL construction: Query params URL-encoded for special characters
- Target detection: Multi-pattern regex matching with prioritization

**Authentication:**
- Groq API: Bearer token stored in localStorage, passed in Authorization header
- External tools: No auth required (OSINT tools are publicly accessible)
- Chat context: System prompt injected into each request, not tokenized separately

**Rate Limiting:**
- Groq API: Rate limits enforced by external service
- OSINT tool links: No rate limiting (tools handle independently)
- History updates: No throttling (localStorage writes on every search)

**Performance Optimization:**
- Chat history: Only last 10 messages sent to API (token efficiency)
- Tool filtering: Done client-side (no server requests)
- Markdown rendering: Regex-based, not full parser (minimal overhead)
- Map rendering: Async data loading prevents UI blocking
- Lazy tab rendering: Only active tab results displayed

---

*Architecture analysis: 2026-02-27*
