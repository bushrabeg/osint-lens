# Coding Conventions

**Analysis Date:** 2026-02-27

## Naming Patterns

**Files:**
- HTML entry points: Lowercase with hyphens (e.g., `index.html`, `world-monitor.html`)
- No separate JavaScript files—all code embedded in `<script>` tags
- Single-word filenames preferred for pages

**Functions:**
- camelCase for regular functions: `startSearch()`, `toggleLayer()`, `renderMarkdown()`
- Descriptive action verbs at the start: `load*`, `render*`, `toggle*`, `fetch*`, `get*`, `set*`, `make*`, `append*`
- Event handlers prefixed with context: `sendChatMessage()`, `closeApiModal()`, `updateApiStatus()`
- No trailing underscores or prefixes for privacy (all functions are global scope)

**Variables:**
- camelCase for local and global variables: `chatHistory`, `currentTarget`, `activeTabId`, `eventCounts`
- Uppercase with underscores for constants: `TOOLS`, `DETECT_LABELS`, `LOADING_STEPS`, `APPROACH_MAP`, `NEWS_CHANNELS`
- Single-letter loop variables acceptable in short iterations: `t`, `e`, `b`, `s`, `c`, `h`, `i`
- Abbreviated names for iteration: `q` for query, `f` for filtered, `md` for markdown, `btn` for button

**Types/Objects:**
- Object properties follow camelCase: `eventtype`, `alertlevel`, `fromdate`, `alertLevel`, `eventCounts`
- Configuration objects use lowercase keys for API compatibility: `{ role: 'user', content: msg }`
- DOM element IDs use camelCase: `apiKeyInput`, `chatInput`, `queryInput`, `toolsGrid`
- CSS class names use kebab-case in HTML, accessed via selector strings: `.layer-item`, `.tool-card`, `.chat-msg`

## Code Style

**Formatting:**
- No linter or formatter configured (Prettier/ESLint not in use)
- Inconsistent indentation observed—mixing 2 spaces, tab-like indentation, and no indentation in CSS
- CSS variables used extensively for theming via `:root` pseudo-class
- Inline styles acceptable for dynamic styling: `style.cssText`, `style.display`, `style.color`

**Linting:**
- No ESLint or JSHint configuration file
- No pre-commit hooks enforced
- Code quality relies on manual review

**Key style observations:**
- Comments use `// ` prefix with section breaks: `// ===================== API KEY YÖNETİMİ =====================`
- Long comments wrapped with `=` chars as visual separators
- Turkish language comments throughout (e.g., `// KAYNAKLAR TARANYOR...`)

## Import Organization

**No module system:**
- Single-file architecture (no import/export statements)
- All code in `<script>` tags within HTML
- External libraries loaded via `<script src>` tags:
  - `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` (maps)
  - `https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js` (video streaming)

**External resources:**
- Google Fonts: `Share Tech Mono`, `Rajdhani`
- CDN libraries preferred over npm packages
- No bundler or build step

## Error Handling

**Patterns:**
- Try-catch blocks for async operations (fetch calls): `try { ... } catch(e) { ... }`
- Error messages logged to console: `console.warn('GDACS yüklenemedi:', err)`
- User-facing error feedback rendered as HTML: `appendChatMsg('assistant', '**Hata:** ' + data.error.message)`
- Fallback functions for failed API calls: `loadFallbackNatural()` when GDACS API fails
- Generic catch-all: silently continue or show generic message

**Error display:**
```javascript
} catch(e) {
  typing.style.display = 'none';
  appendChatMsg('assistant', '**Bağlantı hatası:** ' + e.message);
}
```

**Validation:**
- Input validation before API calls: `if (!val.startsWith('gsk_'))`
- Check for null/undefined before accessing properties: `if (data.choices && data.choices[0] && data.choices[0].message)`
- Fallback data structures when API fails

## Logging

**Framework:** `console` object only (console.log, console.warn)

