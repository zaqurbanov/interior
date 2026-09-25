# Mobil avtomatik oynatmanın təkmilləşdirilməsi

**Bölmə:** Layihə animasiyaları · **Status:** açıq

> Sifarişçi yoxladı: avtomatik oynatma işləyir, amma daha yaxşı ola bilər — nəyin dəyişəcəyi dəqiqləşdirilməlidir.

## Təsvir

Mobildə scroll animasiyaları avtomatik oynayır ([arxiv](../tasks-archive/mobil-avtomatik-video.md)). Real telefonda baxılıb; təkmilləşdirmə istənir.

## Addımlar

- [ ] Sifarişçidən konkret qeydləri almaq (nə pis görünür / nə istənir)
- [ ] Ehtimal olunan variantlar (qeydlərə görə seçilir):
  - [ ] Başlanğıcda gözləməni azaltmaq (MP4 artıq var — [arxiv](../tasks-archive/mobil-mp4.md))
  - [ ] Toxunaraq dayandırmaq / davam etdirmək
  - [ ] Mərhələ fasiləsinin (`STAGE_HOLD_MS`, 2.6 s) və sürətin tənzimlənməsi
  - [ ] Mətnin oxunaqlığı, keçid animasiyaları

## Scroll kilidi (PR #6) — sonrakı addımlar

Mobildə animasiya oynayarkən səhifə bölmədə saxlanılır, yalnız ox ("Continue") ilə keçilir ([arxiv](../tasks-archive/mobil-scroll-kilidi.md)).

- [ ] Risk: ziyarətçi oxu görməsə "ilişib qaldığını" düşünə bilər — real telefonda yoxlamaq
- [ ] Video bitəndə kilidi avtomatik açmaq (asan dəyişiklik, `useScrollGate`-də `release()` çağırmaq)
- [ ] Lazım olsa oxu daha görünən etmək (ölçü, yüngül animasiya)
