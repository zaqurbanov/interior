# Mərhələ 4 — Animasiya redaktoru

**Bölmə:** Admin panel · **Status:** bitib · **Tarix:** 2026-09-25 · **PR:** zaqurbanov/interior#2

> Admin paneldən layihəyə video yükləmək, kadrları avtomatik çıxarmaq (GitHub Actions və ya öz server), mərhələ mətnlərini və vaxtlarını vizual redaktə etmək.

- [x] Story-lər MongoDB-də (`Story` modeli); `project-story.ts` ehtiyat olaraq qalır. Bazada aktiv story varsa o, yoxdursa kod faylındakı göstərilir
- [x] Mövcud (kod) animasiyanı "Edit the walkthrough" ilə bazaya köçürmək — eyni kadrlar, mətn və vaxtlar redaktə olunur
- [x] Layihəyə video yükləmək — birbaşa Blob-a (500 MB-a qədər, hissə-hissə), səhnə başına bir video (maks. 3), kəsmə (başlanğıc/uzunluq), 15 və ya 24 fps
- [x] Kadr çıxarma adapteri: Vercel-də GitHub Actions (`.github/workflows/story-frames.yml`), öz serverdə birbaşa (`FRAME_JOB_DRIVER=local`). Skript: `scripts/process-story.mjs` — desktop + mobil kadrlar, poster, mobil MP4; nəticəni imzalı callback ilə sayta bildirir; versiya avtomatik artır, köhnə versiya Blob-dan silinir
- [x] Vizual timeline redaktoru: kadr sürüşdürücüsü, oynatma, mərhələ nişanları, "+ Stage here", mətn və faktlar, saytdakına bənzər önizləmə, səhnələr arası fasilə, "saytda göstər" açarı
- [x] Admin: layihə siyahısında və redaktə səhifəsində "Walkthrough" linki

Sınaq: skript lokal olaraq `videos/belg.mp4` ilə (2 səhnə, kəsmə, 15 fps) işlədildi; callback imzası yoxlandı; redaktor brauzerdə sınandı. Baza, Blob və GitHub Actions ilə real işləmə yoxlanmayıb — qurulma: [tasks/kadr-isi-qurulmasi.md](../tasks/kadr-isi-qurulmasi.md).

Edilmədi (ayrıca tapşırıq): mövcud kadrları `public/frames`-dən Blob-a köçürmək — [tasks/kadrlari-blob-a-kocurmek.md](../tasks/kadrlari-blob-a-kocurmek.md).
