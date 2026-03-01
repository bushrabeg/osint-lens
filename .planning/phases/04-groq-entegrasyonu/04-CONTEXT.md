# Phase 4: Groq Entegrasyonu - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

`runGroqAnalysis()` fonksiyonunu `window.liveIntelData` verisini okuyacak ve Groq prompt'una ekleyecek şekilde güncelle. Kullanıcı "Groq İstihbarat Analizi" butonuna tıkladığında canlı veri mevcutsa prompt'a otomatik dahil edilir. Canlı veri yoksa veya arama yapılmamışsa mevcut Groq davranışı değişmeden korunur.

</domain>

<decisions>
## Implementation Decisions

### Data Inclusion Scope
- Tüm 4 kaynak dahil edilir: Reddit Hedef, OSINT Subredditler, RSS, Google News
- Unified format: her item için `başlık | kaynak | tarih` — Reddit itemlarında "kaynak" alanı subreddit adıdır (r/netsec), haber itemlarında source adıdır (Reuters)

### Token Budget & Truncation
- Kaynak başına max 5 item — 4 kaynak × 5 = toplam max 20 item
- Truncation: listedeki ilk 5 item alınır (mevcut sıra korunur, tarih sort yapılmaz)
- Boş kaynak (hata veya veri yok): prompt'ta görünmez, sessizce atlanır

### Data Availability
- Veri "mevcut" sayılma eşiği: en az bir kaynak array'i boş değilse
- Veri hala yükleniyorken (loading: true) kullanıcı Groq'u çalıştırırsa: mevcut yüklenmiş veriyle devam et, yüklenmeyenleri atla — kullanıcı bloklanmaz
- Hiç arama yapılmamışsa (tüm arrayler boş, lastTarget yok): eski gibi çalışsın, canlı veri bölümü eklenmez (geriye dönük uyumluluk)

### Prompt Placement & Format
- Canlı veri mevcut Groq prompt'unun SONUNA eklenir — mevcut sistem/kullanıcı prompt yapısına dokunulmaz
- Bölüm başlangıcında Groq'a yönlendirme cümlesi eklenir: "Analizi yaparken aşağıdaki güncel canlı verileri de göz önünde bulundur:"
- Kaynak grupları başlıklarla ayrılır, format:

```
\n\n== CANLI VERİ ==
Analizi yaparken aşağıdaki güncel canlı verileri de göz önünde bulundur:

[Reddit — Hedef Araması]
- başlık | r/subreddit | tarih
- ...

[Reddit — OSINT Subredditler]
- başlık | r/subreddit | tarih

[RSS — Reuters / BBC / Al Jazeera]
- başlık | kaynak | tarih

[Google News]
- başlık | kaynak | tarih
```

### Claude's Discretion
- `runGroqAnalysis()` içinde canlı veri bölümünü oluşturan yardımcı fonksiyonun adı ve yapısı
- Tarih formatı (YYYY-MM-DD zaten Phase 1/2'de sabit — aynı tutuluyor)
- Yönlendirme cümlesinin tam Türkçe metni (yukarıdaki taslak kullanılabilir)

</decisions>

<specifics>
## Specific Ideas

- Prompt bölümü `== CANLI VERİ ==` başlığıyla açıkça işaretlenmeli — Groq modeli context'i kolayca bulabilsin
- Her kaynak grubu kendi başlığıyla ayrılmalı — Groq verinin hangi kaynaktan geldiğini anlayabilsin
- Boş kaynak grupları prompt'a dahil edilmez — "veri yok" gürültüsü yaratılmaz

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-groq-entegrasyonu*
*Context gathered: 2026-03-01*
