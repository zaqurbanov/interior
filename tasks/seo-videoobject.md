# `VideoObject` strukturlaşdırılmış məlumatı

**Bölmə:** SEO · **Status:** açıq

> Google-da video nəticəsi kimi görünmək üçün layihə videolarına schema.org `VideoObject`.

## Addımlar

- [ ] Chelsea — YouTube videosu var (`youtube:tu3II9r7n_o`): `embedUrl` + `thumbnailUrl` ilə əlavə etmək
- [ ] Windsor — Vimeo videosu var (`vimeo:898678481`): eyni qaydada
- [ ] Qalan animasiyalı layihələr: mövcud kadrlardan ffmpeg ilə qısa MP4 yığmaq (və ya sifarişçidən orijinalı almaq), Blob-a yükləmək, `contentUrl` kimi vermək
- [ ] Hər video üçün: `name`, `description`, `uploadDate`, `duration`, `thumbnailUrl` (poster.webp) — Rich Results Test ilə yoxlamaq

Əlaqəli: [video-ehtiyat-nusxe](video-ehtiyat-nusxe.md).
