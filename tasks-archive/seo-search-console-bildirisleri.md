# Search Console bildirişləri (domen keçidindən sonra)

**Bölmə:** SEO · **Status:** bitib (2026-10-09)

> Google 5 "indekslənmir" bildirişi göndərdi; dördü domen keçidinin normal nəticəsidir, `/about` kopya sayılırdı — düzəldildi.

## Bildirişlər

| Bildiriş | Səhifələr | Nəticə |
|---|---|---|
| Yönləndirməli səhifə (3) | `http://…`, köhnə `/portfoliocard/belgravia` | Normal — yönləndirmələr düzgün işləyir |
| Düzgün canonical-ı olan alternativ səhifə (1) | `https://www.vladimir-fasij.com/` | `www` 200 qaytarırdı → Vercel-də `www` → əsas domenə yönləndirildi (istifadəçi) |
| Kəşf edildi, indekslənməyib (12) | yeni `/projects/…`, `/contact`, `/services/…` | Normal — Google hələ taramayıb; özü tarayacaq (istifadəçinin qərarı: əl ilə sürətləndirilmir) |
| Tarandı, indekslənməyib (2) | köhnə `/portfoliocard/nudra-uae`, `/cap-martin` | Normal — may ayında köhnə saytda taranıb, indi yönləndirir |
| Kopya, Google başqa canonical seçdi (1) | `/about` | **Düzəldildi** (aşağıda) |

## `/about` niyə kopya sayılırdı

"Haqqımızda" mətni (`aboutText`) ana səhifədə və `/about`-da sözbəsöz eyni idi. Üstəlik bazadakı mətn `\r\n` sətir sonları ilə saxlanıldığı üçün kod abzasları ayıra bilmirdi — hər iki səhifədə bir böyük abzas idi.

- [x] Ana səhifədə yalnız birinci abzas, link "About the studio and team →" (`src/app/(site)/page.tsx`)
- [x] Tam mətn yalnız `/about`-da
- [x] `\r\n` → `\n` normallaşdırması (`mergeSite` in `src/lib/data.ts`, `textToHtml` in `src/lib/rich-text.ts`) — abzaslar indi ayrı görünür
- [x] `npm run build` ilə yoxlandı

## Sonra

- Deploy-dan 1–2 həftə sonra Search Console-da `/about` üçün "URL yoxlaması": Google-un seçdiyi canonical `/about` olmalıdır. Yenə ana səhifəni seçsə, `/about`-a yalnız orada olan məzmun lazımdır (studiyanın tarixçəsi, iş prosesi) — mətn sifarişçidən.
