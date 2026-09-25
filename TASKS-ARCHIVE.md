# Tapşırıqlar — arxiv

`TASKS.md`-dən bitmiş işlər. Yeni bitən iş bura, uyğun bölməyə, ən üstə yazılır; tarix bilinirsə qeyd olunur.

## 2a. Admin panel: inkişaf planı → Mərhələ 2 — Layihə redaktoru

_2026-09-25, PR zaqurbanov/interior#1_

- [x] Qalereyada sürükləyərək sıralama
- [x] "Seçilmiş 6 şəkil"i ulduzla işarələmək → `ShowcaseGallery` (heç biri seçilməyibsə ilk 6)
- [x] Layihələr siyahısında sürükləyərək sıralama (sıra dərhal saxlanır; "Order" sahəsi layihə formundan çıxarıldı)
- [x] Qaralama, gizli önizləmə linki (`/api/preview/<token>`), dərc tarixini planlaşdırmaq ("Go live on" — sayt ən gec 1 saat ərzində yenilənir)
- [x] Rich text redaktoru (Tiptap) — layihə və xidmət təsviri; serverdə təmizlənir (`sanitize-html`), köhnə düz mətn də düzgün göstərilir
- [x] Yadda saxlanmamış dəyişikliklər: brauzerdə avtomatik qaralama (bərpa təklifi) + səhifədən çıxanda xəbərdarlıq. Serverə avtomatik saxlama edilmədi — yarımçıq dəyişikliyi canlı saytda dərc edərdi

## 2a. Admin panel: inkişaf planı → Mərhələ 1 — Media əsası

_2026-09-25, PR zaqurbanov/interior#1_

- [x] Birbaşa brauzerdən Blob-a yükləmə (`@vercel/blob/client`): fayl Blob-a gedir, server action-a yalnız URL çatır; ölçü limiti aradan qalxır (hələlik yalnız şəkil qəbul olunur; video Mərhələ 4-də əlavə olunacaq)
- [x] Yükləmə interfeysi: sürüklə-burax, hər fayl üçün irəliləyiş, brauzerdə sıxma (WebP, maks. 2560px)
- [x] Formdakı "8 MB" yazısını real limitlə uyğunlaşdırmaq
- [x] Media kitabxanası (`/admin/media`, `Media` modeli): bütün şəkillər bir yerdə, axtarış, harada istifadə olunduğu, istifadəsizləri silmək; hər yerdə "kitabxanadan seç"
- [x] Hər şəkil üçün alt mətn (SEO + əlçatanlıq) — saytda layihə, xidmət, komanda şəkillərində və kartlarda istifadə olunur; boş olanda avtomatik mətn

## 1. Layihə animasiyaları (scroll video)

- [x] Villa Luna (`villa-luna-cap-martin`) — `luna1.mp4` + `luna2.mp4`, 15 fps
- [x] Villa La Fadarello (`cap-ferrat`) — `capferat1.mp4` + `capferat2.mp4`, 15 fps
- [x] Belgravia (`belgravia`) — `belg.mp4`, 24 fps, v1
- [x] Chelsea Apartment (`chelsea`) — ch1 + ch2, 15fps, v1

## 2. Admin panel

- [x] Baza seçimi: MongoDB Atlas
- [x] Atlas cluster, DB istifadəçisi, bağlantı (`MONGODB_URI`) — yoxlanıldı, MongoDB 8.0
- [x] `scripts/seed.ts` yazıldı və işlədildi (təkrar işlətmək təhlükəsizdir, redaktə olunmuş məlumatın üzərinə yazmır)
- [x] Yükləmələr Vercel Blob-a keçirildi (`src/lib/storage.ts`, `next.config.ts`-də Blob domeni)
- [x] Real admin hesabı yaradıldı (`npm run seed -- --reset-admin`), nümunə hesab silindi — yoxlanıldı
- [x] "Site content & SEO" səhifəsi (`/admin/content`) — brend, SEO (Google önizləməsi), ana səhifə animasiyasının 8 mərhələsi, haqqında, rəqəmlər, proses, komanda (foto ilə), əlaqə və sosial linklər

## 4. SEO

- [x] Ana səhifənin SEO mətnləri qısaldıldı: başlıq 66 → 59 simvol, təsvir 245 → 160 simvol (bazada və `defaults.ts`-də)

## 5. Test

- [x] Mobil/planşet layout yoxlaması (390×844, 375×667, 768×1024 — iframe-də ölçü ilə): scroll mətni ↔ ox, yükləmə yazısı, menyu, qalereya, lightbox
