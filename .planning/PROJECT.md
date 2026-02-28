# OSINT Lens

## What This Is

OSINT Lens, analistlerin bir hedef (IP, domain, e-posta, kişi, şirket) hakkında açık kaynak istihbarat toplamas ını hızlandıran tarayıcı tabanlı bir platformdur. 47+ OSINT aracına otomatik link yönlendirme, Groq LLM ile yapılandırılmış istihbarat analizi (BLUF/ACH metodolojisi) ve gerçek zamanlı dünya olayları izleme sunar. GitHub Pages'te static HTML olarak çalışır — backend gerektirmez.

## Core Value

Bir OSINT analisti hedef girdikten sonra doğru araçlara yönlendirilmeli ve Groq destekli yapılandırılmış analiz çıktısı elde etmelidir — hiç sunucu kurmadan.

## Current Milestone: v1.0 — Canlı İstihbarat

**Goal:** Mevcut link-bazlı araç sisteminin yanına gerçek zamanlı veri çekme katmanı eklemek — Reddit, RSS ve Google News'ten hedefle ilgili içerik çekip mevcut Groq analizine dahil etmek.

**Target features:**
- Reddit: hedef için site geneli arama + sabit subreddit izleme (r/netsec, r/OSINT, r/cybersecurity)
- RSS: sabit haber kaynakları (Reuters, BBC, Al Jazeera) + Google News RSS hedef filtresi
- Canlı İstihbarat paneli (mevcut sonuçların altında)
- Çekilen verilerin mevcut Groq analizine otomatik dahil edilmesi

## Requirements

### Validated

<!-- Mevcut kodda çalışan ve değere sahip özellikler. -->

- ✓ 47+ OSINT aracına link yönlendirme (IP/email/domain/şirket/kişi/olay/sosyal medya/görsel/telefon) — pre-v1.0
- ✓ Otomatik hedef tipi tespiti (regex tabanlı: IP, e-posta, domain, şirket) — pre-v1.0
- ✓ Çoklu sekme arama sistemi (tabs[]) — pre-v1.0
- ✓ localStorage tabanlı arama geçmişi (max 8 kayıt) — pre-v1.0
- ✓ Groq LLM analizi (llama-3.3-70b-versatile) — BLUF, hedef profil, tümevarım, tümdengelim, ACH, risk — pre-v1.0
- ✓ Groq destekli sohbet arayüzü (son 10 mesaj bağlamı) — pre-v1.0
- ✓ TXT / PDF / panoya kopyalama export — pre-v1.0
- ✓ Dünya monitörü: Leaflet harita, gerçek zamanlı deprem/doğal afet verileri, HLS haber akışları — pre-v1.0

### Active

<!-- Bu milestone'da inşa edilecekler. -->

- [ ] Reddit hedef araması (Reddit JSON API, CORS'suz)
- [ ] Sabit OSINT subredditlerini izleme
- [ ] Sabit haber RSS kaynakları çekimi (allorigins proxy)
- [ ] Google News RSS hedef filtresi
- [ ] "Canlı İstihbarat" paneli (mevcut arayüze ek)
- [ ] Çekilen verilerin Groq analizine dahil edilmesi

### Out of Scope

- Backend / sunucu — GitHub Pages statik kalacak
- Nitter (CORS engeliyle ulaşılamaz)
- Telegram kanalları (CORS engeliyle ulaşılamaz)
- Kullanıcı kimlik doğrulama — hedef kitlesi kendi API anahtarını getiren analistler

## Context

- Pure static SPA: HTML/CSS/JS, build adımı yok, CDN bağımlılıkları (Leaflet 1.9.4, HLS.js, Google Fonts)
- Mevcut CORS çözümü: allorigins.win proxy (world-monitor'da GDACS/USGS/hava durumu için halihazırda kullanılıyor)
- Reddit JSON API (`/search.json`, `/r/subreddit/new.json`) — CORS başlıklarıyla kamuya açık, proxy gerektirmez
- Google News RSS — allorigins.win proxy gerektirir
- Groq API: Bearer token localStorage'da, her istekte Authorization header'ına ekleniyor
- Dil: Türkçe UI (tüm etiket ve mesajlar Türkçe)
- innerHTML XSS riski mevcut — yeni renderlamada aynı pattern'i kullanacağız, gelecekteki bir milestone'da DOMPurify ile iyileştirilecek

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS, build adımı yok — tüm değişiklikler index.html içinde
- **Deployment**: GitHub Pages static hosting — sunucu tarafı işlem yok
- **CORS**: Yalnızca CORS'u olan API'ler veya allorigins.win proxy kullananlar
- **Mevcut kodu bozmama**: index.html'deki tüm mevcut işlevler çalışmaya devam etmeli

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static-only mimari | GitHub Pages üzerinde çalışıyor, server gerektirmiyor | ✓ Good |
| Groq için localStorage API key | Backend auth olmadan kullanıcı kendi anahtarını getiriyor | — Pending |
| allorigins.win CORS proxy | Harici API'ler için mevcut çözüm, mevcut kod zaten kullanıyor | — Pending |
| Reddit JSON API doğrudan kullanım | CORS başlıkları var, proxy gerektirmiyor | — Pending |

---
*Last updated: 2026-02-28 after v1.0 milestone start*
