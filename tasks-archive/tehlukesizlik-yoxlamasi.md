# Təhlükəsizlik yoxlamasının nəticələri

**Bölmə:** Təhlükəsizlik · **Status:** bitib · **Tarix:** 2026-09-26

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

## Düzəldildi

- [x] **Təhlükəsizlik başlıqları** (`next.config.ts`, bütün səhifələr): `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` (clickjacking), `base-uri` / `form-action 'self'`, `object-src 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (2 il, alt domenlərsiz). Tam CSP (skriptlər üçün) edilmədi — GSAP, Blob, YouTube/Vimeo ilə çox yoxlama tələb edir, faydası indi azdır.
- [x] **Login cəhd limiti** (`src/lib/login-limit.ts`, `LoginAttempt` modeli): bir IP-dən 15 dəq-də 5 uğursuz cəhd, bir e-poçta 15 dəq-də 20 (fərqli IP-lərdən). Sonra "Too many failed attempts…" mesajı; 15 dəq sonra açılır, uğurlu girişdə sıfırlanır. IP və e-poçt yalnız duzlu hash kimi saxlanır, qeydlər 1 gündən sonra avtomatik silinir. Bilinməyən e-poçt da eyni müddətdə yoxlanır (hansı e-poçtun mövcud olduğu bilinmir).
- [x] **Təsdiq e-poçtu**: mesajın mətni artıq təkrarlanmır; yalnız sadə ad ("Thank you, Anna"), şübhəli adda sadəcə "Thank you".
- [x] **Ziyarət sayğacı**: yalnız saytın real səhifələri (ana səhifə, about, contact, projects və mövcud layihə/xidmət slug-ları) sayılır; uydurma yollar bazaya düşmür. Sayı süni artırmaq hələ mümkündür (anonim sayğacın təbiəti), amma yalnız real səhifələr üçün.
- [x] Next.js `15.5.25` → `15.5.26`
- [x] Əlaqə forması və login bir IP funksiyasını paylaşır (`src/lib/client-ip.ts`)

Sınaq: `tsc`, `npm run build`; `next start` ilə başlıqlar yoxlandı (səhifələr, `/frames`), brauzerdə ana səhifə / Windsor / contact / login — CSP xətası yoxdur; limit məntiqi saxta baza ilə (6-cı cəhd bloklanır, başqa IP yox, 20 e-poçt xətası, 15 dəq sonra açılır, uğurda sıfırlanır). Real bazada login limiti hələ yoxlanmayıb → [admin-real-yoxlama](../tasks/admin-real-yoxlama.md).

## Qalan qeydlər

`npm audit`-dəki postcss xəbərdarlığı və öz serverdə `x-forwarded-for` məsələsi [docs/vacib-qeydler.md](../docs/vacib-qeydler.md)-yə köçürüldü.
