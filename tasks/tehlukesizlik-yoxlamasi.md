# Təhlükəsizlik yoxlamasının nəticələri

**Bölmə:** Təhlükəsizlik · **Status:** açıq

> 2026-09-25 yoxlaması: ciddi boşluq yoxdur; 4 yer gücləndirilməli, 2 kiçik məsələ var.

## Qaydasında olanlar

- Bütün admin əməliyyatları (server actions) və admin API-ləri (yükləmə, CSV) girişi özləri yoxlayır (`requireAdmin` / `auth()`)
- Yükləmə: yalnız JPEG/PNG/WebP/AVIF və MP4/MOV/WebM, ölçü limiti var; SVG qəbul olunmur
- Layihə/xidmət mətnləri `sanitize-html` ilə təmizlənir (XSS yoxdur); JSON-LD `<` qaçırılır; e-poçt şablonları escape olunur
- CSV ixracında Excel formulları zərərsizləşdirilir
- Kadr işinin webhook-u (`/api/story-job`) HMAC imza ilə, sabit-vaxtlı müqayisə ilə yoxlanır
- Preview linki təsadüfi token-dir; login-dən sonra yönləndirmə yalnız `/admin`-ə
- Repoda gizli açar yoxdur (yalnız `.env.example`)
- Əlaqə forması: honeypot, çox tez göndərmə filtri, IP üzrə limit (10 dəq-də 3, gündə 10), link-spam filtri

## Düzəltmək

- [ ] **Təhlükəsizlik başlıqları** (`next.config.ts` → `headers()`): `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'` (admin panel başqa saytda gizli açılmasın — clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Tam CSP sonra, ehtiyatla (GSAP, Blob, YouTube/Vimeo embed).
- [ ] **Login cəhd limiti** — hazırda şifrəni sonsuz sınamaq olar. IP + e-poçt üzrə limit (məs. 15 dəq-də 5 uğursuz cəhd). Əvvəl plandan çıxarılmışdı — sifarişçinin qərarı; ən azı admin şifrəsi güclü olmalıdır.
- [ ] **Müştəriyə təsdiq e-poçtu sui-istifadəsi** — formaya başqasının ünvanı yazılsa, sayt ona yazılmış mətni göndərir (IP-yə gündə 10-a qədər). Həll: təsdiq məktubunda mesaj mətnini təkrarlamamaq.
- [ ] **Ziyarət sayğacı** (`/api/track`) — hər kəs saylarını süni artıra və bazaya istənilən yol üçün sətir yarada bilər. Həll: yalnız mövcud səhifələri (layihə/xidmət slug-ları, sabit səhifələr) saymaq.

## Kiçik

- [ ] Next.js `15.5.25` → `15.5.26` (patch yeniləməsi)
- [ ] `npm audit`: postcss xəbərdarlığı (Next-in içində) — yalnız build zamanı öz CSS-imizi emal edir, saytda istismar olunmur; Next yeniləməsi ilə izləmək
- [ ] Öz serverə keçəndə: `x-forwarded-for` başlığına yalnız proxy (nginx) təyin edəndə etibar etmək, yoxsa əlaqə formasının IP limiti aldadıla bilər (Vercel-də problem yoxdur)
