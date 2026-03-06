# Requirements: OSINT Lens

**Defined:** 2026-02-28
**Core Value:** Analist hedef girdikten sonra araçlara yönlendirilmeli ve Groq ile yapılandırılmış analiz yapabilmeli — sunucu gerektirmeden.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Veri Çekme (Data Fetch)

- [x] **FETCH-01**: Kullanıcı hedef aradığında Reddit'te o hedef için arama yapılabilir (Reddit JSON API)
- [x] **FETCH-02**: Kullanıcı belirli OSINT subreddit'lerinden (r/netsec, r/OSINT, r/cybersecurity) son gönderileri görebilir
- [ ] **FETCH-03**: Kullanıcı sabit haber RSS kaynaklarından (Reuters, BBC, Al Jazeera) güncel başlıkları görebilir (allorigins proxy)
- [ ] **FETCH-04**: Kullanıcı Google News RSS'den hedefle ilgili güncel haberleri görebilir (allorigins proxy)

### Panel (Canlı İstihbarat)

- [x] **PANEL-01**: Kullanıcı araç sonuçlarının altında "Canlı İstihbarat" panelini görebilir
- [ ] **PANEL-02**: Kullanıcı her kaynaktan gelen içerikleri (başlık, kaynak, tarih, link) liste olarak görebilir
- [x] **PANEL-03**: Kullanıcı veri çekimini manuel olarak tetikleyebilir (panel içindeki buton ile)
- [x] **PANEL-04**: Kullanıcı yükleme durumunu görebilir (kaynaklar tek tek yüklenirken)
- [x] **PANEL-05**: Kullanıcı kaynaklar arasında filtreleme yapabilir (Reddit / RSS / Hepsi)

### Groq Entegrasyonu

- [x] **GROQ-01**: Kullanıcı "Groq İstihbarat Analizi" çalıştırdığında çekilen canlı veriler analize dahil edilir
- [x] **GROQ-02**: Analiz promptu, canlı verileri (başlık + kaynak + tarih) özet olarak içerir

## v2 Requirements

Deferred to future release.

### Güvenlik & Kalite

- **SEC-01**: Tüm innerHTML renderlamalarına DOMPurify sanitizasyonu eklenmesi
- **SEC-02**: Groq API key localStorage yerine session-only belleğe taşınması
- **PERF-01**: Tool listesinde virtualizasyon (50+ araç DOM yükü)

### Genişletilmiş Kaynaklar

- **SRC-01**: Nitter entegrasyonu (backend proxy gerektirir)
- **SRC-02**: Telegram açık kanalları (backend proxy gerektirir)
- **SRC-03**: Kullanıcının kendi RSS kaynaklarını ekleyebilmesi

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend / sunucu | GitHub Pages statik, sunucu altyapısı yok |
| Nitter | CORS engeli, browser-only yapıyla uyumsuz |
| Telegram kanalları | CORS engeli, browser-only yapıyla uyumsuz |
| Kullanıcı auth | Hedef kitle kendi Groq anahtarını getiren analistler |
| world-monitor.html değişiklikleri | Bu milestone sadece index.html'i etkiler |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FETCH-01 | Phase 1 | Complete |
| FETCH-02 | Phase 1 | Complete |
| FETCH-03 | Phase 2 | Pending |
| FETCH-04 | Phase 2 | Pending |
| PANEL-01 | Phase 3 | Complete |
| PANEL-02 | Phase 3 | Pending |
| PANEL-03 | Phase 3 | Complete |
| PANEL-04 | Phase 3 | Complete |
| PANEL-05 | Phase 3 | Complete |
| GROQ-01 | Phase 4 | Complete |
| GROQ-02 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 after roadmap creation*
