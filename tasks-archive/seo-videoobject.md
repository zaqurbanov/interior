# `VideoObject` strukturlaşdırılmış məlumatı

**Bölmə:** SEO · **Status:** bitib · **Tarix:** 2026-09-25

> Layihə və ana səhifə videoları üçün schema.org `VideoObject` — Google-da video nəticəsi kimi görünmək üçün.

## Sadə izah

Google səhifədəki videonu "anlasın" deyə, səhifənin kodunda gizli bir təsvir var: videonun adı, qısa təsviri, örtük şəkli, tarixi, müddəti və faylın/pleyerin ünvanı. Bununla Google axtarışda videonu şəkilli nəticə kimi göstərə bilər (göstərib-göstərməmək Google-un qərarıdır).

## Görülən işlər

- [x] Animasiyalı 9 layihə: mobil MP4 `contentUrl` kimi (əlavə yükləmə lazım olmadı — MP4-lər artıq var), `poster.webp` örtük, müddət kadr sayından
- [x] Chelsea (YouTube): `embedUrl` + YouTube örtüyü
- [x] Windsor (Vimeo): `embedUrl` + layihənin örtük şəkli (Vimeo-nun sabit örtük ünvanı yoxdur)
- [x] Ana səhifə: animasiya MP4-ü və YouTube showreel
- [x] Admin paneldə yaradılan animasiyalar da avtomatik daxildir (tarix — kadrların yarandığı gün)
- [x] Yolüstü: ana səhifədə paylaşım şəklinin ünvanı Blob-a yüklənəndə səhv qurulurdu — düzəldildi

Kod: `src/lib/video-schema.ts`.

## Deploy-dan sonra

- [ ] [Rich Results Test](https://search.google.com/test/rich-results)-də ana səhifəni və bir layihəni yoxlamaq
- [ ] Search Console → "Videos" hesabatına baxmaq (bir neçə gün sonra)
- [ ] `NEXT_PUBLIC_SITE_URL` real domen olmalıdır — bütün video ünvanları ondan qurulur. (Bu Claude sessiyasının mühitində `https://yolai.az` idi — başqa layihədən qalıb; Vercel-dəki dəyəri yoxlayın.)
