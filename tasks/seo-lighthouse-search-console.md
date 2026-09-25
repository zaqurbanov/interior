# PageSpeed / Lighthouse və Search Console

**Bölmə:** SEO · **Status:** açıq

> Deploy-dan sonra performans yoxlaması və sitemap-in Google-a göndərilməsi.

## Addımlar

- [x] Lokal Lighthouse (2026-09-26, `next start`, Lighthouse 12):

  | Səhifə | Mobil perf | Kompüter perf | Accessibility | Best practices | SEO | CLS |
  |---|---|---|---|---|---|---|
  | Ana səhifə | 55 | 100 | 96 → düzəldildi | 100 | 100 | 0 |
  | Windsor | 85 | 100 | 95 → düzəldildi | 100 | 100 | 0 |
  | Contact | 90 | 100 | 96 → düzəldildi | 100 | 100 | 0 |

  Ana səhifənin mobil balı real deyil: sınaq brauzerində H.264 yoxdur, ona görə MP4 əvəzinə yüzlərlə kadr yükləyib emal etdi (bloklanma 2.4 s). Accessibility: footer yazılarının kontrastı (3.85 → ~6) və loqonun ekran oxuyucu adı düzəldildi.
- [ ] Deploy-dan sonra PageSpeed Insights-da (real Chrome, H.264 var) mobil ana səhifəni yenidən ölçmək
- [ ] Google Search Console-a sitemap göndərmək (`NEXT_PUBLIC_SITE_URL` real domen olandan sonra)
