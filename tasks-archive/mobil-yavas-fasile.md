# Mobildə mətn çıxanda video dayanmır

**Bölmə:** Layihə animasiyaları · **Status:** bitib · **Tarix:** 2026-09-25

> Sifarişçi (Android): mətn çıxanda video "ilişir". Səbəb xəta deyildi — hər mərhələdə video 2.6 s tam dayanırdı ki, mətn oxunsun.

- [x] Tam fasilə əvəzinə video yavaşlayır (~0.3× sürət, təxminən 2.6 s), sonra yenidən normal sürətə qayıdır; keçid yumşaqdır
- [x] Başlanğıcdakı 1.5 s gözləmə də yavaş başlanğıcla əvəz olundu
- [x] Səhnələr arası qəsdən saxlanan kadr (ana səhifədə boş otaq → əşyalı otaq arası) olduğu kimi qaldı; həmin yerə düşən mətnin yavaşlaması növbəti səhnənin əvvəlinə keçir
- [x] Həm MP4 (`playbackRate`), həm də ehtiyat kadr oynadıcısında; kompüter dəyişmədi
- [x] Ana səhifə animasiyası ~39 s-dən ~30 s-ə qısaldı

Kod: `src/lib/autoplay.ts` (`slowZones`, `rateAt`, `SLOW_RATE`). Sınaq: hər iki oynadıcının simulyasiyası — heç bir yerdə 33 ms-dən uzun donma yoxdur; `npm run build` keçdi. Real telefonda: [tasks/test-real-cihaz.md](../tasks/test-real-cihaz.md).
