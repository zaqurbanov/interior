# Mövcud kadrları Blob-a köçürmək

**Bölmə:** Admin panel · **Status:** bitib · **Tarix:** 2026-09-26

> `public/frames` (~265 MB, 6294 fayl) Vercel Blob-a köçürüldü və repodan çıxarıldı. Sayt bütün animasiyaları Blob-dan göstərir.

## Görülənlər

- [x] Bütün kadr ünvanları bir yerdən keçir: `src/lib/frames-base.ts` — ana səhifə, layihə animasiyaları, posterlər, telefon MP4-ləri, "before/after", VideoObject
- [x] Yükləmə skripti `scripts/frames-to-blob.mjs` (yarımçıq qalsa davam edir, 1 illik keş)
- [x] İstifadəçi yüklədi (6294 fayl), `NEXT_PUBLIC_FRAMES_BASE` Vercel-ə yazıldı, saytda yoxlandı: kadrlar `cvygwhsvxo22d1ct.public.blob.vercel-storage.com`-dan gəlir
- [x] Blob ünvanı koda standart kimi yazıldı — dəyişən unudulsa da (yeni mühit, lokal) sayt işləyir
- [x] `public/frames` git-dən çıxarıldı, `.gitignore`-a əlavə olundu (skriptlər lokal olaraq ora yazmağa davam edir)
- [x] Admin "Make frames" köhnə versiyaları silərkən daxili (kod) animasiyanın kadrlarını saxlayır (`keep`) — story silinsə sayt onlara qayıdır
- [x] Qayda `docs/vacib-qeydler.md`-də: lokal skriptlə kadr çıxarandan sonra `frames-to-blob.mjs` işlətmək

## Bilmək lazımdır

- `git pull` edəndə kompüterinizdəki `public/frames` qovluğu silinəcək (git onu artıq izləmir). Lokal nüsxə lazımdırsa, pull-dan əvvəl başqa yerə kopyalayın; lazım olsa Blob-dan və ya git tarixçəsindən bərpa olunur.
- Kadrlar git tarixçəsində qalır, ona görə repo klonu hələ böyükdür. Tarixçəni təmizləmək (bütün commit hash-ləri dəyişir) ayrıca qərardır.

## Geri qaytarıldı (2026-09-26, eyni gün)

Merge-dən sonra saytda animasiyalar görünmədi. Səbəb (ehtimal, Vercel Usage-də təsdiqlənməli): Hobby planında Blob ayda **2 000 "Advanced Operations"** (yükləmə) və 10 000 "Simple Operations" verir; 6 294 faylın yüklənməsi limiti keçdi və store bloklandı. Kadrlar repoya (`public/frames`) qaytarıldı, sayt yenidən Vercel-in statik fayllarından verir. Davamı: [tasks/blob-limiti.md](../tasks/blob-limiti.md).
