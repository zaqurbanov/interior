# Tapşırıqlar

Açıq işlərin indeksi. Hər tapşırığın ayrıca faylı `tasks/`-dadır; bitmiş işlər [`tasks-archive/`](tasks-archive/README.md)-dadır. Daimi qeydlər: [docs/vacib-qeydler.md](docs/vacib-qeydler.md).

**Qayda:**
- Yeni iş → `tasks/<qisa-ad>.md` faylı (aşağıdakı şablonla) + bu indeksdə uyğun bölməyə bir sətir: başlıq, qısa təsvir, link.
- İş bitəndə → faylı `tasks-archive/`-ə köçür (`git mv`), `Status: bitib` və tarixi/PR-ı yaz, sətri buradan silib [`tasks-archive/README.md`](tasks-archive/README.md)-yə (bölməsinin ən üstünə) əlavə et.

**İdeyalar:** [docs/ideyalar/2026-09-26.md](docs/ideyalar/2026-09-26.md) — ideya agentinin 36 təklifi (ilk 5 tövsiyə yuxarıda). Seçilənlər task olur.

## Kim edir — icmal (2026-09-26)

Aşağıdakı bölmələrin eyni işləri, kimin etməli olduğuna görə qruplaşdırılıb. Siyahı dəyişəndə bu icmal da yenilənsin.

**Claude edə bilər (heç nə lazım deyil):**
— (hamısı görüldü, 2026-09-26). Kadrların Blob-a köçməsi üçün kod hazırdır, [yükləmə istifadəçidədir](tasks/kadrlari-blob-a-kocurmek.md).

**İstifadəçi edir — Vercel / GitHub / Resend / admin (Claude addım-addım göstərir):**

3. [Resend (e-poçt)](tasks/resend-qurulmasi.md) — hesab, domen təsdiqi, API açarı.
4. [GitHub token](tasks/kadr-isi-qurulmasi.md) — admindən animasiya yaratmaq üçün.
5. Vercel — [Deployment Retention Policy və Usage yoxlaması](tasks/vercel-yaddas-limiti.md) (1–2 gün sonra); [dəyişənlərin Preview üçün də seçilməsi](tasks/vercel-env-ve-login.md).
6. [`.env.local` təmizliyi](tasks/env-local-temizlik.md) — istifadə olunmayan `MONGODB_USER` / `MONGODB_PASS`, Atlas şifrəsinin gücü.
7. [Admin panelin real yoxlanması](tasks/admin-real-yoxlama.md) — 13 bəndlik sınaq siyahısı.
8. [Admin-də kiçik işlər](tasks/mezmun-duzelisleri.md) — "360 & VR" xidmətinə şəkil, "Villa At Cap D'Ail" başlığı.
9. [Videoların ehtiyat nüsxəsi](tasks/video-ehtiyat-nusxe.md) — `windsor`, `ail1`, `ail2`, `belg.mp4` yalnız lokaldadır → Drive.
10. Test — [real telefonda (iPhone / Android)](tasks/test-real-cihaz.md).

**İstifadəçi / studiya yazır:**

- [Jurnal məqalələri](tasks/jurnal-ilk-meqaleler.md) — ilk 3–5 məqalə, mövzu nümunələri taskda.

**Sifarişçidən gözlənilir:**

11. [Domen](tasks/animasiya-linkleri-404.md) — `vladimir-fasij.com` yeni sayta bağlansın; sonra `NEXT_PUBLIC_SITE_URL`, [Search Console və PageSpeed](tasks/seo-lighthouse-search-console.md).
12. [Persian Gulf Coast Villa](tasks/animasiya-persian-gulf.md) — animasiya üçün video.
13. [Mətnlər](tasks/mezmun-duzelisleri.md) — Villa Luna-nın düzgün mətni, rəqəmlərin yoxlanması.
14. [Qalereya variantının təsdiqi](tasks/qalereya-tesdiq.md).
15. [Mobil animasiya haqqında qeydlər](tasks/mobil-autoplay-tekmillesdirme.md).
16. [Yeni bölmələr](tasks/yeni-bolmeler.md) — rəylər, mətbuat, FAQ olacaqmı.

## Yerləşdirmə (Vercel)

