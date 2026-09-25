# Tapşırıqlar

Görüləcək işlərin siyahısı. Bitən işi `[x]` ilə işarələyin.

## Vacib qeydlər

- **Hostinq: uzun müddət Vercel.** Gələcək stack-i (öz server və s.) müştəri qərar verəcək.
- **Verilənlər bazası onlayn olacaq: MongoDB Atlas və ya Supabase** — seçim hələ açıqdır. Kod hazırda MongoDB (Mongoose) üzərindədir: Atlas üçün yalnız `MONGODB_URI` kifayətdir; Supabase data qatının (modellər, admin action-ları, giriş) yenidən yazılmasını tələb edir.
- **Vercel-də fayl sistemi yazmağa bağlıdır.** Admin paneldən şəkil/video yükləmə (`public/uploads`) orada işləmir — bulud yaddaşı lazımdır: Supabase seçilsə onun Storage-i, Atlas seçilsə Vercel Blob (dəyişiklik yalnız `src/lib/storage.ts`-dədir).
- **Kadr çıxarma (`ffmpeg`) Vercel funksiyalarında işləmir** — lokal skriptlə davam edir (`scripts/extract-project-frames.mjs`).
- **Kadrları dəyişəndə versiyanı artır.** `/frames/*` bir illik keşlə verilir. Layihənin kadrlarını yenidən çıxaranda həm `scripts/extract-project-frames.mjs`-də, həm `src/lib/project-story.ts`-də `version` artırılmalıdır, yoxsa istifadəçilər köhnə kadrları görəcək.
- **Mənbə videoları silməzdən əvvəl ehtiyat nüsxə saxla.** Sayt yalnız `public/frames`-i işlədir, amma kadrları yenidən çıxarmaq (keyfiyyət, uzunluq, kəsmə) üçün video lazımdır. Skript video tapmasa, həmin layihəni ötürür və kadrlara toxunmur.
- **Dev server işləyərkən `npm run build` işlətmə** — hər ikisi `.next` qovluğunu istifadə edir, dev server sınır. Build-dən əvvəl dev serveri dayandır.
- **Temp:** yeni layihədə `scrollVh` yazmasan, videonun uzunluğundan avtomatik hesablanır (saniyəyə 40vh). İki videolu layihələr (Villa La Belle, Villa Luna, Villa La Fadarello) əl ilə 720vh-dır.
- **Kadr sıxlığı:** tək videolu layihələr 24 fps; dəniz, ağac və parıltı olan videolar pis sıxılır — onlar üçün 15 fps (bir səhifədə kompüter dəsti ~15 MB-dan çox olmasın).
- **localhost:3000-də başqa layihədən qalmış service worker** saytı sındırırdı (`yolai-cache-v1`), təmizləndi. Eyni xəta ("client-side exception") yenə çıxsa, brauzerdə `localhost:3000` üçün service worker-i ləğv et.

## 1. Layihə animasiyaları (scroll video)

Animasiyası olanlar: Albert Mews, Cannes, Villa at Saadiyat Island, Villa La Belle, Villa Nudra, Villa Luna, Villa La Fadarello.

Qalan layihələr üçün video lazımdır. Hər video üçün: faylı `videos/`-a qoy → `scripts/extract-project-frames.mjs`-ə əlavə et → `src/lib/project-story.ts`-də mərhələ mətnlərini yaz.

- [ ] Persian Gulf Coast Villa (`persian-gulf-coast-villa`)
- [x] Villa Luna (`villa-luna-cap-martin`) — `luna1.mp4` + `luna2.mp4`, 15 fps
- [ ] Villa at Cap d'Ail (`cap-d-ail`)
- [x] Villa La Fadarello (`cap-ferrat`) — `capferat1.mp4` + `capferat2.mp4`, 15 fps
- [ ] Belgravia (`belgravia`)
- [ ] Windsor Estate (`windsor`)
- [ ] Chelsea Apartment (`chelsea`)

## 2. Admin panel

Baza: MongoDB Atlas və ya Supabase (yuxarıdakı qeydə bax).