**Patterns:**
- Warning logs for non-critical failures: `console.warn('GDACS yüklenemedi:', err)`
- No debug logs in production code
- Status messages shown to user via DOM instead: `appendChatMsg()`, `document.getElementById('mapSubtitle').textContent =`

**When to log:**
- API failures or network issues
- User actions (searches, form submissions) not logged
- Data load completions not logged (UI shows loading state instead)

## Comments

**When to Comment:**
- Section headers with repeating `=` pattern (50+ chars): `// ===================== API KEY YÖNETİMİ =====================`
- Complex regex patterns: `if (/^(25[0-5]|2[0-4]\d|[01]?\d\d?).../.test(s)) return 'ip'`
- Non-obvious data transformations: comments before destructuring or mapping

**JSDoc/TSDoc:**
- No JSDoc usage observed
- No TypeScript—pure JavaScript
- No type annotations

**Example from codebase:**
```javascript
// ===================== HEDEF ALGILAMA =====================
function detectTargetType(q) {
  const s = q.trim().toLowerCase();
  if (/^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?).\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(s)) return 'ip';
  if (/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/.test(s)) return 'email';
  // ... more patterns
}
```

## Function Design

**Size:** Small to medium (10-60 lines typical)
- Data loading functions can reach 100+ lines but include nested loops
- Example: `renderResults()` is ~200 lines with DOM manipulation

**Parameters:**
- Most functions take 1-3 parameters
- Object destructuring used in callbacks: `const { filtered=TOOLS, tag='', detected=null } = data`
- Array spread for filter/map chains: `TOOLS.filter(t=>t.cat===tag)`

**Return Values:**
- Functions often return nothing (side effects focus on DOM manipulation)
- Data loading functions build DOM in-place rather than returning structured data
- Boolean returns for toggle states: `toggleLayer()` returns nothing but updates `activeStates`

**Example:**
```javascript
function switchTab(id) {
  activeTabId = id;
  const t = tabs.find(t => t.id === id);
  if (t) renderResults(t.query, t.results, false);
  renderTabs();
}
```

## Module Design

**Exports:** N/A—no module system

**Barrel Files:** N/A—single-page architecture

**Global State:**
- Heavy reliance on global variables: `let tabs = []`, `let activeTabId = null`, `let chatHistory = []`
- Global constants: `const TOOLS = [...]`, `const APPROACH_MAP = {...}`
- DOM state implicitly stored in HTML (classList, textContent, display property)

**Data Locality:**
- All code runs in global scope
- Variables declared at module level (top of `<script>`)
- No closure-based encapsulation

**Initialization:**
```javascript
document.addEventListener('DOMContentLoaded',()=>{
  updateApiStatus();
  renderHistory();
  // ... setup event listeners
});
```

## String Handling

**Concatenation:**
- String concatenation with `+`: `'OSINT LENS v2.0 — ' + version`
- Template literals used in API URLs: `` `${url}?q=${encodeURIComponent(q)}` ``
- HTML string building with concatenation: `'<div class="tool-name">' + tool.name + '</div>'`

**Encoding:**
- URL parameters encoded: `encodeURIComponent(q)`
- HTML entities for special chars in inline styles (e.g., `&#x2197;` for arrow)

## HTML Integration

**Inline Styles:**
- CSS variables used: `background: var(--bg)`, `color: var(--green)`
- Dynamic styles applied directly: `el.style.display = 'block'`, `el.style.cssText = '...'`
- Tailwind/utility classes not used—custom CSS only

**Event Handlers:**
- Inline onclick attributes in HTML: `onclick="toggleLayer(this)"`
- Event listener attachment in JavaScript: `addEventListener('keydown', e => { ... })`
- Mixed approach (some inline, some listeners)

**DOM Queries:**
- `document.getElementById()` most common
- `document.querySelectorAll()` for batch operations
- `element.querySelector()` for nested searches

---

*Convention analysis: 2026-02-27*
