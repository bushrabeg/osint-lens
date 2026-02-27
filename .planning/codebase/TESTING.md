# Testing Patterns

**Analysis Date:** 2026-02-27

## Test Framework

**Status:** No testing framework installed

**Runner:**
- Not configured
- No Jest, Vitest, Mocha, or other runner detected
- No test files (*.test.* or *.spec.*) found in codebase

**Assertion Library:**
- Not applicable—no tests exist

**Run Commands:**
- N/A

## Test File Organization

**Location:** Not applicable—no test files

**Naming:** Not applicable

**Structure:** Not applicable

## Test Strategy

**Current Approach:**
The codebase has no automated testing. All validation and functionality verification is manual:

**Manual testing observed in code:**
- API key validation: `if (!val.startsWith('gsk_'))`
- Input sanitization before display: `.trim()`, `.toUpperCase()`
- Try-catch blocks as runtime error handlers (not test fixtures)

**Fallback mechanisms:**
- Fallback data functions replace failed API calls: `loadFallbackNatural()` when GDACS API fails
- This pattern shows code defensiveness but not test coverage

## Recommended Testing Structure

If testing were to be implemented, based on code patterns:

**Test Suite Organization:**
```
/tests/
├── unit/
│   ├── detection.test.js        # detectTargetType() function
│   ├── markdown.test.js         # renderMarkdown() function
│   └── validation.test.js       # API key validation, input checks
├── integration/
│   ├── api.test.js              # GROQ API calls, error handling
│   ├── data-loading.test.js     # loadNaturalEvents(), loadConflicts(), etc.
│   └── ui-state.test.js         # Tab management, modal open/close
└── e2e/
    ├── search-flow.test.js      # Full search → results → chat flow
    └── monitor-map.test.js      # Map layer toggling, marker rendering
```

## Key Functions Needing Tests

**`detectTargetType(q)` — Regular expression patterns (`index.html:542-549`):**
```javascript
function detectTargetType(q) {
  const s = q.trim().toLowerCase();
  if (/^(25[0-5]|2[0-4]\d|[01]?\d\d?).../.test(s)) return 'ip';
  if (/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/.test(s)) return 'email';
  if (/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}.../.test(s)) return 'domain';
  if (/(inc|ltd|llc|corp|co\.|a\.ş|a\.s|holding|...)/.test(s)) return 'şirket';
  return null;
}
```
**Test cases needed:**
- Valid IPv4 addresses: `192.168.1.1`, `255.255.255.255`
- Invalid IPv4: `256.1.1.1`, `not.an.ip`
- Email addresses: `user@example.com`, `test.email+tag@co.uk`
- Domains: `example.com`, `https://sub.example.com/path`
- Company keywords: `tech inc`, `software ltd`, `holding group`
- Edge cases: empty string, whitespace only, special characters

**`renderMarkdown(md)` — Markdown to HTML conversion (`index.html:985-1000`):**
```javascript
function renderMarkdown(md) {
  return md
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    // ... 10+ more replacements
}
```
**Test cases needed:**
- Heading levels: `#`, `##`, `###`
- Bold/italic: `**text**`, `*text*`
- Lists: `- item`, `1. item`
- Code blocks: `` `code` ``
- Links (if supported)
- Escaped characters
- Mixed formatting

**`sendChatMessage()` — Async API call (`index.html:900-944`):**
```javascript
async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  const key = getApiKey();
  if (!key) { openApiModal(); return; }
  // ... fetch to GROQ API
}
```
**Test cases needed:**
- Empty message handling
- API key missing → redirect to modal
- Successful response parsing
- Error response handling (rate limits, timeouts)
- Message history state management

**`filterTools(q, tag)` — Array filtering (`index.html:779-781`):**
```javascript
function filterTools(q, tag) {
  return tag ? TOOLS.filter(t=>t.cat===tag) : TOOLS;
}
```
**Test cases needed:**
- Filter by category: `'ip'`, `'email'`, `'domain'`
- No category → return all tools
- Invalid category → return empty
- Case sensitivity check

## Mocking Strategy

**For API calls (`sendChatMessage`, `loadNaturalEvents`, etc.):**
Use mock responses:
```javascript
// Mock successful response
const mockGroqResponse = {
  choices: [{
    message: { content: 'Mock OSINT analysis...' }
  }]
};

// Mock error response
const mockErrorResponse = {
  error: { message: 'Rate limit exceeded' }
};
```

**For localStorage (API key management):**
Mock localStorage methods:
```javascript
const mockStorage = {
  getItem: jest.fn(key => {
    if (key === 'groq_api_key') return 'gsk_mock_key';
    return null;
  }),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
```

**For DOM operations:**
Mock or stub:
- `document.getElementById()` → return mock elements with classList, textContent, style properties
- `document.querySelectorAll()` → return mock NodeList
- Event listeners attachment

**What to Mock:**
- External API calls (GROQ, GDACS, USGS, OpenWeatherMap)
- localStorage access
- Fetch calls
- setTimeout/setInterval