- [ ] Baza seçimi: Atlas yoxsa Supabase (müştəri ilə razılaşdırmaq)
- [ ] Onlayn bazanı yaratmaq və Vercel-də mühit dəyişənlərini yazmaq (`MONGODB_URI` və ya Supabase açarları, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- [ ] Atlas: Network Access-də Vercel üçün `0.0.0.0/0` (Vercel-in sabit IP-si yoxdur), ayrıca DB istifadəçisi
- [ ] Yükləmələr üçün bulud yaddaşı: Vercel Blob (Atlas ilə) və ya Supabase Storage

- [ ] "Site content & SEO" səhifəsi (`/admin/content`) — menyuda link var, səhifə yoxdur (404)
- [ ] `scripts/seed.ts` — `npm run seed` elan olunub, fayl yoxdur
- [ ] Animasiya redaktoru: layihəyə video yükləmək, mərhələ mətnlərini və vaxtlarını admin paneldən dəyişmək
- [ ] Mərhələ konfiqurasiyasını (`project-story.ts`) MongoDB-yə köçürmək
- [ ] Video yüklənəndə kadrları serverdə `ffmpeg` ilə avtomatik çıxarmaq
- [ ] Qalereya üçün "seçilmiş 6 şəkil"i admin paneldən seçmək (hazırda ilk 6 şəkil göstərilir)

## 3. Yerləşdirmə (hazırda Vercel; öz server — müştəri qərarından sonra)

- [ ] Server mühit dəyişənləri: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- [ ] `NEXT_PUBLIC_SITE_URL` real domenə dəyişdirilsin (hazırda `localhost:3001`, sitemap-də də bu görünür)
- [ ] MongoDB qoşulsun (admin girişi və əlaqə forması bazasız işləmir)
- [ ] Vercel: `/frames/*` keş başlığı `next.config.ts`-də artıq var; öz serverə keçilsə nginx-də də eyni (bir illik `immutable`)
- [ ] Kadrlar Vercel deploy-unun ölçüsünü artırır (~200 MB) — layihə sayı artdıqca Vercel Blob / Supabase Storage-ə köçürmək
- [ ] Deploy-dan əvvəl `npm run build` — dev server dayandırılmış halda
- [ ] Kadrları (`public/frames`) git-dən çıxarıb bulud yaddaşında (və ya gələcəkdə öz serverdə) saxlamaq

## 4. SEO

- [ ] Deploy-dan sonra PageSpeed / Lighthouse yoxlaması (LCP, CLS, mobil)
- [ ] Google Search Console-a sitemap göndərmək
- [ ] Animasiyalar üçün `VideoObject` strukturlaşdırılmış məlumatı (MP4 serverdə olarsa)
- [ ] Layihə təsvirlərindəki yazı səhvləri (mənbə saytdan olduğu kimi köçürülüb)
- [ ] Villa Luna (Cap Martin) təsviri səhvən Saadiyat villasının mətnidir ("Family villa at Saadiyat island in Abu Dhabi…") — sifarişçidən düzgün mətn alınmalıdır. Animasiya mərhələlərində yalnız bu villaya aid faktlar işlədilib.

## 5. Test

- [ ] Qənaət rejimi: `prefers-reduced-motion` və "Data Saver" ilə animasiyanın statik şəkil + mətnə çevrilməsi (brauzerdə hələ sınanmayıb)
- [ ] Bütün scroll səhifələri və qalereya telefonda (iOS Safari, Android Chrome)
- [ ] Lightbox: lupa, sürüşdürmə, thumbnail lenti — müxtəlif ekran ölçülərində

## 6. Fayllar və ehtiyat nüsxə

- [ ] Mənbə videoların ehtiyat nüsxəsi: `video.mp4`, `video2.mp4` (ana səhifə) Zibil qutusundadır; Villa La Belle (`1.mp4`, `2.mp4`), Albert Mews (`Albert2.mp4`), Cannes (`cannVilla.mp4`) videoları `videos/`-da artıq yoxdur. Kadrları yenidən çıxarmaq lazım olsa, videolar gərək olacaq.
- [ ] Qalereya variantı sifarişçi ilə təsdiqlənsin (hazırda bütün layihələrdə "Showcase": 6 şəkil + "View all")
