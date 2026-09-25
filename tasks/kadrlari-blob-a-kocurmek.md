# Mövcud kadrları Blob-a köçürmək

**Bölmə:** Admin panel · **Status:** açıq

> `public/frames` (~210 MB) repodadır; yeni animasiyalar artıq Blob-a yazılır, köhnələri də köçürülsə repo və deploy kiçilir.

## Addımlar

- [ ] Köçürmə skripti: hər layihə üçün `public/frames/<slug>/v<n>/` → Blob `frames/<slug>/v<n>/`, bazadakı `Story.base`-i Blob URL-inə dəyişmək (story bazada yoxdursa əvvəlcə kod story-dən yaratmaq)
- [ ] Ana səhifə kadrları (`scene1`, `scene2`, `home/`) üçün də eyni (`sequence.ts`-də əsas URL)
- [ ] Yoxlandıqdan sonra `public/frames`-i git-dən silmək

Öncədən lazımdır: [kadr-isi-qurulmasi](kadr-isi-qurulmasi.md) (Blob açarı) və baza.
