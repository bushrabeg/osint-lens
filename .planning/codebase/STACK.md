# Technology Stack

**Analysis Date:** 2026-02-27

## Languages

**Primary:**
- HTML5 - Markup and page structure for both main application and world monitor
- CSS3 - Styling with CSS variables for theming, animations, and responsive design
- JavaScript (ES6+) - Client-side logic, API integration, DOM manipulation

**Secondary:**
- None detected

## Runtime

**Environment:**
- Browser-based (client-side only) - Chrome, Firefox, Safari, Edge compatible

**Package Manager:**
- None - This is a static web application with no build process or package dependencies

**Lockfile:**
- Not applicable - no dependency management system used

## Frameworks

**Core:**
- Leaflet 1.9.4 - Interactive mapping library for world monitor
- HLS.js (latest) - HTTP Live Streaming player for video feeds in world monitor

**CSS Framework:**
- None - Custom CSS with design system using CSS variables

**Build/Dev:**
- None - Static HTML/CSS/JS, no build process required

## Key Dependencies

**Critical:**
- Leaflet 1.9.4 (`https://unpkg.com/leaflet@1.9.4`) - Powers the world monitor map interface with interactive markers and real-time data visualization
- HLS.js (latest) (`https://cdn.jsdelivr.net/npm/hls.js@latest`) - Enables playback of live news streams (Al Jazeera, DW News, France 24, Sky News, Bloomberg) in the world monitor

**Infrastructure:**
- Google Fonts (Share Tech Mono, Rajdhani) - Typography via CDN
- CartoDB Dark Map Tiles (`https://cartodb.com/`) - Base layer for world monitor map
- AllOrigins (`https://api.allorigins.win/`) - CORS proxy for external API calls (GDACS, USGS, wttr.in)

## Configuration

**Environment:**
- No environment variables configured
- API keys stored in browser localStorage with key: `groq_api_key`
- localStorage usage: Persists Groq API key for offline availability

**Build:**
- No build configuration - Direct HTML, CSS, JS delivery

## Platform Requirements

**Development:**
- Text editor (any)
- Local web server for testing (required for CORS with APIs)

**Production:**
- Static file hosting (GitHub Pages via CNAME: `osint-lens`)
- HTTP/HTTPS capable server

## Deployment Configuration

**Hosting:**
- GitHub Pages (`osint-lens` CNAME record present)
- Located at: `/Users/busranur.begcecanli/Desktop/osint-lens/`

**Entry Points:**
- `index.html` (1050 lines) - Main OSINT tool with Groq AI analysis
- `world-monitor.html` (1692 lines) - Real-time world events dashboard
- `CNAME` - GitHub Pages configuration for custom domain

---

*Stack analysis: 2026-02-27*
