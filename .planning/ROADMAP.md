# Roadmap: OSINT Lens

## Overview

v1.0 Canlı İstihbarat, mevcut link-bazlı OSINT aracının yanına gerçek zamanlı veri çekme katmanı ekler. Dört fazda ilerler: önce Reddit verisi, sonra RSS/Google News verisi, ardından bu verileri kullanan Canlı İstihbarat paneli, son olarak Groq analizine veri entegrasyonu. Her faz tek başına test edilebilir, sonraki fazın temelidir.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Reddit Veri Çekme** - Hedef araması ve OSINT subreddit izleme için Reddit JSON API entegrasyonu
- [ ] **Phase 2: RSS ve Google News Veri Çekme** - allorigins proxy ile sabit haber kaynakları ve hedef-filtreli Google News çekimi
- [ ] **Phase 3: Canlı İstihbarat Paneli** - Araç sonuçlarının altında çekilen verileri gösteren panel UI
- [ ] **Phase 4: Groq Entegrasyonu** - Çekilen canlı verilerin Groq analizine dahil edilmesi

## Phase Details

### Phase 1: Reddit Veri Çekme
**Goal**: Kullanıcı bir hedef aradığında Reddit'ten o hedefe ait gönderiler ve OSINT subredditlerinin son içerikleri çekilmiş olur
**Depends on**: Nothing (first phase)
**Requirements**: FETCH-01, FETCH-02
**Success Criteria** (what must be TRUE):
  1. Kullanıcı hedef girdiğinde Reddit genelinde o hedefle ilgili gönderiler JavaScript'te alınabilir (API yanıtı console veya değişkende görülebilir)
  2. r/netsec, r/OSINT ve r/cybersecurity için son gönderiler çekilebilir (üç subreddit birbirinden bağımsız sorgulanır)
  3. Çekilen her gönderi için başlık, kaynak (subreddit), tarih ve URL mevcut yapıda tutulur
  4. Reddit API çağrısı CORS hatası vermez, proxy gerektirmez
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — fetchRedditTarget() ve fetchRedditSubreddits() fonksiyonlarını yaz, window.liveIntelData nesnesinde sakla

### Phase 2: RSS ve Google News Veri Çekme
**Goal**: Kullanıcı bir hedef aradığında Reuters, BBC, Al Jazeera ve Google News'ten o hedefe ait haberler çekilmiş olur
**Depends on**: Phase 1
**Requirements**: FETCH-03, FETCH-04
**Success Criteria** (what must be TRUE):
  1. Reuters, BBC ve Al Jazeera RSS beslemeleri allorigins.win proxy aracılığıyla XML olarak alınır ve parse edilir
  2. Google News RSS, hedef terimi URL-encode edilerek sorgulanır ve ilgili haberler döner
  3. Çekilen her haber için başlık, kaynak adı, yayın tarihi ve link mevcut yapıda tutulur
  4. Proxy hatası veya boş yanıt durumunda hata sessizce ele alınır, diğer kaynaklar etkilenmez
**Plans**: 1 plan

Plans:
- [ ] 02-01-PLAN.md — fetchRSSFeeds() ve fetchGoogleNews() fonksiyonlarını yaz, window.liveIntelData'ya ekle

### Phase 3: Canlı İstihbarat Paneli
**Goal**: Kullanıcı araç sonuçlarının altında Canlı İstihbarat panelini görebilir, içerikleri listeleyebilir, yükleme durumunu izleyebilir ve kaynak filtresi uygulayabilir
**Depends on**: Phase 2
**Requirements**: PANEL-01, PANEL-02, PANEL-03, PANEL-04, PANEL-05
**Success Criteria** (what must be TRUE):
  1. Hedef arandığında araç sonuçlarının altında "Canlı İstihbarat" başlıklı panel görünür
  2. Panel içinde her kaynak için başlık, kaynak adı, tarih ve tıklanabilir link listesi gösterilir
  3. "Yenile" butonu tıklandığında veri çekimi yeniden tetiklenir ve sonuçlar güncellenir
  4. Yükleme sırasında her kaynağın durumu ayrı ayrı (yükleniyor / tamam / hata) gösterilir
  5. "Reddit / RSS / Hepsi" filtre butonları ile görüntülenen içerikler kaynak tipine göre süzülür
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Panel HTML iskeleti ve CSS'i yaz, showLiveIntelPanel() ile startSearch()'e bagla
- [ ] 03-02-PLAN.md — renderLiveIntel(), setLiveIntelFilter(), refreshLiveIntel() fonksiyonlarini yaz

### Phase 4: Groq Entegrasyonu
**Goal**: Kullanıcı Groq İstihbarat Analizi çalıştırdığında çekilen canlı veriler prompt'a otomatik dahil edilir
**Depends on**: Phase 3
**Requirements**: GROQ-01, GROQ-02
**Success Criteria** (what must be TRUE):
  1. Kullanıcı "Groq İstihbarat Analizi" butonuna tıkladığında canlı veri mevcutsa Groq prompt'u bunları içerir
  2. Prompt'ta canlı veriler "başlık | kaynak | tarih" formatında özet olarak listelenir (maksimum token bütçesi gözetilir)
  3. Canlı veri yoksa veya henüz çekilmemişse Groq analizi önceki gibi çalışmaya devam eder (geriye dönük uyumluluk)
**Plans**: TBD

Plans:
- [ ] 04-01: runGroqAnalysis() fonksiyonunu window.liveIntelData dahil edecek şekilde güncelle

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Reddit Veri Çekme | 0/1 | Not started | - |
| 2. RSS ve Google News Veri Çekme | 0/1 | Not started | - |
| 3. Canlı İstihbarat Paneli | 0/2 | Not started | - |
| 4. Groq Entegrasyonu | 0/1 | Not started | - |
