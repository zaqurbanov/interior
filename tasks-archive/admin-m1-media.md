# Mərhələ 1 — Media əsası

**Bölmə:** Admin panel · **Status:** bitib · **Tarix:** 2026-09-25 · **PR:** zaqurbanov/interior#1

> Birbaşa Blob-a yükləmə, brauzerdə sıxma, media kitabxanası, alt mətn.

Əvvəlki problem: layihə formu bütün qalereya şəkillərini bir server action sorğusunda göndərirdi, Vercel isə 4.5 MB-dan böyük sorğunu qəbul etmir.

- [x] Birbaşa brauzerdən Blob-a yükləmə (`@vercel/blob/client`): fayl Blob-a gedir, server action-a yalnız URL çatır (hələlik yalnız şəkil; video Mərhələ 4-də)
- [x] Yükləmə interfeysi: sürüklə-burax, hər fayl üçün irəliləyiş, brauzerdə sıxma (WebP, maks. 2560px)
- [x] Formdakı "8 MB" yazısını real limitlə uyğunlaşdırmaq
- [x] Media kitabxanası (`/admin/media`, `Media` modeli): bütün şəkillər bir yerdə, axtarış, harada istifadə olunduğu, istifadəsizləri silmək; hər yerdə "kitabxanadan seç"
- [x] Hər şəkil üçün alt mətn — saytda layihə, xidmət, komanda şəkillərində və kartlarda istifadə olunur; boş olanda avtomatik mətn

Real (bazalı) yoxlama: [tasks/admin-real-yoxlama.md](../tasks/admin-real-yoxlama.md).
