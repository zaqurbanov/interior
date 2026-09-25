# Mobildə kadrlar əvəzinə MP4

**Bölmə:** Performans · **Status:** bitib · **Tarix:** 2026-09-25 · **PR:** zaqurbanov/interior#2

> Telefonda animasiyalar artıq yüzlərlə WebP kadr deyil, bir MP4 video yükləyir — trafik ~5 dəfə azaldı.

| Səhifə | Əvvəl (kadrlar) | İndi (MP4) |
|---|---|---|
| Ana səhifə | 11.4 MB | 1.5 MB |
| Belgravia | 3.4 MB | 0.7 MB |
| Cannes | 7.1 MB | 1.35 MB |
| Villa La Belle | 8.3 MB | 1.65 MB |
| Cap Ferrat / Villa Luna | ~10 MB | ~1.9 MB |

- [x] `scripts/build-mobile-videos.mjs` — mövcud mobil kadrlardan H.264 (CRF 27) yığır: `public/frames/<slug>/v<n>/mobile.mp4`, ana səhifə `public/frames/home/v1/mobile.mp4`. Orijinal videolar lazım deyil
- [x] Telefonda video oynayır; mərhələ mətnləri videonun vaxtına bağlıdır, fasilələrdə video dayanır
- [x] Video açılmasa (kodek yoxdur, iOS "Low Power Mode" avtomatik oynatmanı bloklayır) avtomatik kadrlara keçir
- [x] Keyfiyyət kadrlarla müqayisə olundu — fərq demək olar ki, görünmür
- [x] Kompüter versiyası dəyişmədi

**Qayda:** kadrlar dəyişəndə (yeni layihə, yenidən çıxarma) `node scripts/build-mobile-videos.mjs` yenidən işlədilməlidir.

Sınaq: Playwright Chromium-da H.264 yoxdur, ona görə video yolu VP9 əvəzləyici ilə, fallback isə olduğu kimi sınandı. Real iPhone/Android-də yoxlama: [tasks/test-real-cihaz.md](../tasks/test-real-cihaz.md).
