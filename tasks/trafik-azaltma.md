# Sayt trafikinin (MB) azaldılması

**Bölmə:** Performans · **Status:** açıq

> Telefon həll olundu (MP4); qalan: kompüterdə kadr çəkisi (5–17 MB/layihə, ana səhifə 28 MB) və yükləmənin vaxtı.

## Ölçü (2026-09-25)

Animasiya kadrları (qalereya şəkilləri əlavə olaraq):

| Səhifə | Telefon (kadrlar) | Kompüter (kadrlar) | Telefon, MP4 (test) |
|---|---|---|---|
| Ana səhifə | 11.4 MB | 28.1 MB | — |
| Belgravia | 3.4 MB | 5.2 MB | 0.8 MB |
| Cannes | 7.1 MB | 12.9 MB | 1.2 MB |
| Villa La Belle | 8.3 MB | 13.4 MB | 1.5 MB |
| Cap Ferrat / Villa Luna | ~10 MB | 15–17 MB | — |

Səbəb: hər kadr ayrıca WebP şəkildir; video kodeki (H.264) isə yalnız kadrlar arasındakı fərqi saxlayır.

## Addımlar

- [x] **Mobil: kadrlar əvəzinə MP4** — bitib, bax [arxiv](../tasks-archive/mobil-mp4.md)
- [ ] **Kompüter:** kadrların keyfiyyətini/ölçüsünü yenidən tənzimləmək (məs. WebP keyfiyyəti, 1280px) — vizual müqayisə ilə
- [ ] Yükləməni yalnız bölmə ekrana yaxınlaşanda başlatmaq (hazırda səhifə yüklənəndən sonra da başlayır)
- [ ] "Data Saver" / yavaş internetdə yalnız statik şəkil (artıq var — yoxlamaq)
- [ ] Nəticəni ölçmək (Chrome DevTools → Network, "Disable cache")