**What NOT to Mock:**
- String utility functions (`.trim()`, `.toUpperCase()`, `.replace()`)
- Array methods (`.filter()`, `.map()`, `.forEach()`)
- Regular expression tests
- Pure markdown rendering logic

## Fixtures and Factories

**Test Data:**

**Sample target detections:**
```javascript
const targetExamples = {
  ip: ['192.168.1.1', '10.0.0.1', '255.255.255.255'],
  email: ['user@example.com', 'test+tag@co.uk'],
  domain: ['example.com', 'https://sub.example.com'],
  şirket: ['tech inc', 'software ltd'],
};
```

**Sample API responses:**
```javascript
const mockToolsList = [
  { name: 'LinkedIn', cat: 'şirket', desc: 'Company search', url: 'https://...', query: true },
  { name: 'Shodan', cat: 'ip', desc: 'IP lookup', url: 'https://...', query: true },
  // ... more tools
];
```

**Sample natural events:**
```javascript
const mockNaturalEvents = {
  features: [
    {
      properties: { eventtype: 'EQ', name: 'Turkey M5.2', alertlevel: 'ORANGE' },
      geometry: { coordinates: [38.5, 38.0] }
    }
  ]
};
```

**Location:**
- Store in `tests/fixtures/` directory (recommended if testing added)
- Or inline in test files for small datasets

## Coverage

**Current Coverage:** 0% (no tests)

**Target Coverage (if implemented):**
- Unit tests: Core functions like `detectTargetType()`, `renderMarkdown()`, `filterTools()` → aim for 80%+
- Integration tests: API interactions, state management → aim for 60%+
- E2E tests: User workflows (search, chat, map interactions) → key paths only

**View Coverage (command not implemented):**
```bash
# If Jest were installed:
npm test -- --coverage

# If Vitest:
npx vitest --coverage
```

## Test Types

**Unit Tests (if implemented):**
- Scope: Individual functions in isolation
- Approach: Test pure functions (regex detection, markdown rendering, filtering)
- Target: Functions with no DOM dependencies
- Files: `detectTargetType()`, `filterTools()`, `renderMarkdown()`

**Integration Tests (if implemented):**
- Scope: Function interactions with localStorage, API calls, state management
- Approach: Mock external APIs, test state transitions
- Target: `sendChatMessage()` + `appendChatMsg()` + `chatHistory` state
- Target: `loadNaturalEvents()` + `layerGroups` + DOM rendering
- Target: Tab creation/switching/closing workflow

**E2E Tests (if implemented):**
- Framework: Cypress, Puppeteer, or Playwright would be needed
- Scope: Full user workflows in browser
- Target flows:
  1. Search for target → detect type → show tools → click result
  2. Run GROQ analysis → display report → export as TXT/PDF
  3. Toggle map layers → load live data → open popups
  4. Chat with AI → send message → receive response

## Async Testing Patterns

If async tests were written, based on code patterns:

```javascript
// For fetch-based tests
test('sendChatMessage sends correct API request', async () => {
  const mockFetch = jest.fn()
    .mockResolvedValueOnce({
      json: () => Promise.resolve(mockGroqResponse)
    });
  global.fetch = mockFetch;

  // ... call sendChatMessage()

  expect(mockFetch).toHaveBeenCalledWith(
    'https://api.groq.com/openai/v1/chat/completions',
    expect.objectContaining({
      method: 'POST',
      headers: { 'Authorization': 'Bearer gsk_...' }
    })
  );
});

// For setTimeout tests
test('API modal opens when key missing', async () => {
  jest.useFakeTimers();
  // ... call sendChatMessage() without API key
  expect(openApiModalSpy).toHaveBeenCalled();
  jest.runAllTimers();
});
```

## Error Testing Patterns

Based on error handling in codebase:

```javascript
// Test try-catch behavior
test('loadNaturalEvents falls back on API failure', async () => {
  const mockFetch = jest.fn()
    .mockRejectedValueOnce(new Error('CORS error'));

  await loadNaturalEvents();

  // Should call loadFallbackNatural()
  expect(loadFallbackNaturalSpy).toHaveBeenCalled();
});

// Test error response handling
test('API error message shown to user', async () => {
  const errorResponse = {
    error: { message: 'Unauthorized' }
  };

  // ... simulate error from GROQ API

  expect(appendChatMsgSpy).toHaveBeenCalledWith(
    'assistant',
    expect.stringContaining('Unauthorized')
  );
});
```

## Current Code Quality Observations

**Strengths:**
- Defensive coding with fallbacks (GDACS → fallback data)
- Input validation before API calls
- Error messages shown to users (not silent failures)

**Gaps:**
- No automated regression testing
- Manual testing required for all features
- High risk of breaking changes during refactoring
- No CI/CD pipeline to catch issues

**Recommended Next Steps:**
1. Install testing framework: `npm install --save-dev vitest @vitest/ui`
2. Add unit tests for pure functions first (20% effort, high coverage)
3. Add integration tests for API interactions
4. Consider E2E tests for critical user workflows

---

*Testing analysis: 2026-02-27*
