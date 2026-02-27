# External Integrations

**Analysis Date:** 2026-02-27

## APIs & External Services

**AI & Analysis:**
- Groq API - AI-powered OSINT analysis and chat
  - SDK/Client: Native fetch API to `https://api.groq.com/openai/v1/chat/completions`
  - Auth: Bearer token stored in localStorage as `groq_api_key` (user-provided)
  - Models: `llama-3.3-70b-versatile`
  - Console: `https://console.groq.com` (free signup required)

**OSINT Search Platforms:**
- 40+ integrated search endpoints (no direct API calls, link-based):
  - LinkedIn, Crunchbase, OpenCorporates, Google News, Glassdoor, Indeed, Bloomberg (company research)
  - Twitter/X, Wayback Machine, Spokeo, Pipl, Google Dorks (person search)
  - Whois, Shodan, BuiltWith, Censys, VirusTotal, URLScan.io, DNSdumpster, SecurityTrails (domain/IP analysis)
  - AbuseIPDB, IPinfo.io, GreyNoise, VirusTotal (IP intelligence)
  - Hunter.io, HaveIBeenPwned, EmailRep, Epieos (email verification)
  - GDELT, Pastebin Search, Bellingcat (event monitoring)
  - Instagram (Picuki), Reddit, YouTube, TikTok, Telegram, GitHub (social media)
  - Google Reverse Image, TinEye, Yandex Images, FotoForensics (image search)

**Natural Events & Monitoring:**
- GDACS (Global Disaster Alert and Coordination System) - `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH`
  - Via CORS proxy: `https://api.allorigins.win/`
  - Event types: Earthquakes, Tropical Cyclones, Floods, Volcanoes, Wildfires, Droughts
- USGS Earthquake API - `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/`
  - Via CORS proxy: `https://api.allorigins.win/`
  - Feeds: Significant earthquakes (real-time, past day, week, month)
- wttr.in Weather API - `https://wttr.in/` (weather forecasts)
  - Via CORS proxy: `https://api.allorigins.win/`

**Live News Streams (HLS):**
- Al Jazeera English - `https://live-hls-web-aje-gcp.thehlive.com/AJE/index.m3u8`
- DW News (Deutsche Welle) - `https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8`
- France 24 - `https://francetv-rbp.cdn.france.tv/live/francais/fra24_hq/master_eac3_isom.m3u8`
- Sky News - `https://linear417-gb-hls1-prd-ak.cdn.skycdp.com/100e/Content/HLS_001_1080_30/Live/channel(skynews)/index_1080-30.m3u8`
- Bloomberg - `https://liveproduseast.global.ssl.fastly.net/us/Channel-USTV-AWS-virginia-1/Source-USTV-1000-1_live.m3u8`

## Data Storage

**Databases:**
- None - Application is fully client-side

**File Storage:**
- Local browser storage only
  - localStorage key: `groq_api_key` - Persists Groq API key
  - Session state: Currently selected search queries, analysis results

**Caching:**
- Browser cache for CDN resources (Leaflet, HLS.js, Google Fonts)
- No server-side caching

## Authentication & Identity

**Auth Provider:**
- Groq Console (OAuth2-compatible) - Users create free account at `https://console.groq.com`
  - Auth via: Google or GitHub accounts
  - Output: API key (format: `gsk_*`)

**Implementation:**
- User-provided API key stored in browser localStorage
- Bearer token sent with each Groq API request
- No session management or server-side authentication

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Rollbar, or similar service

**Logs:**
- Browser console logging only
- HLS.js error callbacks logged to console (stream reconnection on fatal errors)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (static file hosting)
- Custom domain via CNAME file

**CI Pipeline:**
- None detected - Direct file deployment

## Environment Configuration

**Required env vars:**
- None - Application is client-side only

**Secrets location:**
- Browser localStorage (user-controlled)
- `.env` files: Not applicable

## Webhooks & Callbacks

**Incoming:**
- None - Application is request-only

**Outgoing:**
- None - No webhook capabilities

## External Data Integrations

**Map Data:**
- CartoDB Dark Map Tiles - Base map layer for Leaflet
  - Source: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
  - Attribution: OpenStreetMap, CartoDB

**Font & Visual Resources:**
- Google Fonts API - Share Tech Mono, Rajdhani typefaces
  - CDN: `https://fonts.googleapis.com/`

**Video Embedding:**
- YouTube Iframe API - `https://www.youtube.com/iframe_api`
  - Used for embedding YouTube videos in world monitor

## CORS Handling

**Proxy Service:**
- All Origins (`https://api.allorigins.win/get`)
  - Wraps requests to GDACS, USGS, wttr.in to bypass CORS restrictions
  - URL format: `https://api.allorigins.win/get?url=[encoded_url]`

---

*Integration audit: 2026-02-27*
