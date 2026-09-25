# Mövcud kadrları Blob-a köçürmək

**Bölmə:** Admin panel · **Status:** açıq (kod hazırdır, yükləmə istifadəçidə)

> `public/frames` (~265 MB, 6294 fayl) repodadır. Kod artıq onları Blob-dan göstərə bilir; qalan: yükləmək, dəyişəni qoymaq, sonra git-dən silmək.

## Hazırdır (2026-09-26)

- [x] Bütün kadr ünvanları bir yerdən keçir: `src/lib/frames-base.ts` (`NEXT_PUBLIC_FRAMES_BASE`). Boşdursa `/frames` (repo), doludursa Blob. Ana səhifə, bütün layihə animasiyaları, posterlər, telefon MP4-ləri, "before/after" şəkilləri, VideoObject.
- [x] Bazada `base: "/frames"` olan story-lər (admində "Edit" edilmiş daxili animasiyalar) də avtomatik Blob-a keçir — bazaya toxunmaq lazım deyil.
- [x] Yükləmə skripti: `scripts/frames-to-blob.mjs` — eyni yollarla `frames/…`-a yükləyir, artıq olanı ötürür (yarımçıq qalsa yenidən işlət), 1 illik keş, sonda dəyişənin dəyərini çap edir.
- [x] Sınaq: `NEXT_PUBLIC_FRAMES_BASE` ilə build — HTML-də bütün kadr ünvanları Blob-dadır; dəyişənsiz — əvvəlki kimi `/frames`.

## İstifadəçi edir

- [ ] `.env.local`-da `BLOB_READ_WRITE_TOKEN` olsun (Vercel → Storage → Blob store → `.env.local` tab)
- [ ] `node --env-file=.env.local scripts/frames-to-blob.mjs` (əvvəl `--dry-run` ilə baxmaq olar). ~265 MB yüklənir; Blob pulsuz planı 1 GB-dır
- [ ] Skriptin çap etdiyi `NEXT_PUBLIC_FRAMES_BASE=https://….public.blob.vercel-storage.com/frames` → Vercel → Settings → Environment Variables (hamısı) və `.env.local` → Redeploy
- [ ] Saytda animasiyaları yoxlamaq (brauzerdə Network: kadrlar `blob.vercel-storage.com`-dan gəlir)

## Sonra (Claude)

- [ ] Yoxlandıqdan sonra `public/frames`-i git-dən silmək və `.gitignore`-a əlavə etmək (skriptlər lokal olaraq ora yazmağa davam edir). Git tarixçəsində qalır — repo ölçüsü yalnız tarixçə təmizlənsə kiçilər (ayrıca qərar)
- [ ] `extract-project-frames.mjs` / `build-mobile-videos.mjs`-dən sonra yeni fayllar üçün skripti yenidən işlətmək qaydasını `docs/vacib-qeydler.md`-yə yazmaq
