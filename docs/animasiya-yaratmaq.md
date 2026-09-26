# Yeni layihə animasiyası necə yaradılır

Animasiyalar kompüterdə hazırlanır (admin panel yalnız mövcud animasiyanın mətnini və vaxtlarını redaktə edir). Lazımdır: Node.js, `ffmpeg` (terminalda `ffmpeg -version` işləməlidir), layihənin videosu.

Nümunə: `persian-gulf-coast-villa` layihəsi üçün.

## 1. Videonu qoy

- Videonu `videos/` qovluğuna qoy, məs. `videos/persian1.mp4` (bu qovluq git-ə düşmür — ehtiyat nüsxəni Drive-da saxla).
- 1–3 səhnə ola bilər (hər səhnə ayrıca video). İdeal uzunluq: 6–12 saniyə səhnə başına.

## 2. Skriptə əlavə et

`scripts/extract-project-frames.mjs` faylında `stories` siyahısına yeni sətir:

```js
{
  slug: "persian-gulf-coast-villa",          // layihənin URL adı (admin → Projects → Slug)
  scenes: ["videos/persian1.mp4"],          // bir neçə səhnə: ["videos/a.mp4", "videos/b.mp4"]
  // Videonun yalnız bir hissəsi: { src: "videos/a.mp4", start: 2, duration: 6 }
  version: 1,                               // kadrları yenidən çıxaranda 1 artır (2, 3…)
  fps: 15,                                  // dəniz, ağac, parıltı çoxdursa 15; yoxsa sil (24 olur)
},
```

## 3. Kadrları çıxar

```
node scripts/extract-project-frames.mjs persian-gulf-coast-villa
```

Nəticə: `public/frames/persian-gulf-coast-villa/v1/` — kompüter və telefon kadrları, poster, telefon videosu (`mobile.mp4`). Terminal hər səhnənin kadr sayını yazır, məs. `scene1/desktop: 214 frames` — bu rəqəm növbəti addımda lazımdır.

Ölçüyə bax: kompüter dəsti ~15 MB-dan çox olmasın (çoxdursa `fps: 15` qoy və ya videonu qısalt).

## 4. Saytın koduna əlavə et

`src/lib/project-story.ts` faylında `projectStories` içində mövcud birini (məs. `windsor`) kopyala və dəyiş:

- `slug`, `version` — skriptdəki ilə eyni
- `scenes: [214]` — hər səhnənin kadr sayı (3-cü addımdan)
- `fps: 15` — skriptdə 15 idisə
- `hold` — iki səhnə arası fasilə (kadr sayı ilə, məs. 30); bir səhnədirsə 0
- `stages` — mətn mərhələləri: `at` = hansı kadrda başlayır (birincisi 0), `eyebrow`, `title`, `text`, sağda `label` və `facts`

## 5. Yoxla

```
npm run dev
```

`http://localhost:3000/projects/persian-gulf-coast-villa` — kompüterdə scroll, telefon görünüşündə (F12 → telefon ikonu) avtomatik oynatma. Mətnlərin yeri uyğun deyilsə `at` rəqəmlərini dəyiş. Deploy-dan sonra mətn və vaxtları admin → layihə → **Walkthrough**-da vizual olaraq da düzəltmək olar.

## 6. Göndər

```
git add public/frames/persian-gulf-coast-villa scripts/extract-project-frames.mjs src/lib/project-story.ts
git commit -m "Walkthrough: Persian Gulf Coast Villa"
git push
```

## Kadrları dəyişəndə

Eyni layihəni yenidən çıxaranda `version`-u **həm skriptdə, həm `project-story.ts`-də** 1 artır (brauzerlər köhnə kadrları bir il yadda saxlayır). Əgər layihənin mətni admində "Edit" edilibsə, admin → Walkthrough → "Discard edits" et ki, yeni versiya görünsün.