- **[Vercel yaddaş limiti](tasks/vercel-yaddas-limiti.md)** — Pulsuz planın 10 GB "Functions Storage" limiti doldu; kod düzəldildi, köhnə deploy-lar silinməlidir.
- **[Vercel mühit dəyişənləri və admin login](tasks/vercel-env-ve-login.md)** — Deploy-da login `MissingSecret` xətası verir; `AUTH_SECRET`, `MONGODB_URI` və s. Vercel-ə əlavə olunmalı, Blob qoşulmalı.
- **[Animasiyalı layihələrin linkləri "Page not found" verir](tasks/animasiya-linkleri-404.md)** — `https://vladimir-fasij.com/projects/...` linkləri "Page not found" verir — ehtimal: domen hələ köhnə sayta baxır, yeni sayt yalnız Vercel ünvanındadır.
- **[`.env.local` və Atlas təhlükəsizliyi](tasks/env-local-temizlik.md)** — Lokal Blob token-i, istifadə olunmayan DB dəyişənlərinin silinməsi, Atlas şifrəsinin gücü.
- **[Resend (e-poçt) qurulması](tasks/resend-qurulmasi.md)** — Sorğu bildirişləri və müştəriyə avtomatik cavab üçün Resend hesabı, domen təsdiqi və Vercel dəyişənləri.
- **[Animasiya redaktoru üçün kadr işinin qurulması](tasks/kadr-isi-qurulmasi.md)** — Admin paneldə "Make frames" işləsin deyə GitHub token-i, repo secret-ləri və Vercel dəyişənləri.

## Admin panel

- **[Admin panelin real (bazalı) yoxlanması](tasks/admin-real-yoxlama.md)** — Mərhələ 1–3 və sayt məzmunu bazasız sessiyada yazılıb; Vercel preview-da baza və Blob ilə sınanmalıdır.
- **[Mövcud kadrları Blob-a köçürmək](tasks/kadrlari-blob-a-kocurmek.md)** — Kod və yükləmə skripti hazırdır; qalan: skripti işlətmək, `NEXT_PUBLIC_FRAMES_BASE`-i Vercel-ə yazmaq, sonra `public/frames`-i git-dən silmək.

## Layihə animasiyaları

- **[Animasiya: Persian Gulf Coast Villa](tasks/animasiya-persian-gulf.md)** — `persian-gulf-coast-villa` üçün scroll video — video lazımdır.
- **[Mobil avtomatik oynatmanın təkmilləşdirilməsi](tasks/mobil-autoplay-tekmillesdirme.md)** — Avtomatik oynatma və scroll kilidi işləyir; təkmilləşdirmə qeydləri, "ilişib qalma" riski və video bitəndə kilidin avtomatik açılması.

## Fayllar və ehtiyat nüsxə

- **[Mənbə videoların ehtiyat nüsxəsi](tasks/video-ehtiyat-nusxe.md)** — Kadrları yenidən çıxarmaq üçün orijinal MP4-lər lazımdır; çoxu artıq `videos/`-da yoxdur.

## SEO

- **[Jurnal: ilk məqalələr](tasks/jurnal-ilk-meqaleler.md)** — Bölmə hazırdır; ilk 3–5 məqaləni yazmaq, ayda 1–2 ritm, mövzu nümunələri.
- **[PageSpeed / Lighthouse və Search Console](tasks/seo-lighthouse-search-console.md)** — Deploy-dan sonra performans yoxlaması və sitemap-in Google-a göndərilməsi.
- **[Layihə mətnlərinin düzəlişi](tasks/mezmun-duzelisleri.md)** — Mənbə saytdan gələn yazı səhvləri, Villa Luna-nın səhv təsviri, şəkilsiz xidmət və alt mətnləri.

## Test

- **[Real cihazda və müxtəlif ekranlarda test](tasks/test-real-cihaz.md)** — iOS Safari / Android Chrome, portret ekranda kəsilmə, lightbox.

## Sifarişçi ilə

- **[Qalereya variantının təsdiqi](tasks/qalereya-tesdiq.md)** — Bütün layihələrdə "Showcase" (6 şəkil + "View all") — sifarişçi təsdiqləməlidir.
- **[Yeni bölmələr: rəylər, mətbuat, FAQ](tasks/yeni-bolmeler.md)** — Saytda müştəri rəyləri, mətbuat/mükafatlar və ya FAQ olacaqsa — admin paneldən idarə olunan bölmələr.

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
