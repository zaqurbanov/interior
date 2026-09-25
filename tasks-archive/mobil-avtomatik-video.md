# Mobildə animasiyaların avtomatik oynaması

**Bölmə:** Layihə animasiyaları · **Status:** bitib · **Tarix:** 2026-09-25

> Telefonda scroll animasiyaları artıq sürüşdürmə ilə deyil, video kimi avtomatik oynayır; bölmə 1 ekrandır.

- [x] 768px-dən dar ekranda (ana səhifə və layihə səhifələri) bölmə 1 ekran (`svh`), səhifə adi qaydada sürüşür
- [x] Kadrlar video sürətində (ana səhifə 24 fps, layihələr öz `fps`-i) oynayır; hər mərhələdə mətni oxumaq üçün 2.6 saniyə fasilə
- [x] Yüklənməmiş kadra çatanda gözləyir (kadr atlamır); kadrlar ardıcıl yüklənir
- [x] Bölmə ekranın 40%-dən azında görünəndə dayanır, qayıdanda davam edir
- [x] Sonda son kadrda qalır, "Replay" düyməsi çıxır; aşağı ox həmişə görünür
- [x] Kompüter versiyası dəyişmədi (scroll ilə)

Müddət (emulyasiyada): ana səhifə ~40 s, Belgravia ~21 s. Fasiləni dəyişmək: `STAGE_HOLD_MS` (`src/lib/autoplay.ts`).

Əvəz etdiyi: [mobil-scroll-qisaltma](mobil-scroll-qisaltma.md) (mobil scroll 45%-ə qısaldılmışdı).
