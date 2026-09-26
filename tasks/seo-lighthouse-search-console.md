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
- [ ] Vercel → Environment Variables → `NEXT_PUBLIC_SITE_URL=https://vladimir-fasij.com` (Production) → Redeploy (sitemap, canonical, paylaşım linkləri, e-poçtlar bu ünvandan qurulur)
- [ ] Google Search Console: **Domain** property `vladimir-fasij.com` (GoDaddy-də TXT yazısı ilə təsdiq) → Sitemaps → `https://vladimir-fasij.com/sitemap.xml`
- [ ] Search Console → Pages: 1–2 həftə sonra 404 / "redirect" xətalarına baxmaq (köhnə Webflow ünvanları yönləndirilir)
- [ ] Google Business Profile: studiyanın ünvanı, saytı, şəkilləri (London üzrə yerli axtarış)
- [x] Köhnə Webflow ünvanlarının yönləndirilməsi (2026-09-26)
