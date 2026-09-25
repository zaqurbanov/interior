# Mərhələ 4 — Animasiya redaktoru

**Bölmə:** Admin panel · **Status:** bitib · **Tarix:** 2026-09-25 · **PR:** zaqurbanov/interior#2

> Admin paneldən layihəyə video yükləmək, kadrları avtomatik çıxarmaq (GitHub Actions və ya öz server), mərhələ mətnlərini və vaxtlarını vizual redaktə etmək.

## Sadə izah

**Məqsəd:** animasiya əlavə etmək və ya dəyişmək üçün proqramçı lazım olmasın.

**Əvvəl:** video kompüterə qoyulurdu → `ffmpeg` ilə kadrlar çıxarılırdı → `project-story.ts`-də mətnlər və kadr nömrələri kodda yazılırdı → deploy. Hamısı əl ilə və kod bilgisi tələb edirdi.

**İndi admin paneldə (layihə → Walkthrough):**

1. **Video yükləmə** — hər səhnə üçün video; lazım olsa kəsmək (hansı saniyədən, nə qədər) və sürət (15 və ya 24 kadr/saniyə).
2. **"Make frames"** — Vercel `ffmpeg` işlədə bilmədiyi üçün iş GitHub Actions-a verilir: video kadrlara bölünür (kompüter + telefon ölçüsü), telefon üçün MP4 yığılır, hamısı Blob-a yazılır və sayta xəbər verilir. Bir neçə dəqiqə çəkir, səhifə özü yenilənir. Öz serverdə bu iş birbaşa serverdə gedir.
3. **Timeline redaktoru** — kadrları sürüşdürüb baxmaq → istənilən anda "+ Stage here" (mərhələ mətni o anda çıxır) → başlıq, mətn, faktlar (önizləmədə saytdakı kimi) → "Show on the project page" → Save.

Mövcud 9 animasiya "Edit the walkthrough" ilə eyni kadrlarla redaktora köçürülür — onların da mətn və vaxtları kodsuz dəyişir.

Bir dəfəlik qurulma lazımdır (GitHub token və açarlar): [tasks/kadr-isi-qurulmasi.md](../tasks/kadr-isi-qurulmasi.md).

## Görülən işlər

- [x] Story-lər MongoDB-də (`Story` modeli); `project-story.ts` ehtiyat olaraq qalır. Bazada aktiv story varsa o, yoxdursa kod faylındakı göstərilir
- [x] Mövcud (kod) animasiyanı "Edit the walkthrough" ilə bazaya köçürmək — eyni kadrlar, mətn və vaxtlar redaktə olunur
- [x] Layihəyə video yükləmək — birbaşa Blob-a (500 MB-a qədər, hissə-hissə), səhnə başına bir video (maks. 3), kəsmə (başlanğıc/uzunluq), 15 və ya 24 fps
- [x] Kadr çıxarma adapteri: Vercel-də GitHub Actions (`.github/workflows/story-frames.yml`), öz serverdə birbaşa (`FRAME_JOB_DRIVER=local`). Skript: `scripts/process-story.mjs` — desktop + mobil kadrlar, poster, mobil MP4; nəticəni imzalı callback ilə sayta bildirir; versiya avtomatik artır, köhnə versiya Blob-dan silinir
- [x] Vizual timeline redaktoru: kadr sürüşdürücüsü, oynatma, mərhələ nişanları, "+ Stage here", mətn və faktlar, saytdakına bənzər önizləmə, səhnələr arası fasilə, "saytda göstər" açarı
- [x] Admin: layihə siyahısında və redaktə səhifəsində "Walkthrough" linki

Sınaq: skript lokal olaraq `videos/belg.mp4` ilə (2 səhnə, kəsmə, 15 fps) işlədildi; callback imzası yoxlandı; redaktor brauzerdə sınandı. Baza, Blob və GitHub Actions ilə real işləmə yoxlanmayıb — qurulma: [tasks/kadr-isi-qurulmasi.md](../tasks/kadr-isi-qurulmasi.md).

Edilmədi (ayrıca tapşırıq): mövcud kadrları `public/frames`-dən Blob-a köçürmək — [tasks/kadrlari-blob-a-kocurmek.md](../tasks/kadrlari-blob-a-kocurmek.md).
