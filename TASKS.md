# Tapşırıqlar

Açıq işlərin indeksi. Hər tapşırığın ayrıca faylı `tasks/`-dadır; bitmiş işlər [`tasks-archive/`](tasks-archive/README.md)-dadır. Daimi qeydlər: [docs/vacib-qeydler.md](docs/vacib-qeydler.md).

**Qayda:**
- Yeni iş → `tasks/<qisa-ad>.md` faylı (aşağıdakı şablonla) + bu indeksdə uyğun bölməyə bir sətir: başlıq, qısa təsvir, link.
- İş bitəndə → faylı `tasks-archive/`-ə köçür (`git mv`), `Status: bitib` və tarixi/PR-ı yaz, sətri buradan silib [`tasks-archive/README.md`](tasks-archive/README.md)-yə (bölməsinin ən üstünə) əlavə et.

## Yerləşdirmə (Vercel)

- **[Vercel mühit dəyişənləri və admin login](tasks/vercel-env-ve-login.md)** — Deploy-da login `MissingSecret` xətası verir; `AUTH_SECRET`, `MONGODB_URI` və s. Vercel-ə əlavə olunmalı, Blob qoşulmalı.
- **[`.env.local` və Atlas təhlükəsizliyi](tasks/env-local-temizlik.md)** — Lokal Blob token-i, istifadə olunmayan DB dəyişənlərinin silinməsi, Atlas şifrəsinin gücü.
- **[Resend (e-poçt) qurulması](tasks/resend-qurulmasi.md)** — Sorğu bildirişləri və müştəriyə avtomatik cavab üçün Resend hesabı, domen təsdiqi və Vercel dəyişənləri.

## Admin panel

- **[Admin panelin real (bazalı) yoxlanması](tasks/admin-real-yoxlama.md)** — Mərhələ 1–3 və sayt məzmunu bazasız sessiyada yazılıb; Vercel preview-da baza və Blob ilə sınanmalıdır.
- **[Mərhələ 4 — Animasiya redaktoru](tasks/admin-m4-animasiya-redaktoru.md)** — Story-ləri bazaya köçürmək, video yükləmə, GitHub Actions ilə kadr çıxarma, vizual timeline, kadrları Blob-a köçürmək.
- **[Mərhələ 5 — Dashboard və əlavələr](tasks/admin-m5-dashboard.md)** — Sorğu qrafiki, "diqqət tələb edir" siyahısı, dəyişiklik tarixçəsi, yeni bölmələr.

## Layihə animasiyaları

- **[Animasiya: Persian Gulf Coast Villa](tasks/animasiya-persian-gulf.md)** — `persian-gulf-coast-villa` üçün scroll video — video lazımdır.
- **[Animasiya: Villa at Cap d'Ail](tasks/animasiya-cap-d-ail.md)** — `cap-d-ail` üçün scroll video — video lazımdır.
- **[Animasiya: Windsor Estate](tasks/animasiya-windsor.md)** — `windsor` üçün scroll video — video lazımdır.

## Fayllar və ehtiyat nüsxə

- **[Mənbə videoların ehtiyat nüsxəsi](tasks/video-ehtiyat-nusxe.md)** — Kadrları yenidən çıxarmaq üçün orijinal MP4-lər lazımdır; çoxu artıq `videos/`-da yoxdur.

## SEO

- **[PageSpeed / Lighthouse və Search Console](tasks/seo-lighthouse-search-console.md)** — Deploy-dan sonra performans yoxlaması və sitemap-in Google-a göndərilməsi.
- **[`VideoObject` strukturlaşdırılmış məlumatı](tasks/seo-videoobject.md)** — Google-da video nəticəsi kimi görünmək üçün layihə videolarına schema.org `VideoObject`.
- **[Layihə mətnlərinin düzəlişi](tasks/mezmun-duzelisleri.md)** — Mənbə saytdan gələn yazı səhvləri və Villa Luna-nın səhv təsviri.

## Test

- **[Qənaət rejimi testi](tasks/test-qenaet-rejimi.md)** — `prefers-reduced-motion` və Data Saver ilə animasiyanın şəkil + mətnə çevrilməsi.
- **[Real cihazda və müxtəlif ekranlarda test](tasks/test-real-cihaz.md)** — iOS Safari / Android Chrome, portret ekranda kəsilmə, lightbox.

## Sifarişçi ilə

- **[Qalereya variantının təsdiqi](tasks/qalereya-tesdiq.md)** — Bütün layihələrdə "Showcase" (6 şəkil + "View all") — sifarişçi təsdiqləməlidir.

## Şablon

```markdown
# Başlıq

**Bölmə:** … · **Status:** açıq

> Bir cümləlik təsvir (indeksdəki ilə eyni).

## Təsvir
…

## Addımlar
- [ ] …
```
