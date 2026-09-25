# Mobildə scroll animasiyalarının qısaldılması

**Bölmə:** Layihə animasiyaları · **Status:** bitib · **Tarix:** 2026-09-25 · **PR:** zaqurbanov/interior#1

> Telefonda scroll animasiyaları çox uzun idi (ana səhifə ~10 ekran); mobildə sürüşdürmə məsafəsi 45%-ə endirildi.

- [x] 768px-dən dar ekranda bölmə hündürlüyü: 100vh + desktop "scrub" hissəsinin 45%-i (`mobileScrollVh()`, `src/lib/frame-loader.ts`)
- [x] Hündürlük `svh` ilə — ünvan zolağı gizlənəndə bölmə ölçüsü dəyişmir
- [x] Kompüter versiyası dəyişmədi; mərhələlər proqresə görə hesablanır, ona görə yerində qalır

| Səhifə | Əvvəl | Telefonda |
|---|---|---|
| Ana səhifə | ~10 ekran | 5 ekran |
| Villa La Belle | ~7 ekran | ~3.8 ekran |
| Belgravia | ~5 ekran | ~2.8 ekran |

Telefon emulyasiyasında (iPhone 13) yoxlanıb. Real telefonda yoxlama: [tasks/test-real-cihaz.md](../tasks/test-real-cihaz.md). Uzun/qısa görünsə `MOBILE_RUNWAY` (0.45) dəyişdirilir.
