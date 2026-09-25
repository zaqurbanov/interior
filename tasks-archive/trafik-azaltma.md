# Sayt trafikinin (MB) azaldılması

**Bölmə:** Performans · **Status:** bitib · **Tarix:** 2026-09-25 · **PR:** zaqurbanov/interior#2

> Telefonda MP4-ə keçildi (~5 dəfə az). Kompüter olduğu kimi qalır — sifarişçinin qərarı.

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

- [x] **Mobil: kadrlar əvəzinə MP4** — bitib, bax [arxiv](mobil-mp4.md)
- [—] **Kompüter:** dəyişməyəcək — sifarişçi indiki keyfiyyəti saxlamağı seçdi (2026-09-25)
- [—] Yükləməni gecikdirmək — kompüter dəyişmədiyi üçün edilmədi
- [—] "Data Saver" yoxlaması → [tasks/test-qenaet-rejimi.md](../tasks/test-qenaet-rejimi.md)
- [x] Ölçüldü — [mobil-mp4](mobil-mp4.md)
