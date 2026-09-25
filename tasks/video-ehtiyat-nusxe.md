# Mənbə videoların ehtiyat nüsxəsi

**Bölmə:** Fayllar və ehtiyat nüsxə · **Status:** açıq

> Kadrları yenidən çıxarmaq üçün orijinal MP4-lər lazımdır; çoxu artıq `videos/`-da yoxdur.

## Təsvir

Sayt yalnız `public/frames`-i işlədir, amma kadrları yenidən çıxarmaq (keyfiyyət, uzunluq, kəsmə) və `VideoObject` üçün orijinal videolar lazımdır. `videos/` adətən git-də deyil, amma bəzi videolar təsadüfən commit olunub (aşağıya bax).

## Addımlar

- [ ] Ana səhifə: `video.mp4`, `video2.mp4` Zibil qutusundadır — bərpa edib Drive / xarici diskə köçür
- [ ] Villa La Belle: `1.mp4`, `2.mp4`, `3.mp4` git tarixçəsindədir (commit `11d922e`) — bərpa: `git show 11d922e:videos/1.mp4 > 1.mp4` (eyni qayda ilə 2 və 3)
- [ ] `belg.mp4` git-dədir (commit `9c442e7`); `windsor.mp4` yalnız lokaldadır — ehtiyat nüsxəyə köçür
- [x] `videos/` `.gitignore`-a əlavə olundu (2026-09-25); `belg.mp4` git-dən çıxarıldı, fayl lokalda qalır. Köhnə commit-lərdəki videolar tarixçədə qalır
- [ ] Villa La Belle (orijinal video git-dən bərpa olunmursa), Albert Mews (`Albert2.mp4`), Cannes (`cannVilla.mp4`) — orijinalları tap və ya sifarişçidən al
- [ ] Qalan layihələrin videolarını da eyni yerdə saxla
