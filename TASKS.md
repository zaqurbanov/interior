# Tapşırıqlar

Görüləcək işlərin siyahısı. Bitən işi `[x]` ilə işarələyin.

## Vacib qeydlər

- **Hostinq: uzun müddət Vercel.** Gələcək stack-i (öz server və s.) müştəri qərar verəcək.
- **Verilənlər bazası: MongoDB Atlas** (seçildi və qoşuldu). Baza adı `vladimir-fasij` (`MONGODB_DB` ilə dəyişdirilə bilər). Başlanğıc məzmun `npm run seed` ilə yazılıb: sayt məzmunu, 7 xidmət, 12 layihə.
- **Yükləmələr: Vercel Blob.** `BLOB_READ_WRITE_TOKEN` varsa şəkillər Blob-a yazılır; yoxdursa lokalda `public/uploads`-a (Vercel-də isə aydın xəta verir). Tək fayl limiti 4 MB — Vercel funksiyaları 4.5 MB-dan böyük sorğunu qəbul etmir.
- **Admin hesabında nümunə şifrə olmamalıdır.** `.env.local`-dakı `ADMIN_EMAIL` / `ADMIN_PASSWORD` `.env.example`-dakı nümunə dəyərlər idi; onlarla yaradılan hesab silindi. Seed skripti artıq nümunə dəyərlərlə və 10 simvoldan qısa şifrə ilə admin yaratmır.
- **Kadr çıxarma (`ffmpeg`) Vercel funksiyalarında işləmir** — lokal skriptlə davam edir (`scripts/extract-project-frames.mjs`).
- **Kadrları dəyişəndə versiyanı artır.** `/frames/*` bir illik keşlə verilir. Layihənin kadrlarını yenidən çıxaranda həm `scripts/extract-project-frames.mjs`-də, həm `src/lib/project-story.ts`-də `version` artırılmalıdır, yoxsa istifadəçilər köhnə kadrları görəcək.
- **Mənbə videoları silməzdən əvvəl ehtiyat nüsxə saxla.** Sayt yalnız `public/frames`-i işlədir, amma kadrları yenidən çıxarmaq (keyfiyyət, uzunluq, kəsmə) üçün video lazımdır. Skript video tapmasa, həmin layihəni ötürür və kadrlara toxunmur.
- **Dev server işləyərkən `npm run build` işlətmə** — hər ikisi `.next` qovluğunu istifadə edir, dev server sınır. Build-dən əvvəl dev serveri dayandır.
- **Temp:** yeni layihədə `scrollVh` yazmasan, videonun uzunluğundan avtomatik hesablanır (saniyəyə 40vh). İki videolu layihələr (Villa La Belle, Villa Luna, Villa La Fadarello) əl ilə 720vh-dır.
- **Kadr sıxlığı:** tək videolu layihələr 24 fps; dəniz, ağac və parıltı olan videolar pis sıxılır — onlar üçün 15 fps (bir səhifədə kompüter dəsti ~15 MB-dan çox olmasın).
- **localhost:3000-də başqa layihədən qalmış service worker** saytı sındırırdı (`yolai-cache-v1`), təmizləndi. Eyni xəta ("client-side exception") yenə çıxsa, brauzerdə `localhost:3000` üçün service worker-i ləğv et.

## 1. Layihə animasiyaları (scroll video)

Animasiyası olanlar: Albert Mews, Cannes, Villa at Saadiyat Island, Villa La Belle, Villa Nudra, Villa Luna, Villa La Fadarello, Chelsea Apartment, Belgravia.

Qalan layihələr üçün video lazımdır. Hər video üçün: faylı `videos/`-a qoy → `scripts/extract-project-frames.mjs`-ə əlavə et → `src/lib/project-story.ts`-də mərhələ mətnlərini yaz.

- [ ] Persian Gulf Coast Villa (`persian-gulf-coast-villa`)
- [x] Villa Luna (`villa-luna-cap-martin`) — `luna1.mp4` + `luna2.mp4`, 15 fps
- [ ] Villa at Cap d'Ail (`cap-d-ail`)
- [x] Villa La Fadarello (`cap-ferrat`) — `capferat1.mp4` + `capferat2.mp4`, 15 fps
- [x] Belgravia (`belgravia`) — `belg.mp4`, 24 fps, v1
- [ ] Windsor Estate (`windsor`)
- [x] Chelsea Apartment (`chelsea`) — ch1 + ch2, 15fps, v1

## 2. Admin panel

Baza: MongoDB Atlas və ya Supabase (yuxarıdakı qeydə bax).

- [x] Baza seçimi: MongoDB Atlas
- [x] Atlas cluster, DB istifadəçisi, bağlantı (`MONGODB_URI`) — yoxlanıldı, MongoDB 8.0
- [x] `scripts/seed.ts` yazıldı və işlədildi (təkrar işlətmək təhlükəsizdir, redaktə olunmuş məlumatın üzərinə yazmır)
- [x] Yükləmələr Vercel Blob-a keçirildi (`src/lib/storage.ts`, `next.config.ts`-də Blob domeni)
- [x] Real admin hesabı yaradıldı (`npm run seed -- --reset-admin`), nümunə hesab silindi — yoxlanıldı
- [ ] Vercel → Environment Variables: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXT_PUBLIC_SITE_URL` (real domen), istəyə görə `MONGODB_DB`. `BLOB_READ_WRITE_TOKEN` Blob qoşulanda avtomatik gəlir. (`ADMIN_*` yalnız seed üçündür, Vercel-də lazım deyil.)
  - **Deploy-da admin login işləmir** — `{"message":"There was a problem with the server configuration..."}` xətası. Səbəb: Vercel-də `AUTH_SECRET` yoxdur (lokalda təkrarlandı: `[auth][error] MissingSecret`). Düzəltmək (kompüterdən):
    - [ ] `AUTH_SECRET` yarat (`npx auth secret --raw` və ya `openssl rand -base64 32`) və Vercel-ə əlavə et
    - [ ] `AUTH_TRUST_HOST=true`, `MONGODB_URI` (`.env.local`-dan), istəyə görə `MONGODB_DB`, `NEXT_PUBLIC_SITE_URL`
    - [ ] Hər dəyişəndə **Production** və **Preview** seçilsin (PR preview-ları üçün)
    - [ ] Atlas → Network Access: `0.0.0.0/0` (Vercel IP-ləri sabit deyil)
    - [ ] Storage → Blob store layihəyə qoşulsun (yeni yükləmə sistemi üçün)
    - [ ] Deployments → **Redeploy** (dəyişənlər yalnız yeni deploy-da tətbiq olunur)
- [ ] Lokal yükləmə testi üçün `BLOB_READ_WRITE_TOKEN`-i Vercel-dən `.env.local`-a köçür (və ya `vercel env pull`)
- [ ] Admin paneldən şəkil yükləməni real olaraq sınamaq (giriş → layihə → şəkil)
- [ ] `.env.local`-dakı istifadə olunmayan `MONGODB_USER` / `MONGODB_PASS` dəyişənlərini silmək (şifrə təkrarı)
- [ ] Atlas: Network Access `0.0.0.0/0` açıqdırsa, DB şifrəsinin güclü olduğuna əmin ol

- [x] "Site content & SEO" səhifəsi (`/admin/content`) — brend, SEO (Google önizləməsi), ana səhifə animasiyasının 8 mərhələsi, haqqında, rəqəmlər, proses, komanda (foto ilə), əlaqə və sosial linklər
- [ ] "Site content & SEO"-da real saxlama testi (Save → saytda dəyişikliyin görünməsi)

- Yükləmə, animasiya redaktoru, "seçilmiş 6 şəkil" və qalan admin işləri aşağıdakı **2a. Admin panel: inkişaf planı**-na köçürüldü.

## 2a. Admin panel: inkişaf planı

Hər mərhələ ayrıca PR olaraq, `npm run build` ilə yoxlanılıb push edilir. Plandan kənar: çoxdillilik, login gücləndirilməsi (2FA, giriş limiti), bir neçə istifadəçi və rollar.

**Hostinq qaydası:** hələlik Vercel-də qalırıq, amma kod gələcəkdə öz serverə keçidi asanlaşdıracaq şəkildə yazılır — keçid kodu yenidən yazmaq yox, mühit dəyişənlərini dəyişmək olmalıdır:

| Hissə | İndi (Vercel) | Öz serverdə |
|---|---|---|
| Fayl saxlama | Vercel Blob | Serverin diski və ya S3 uyğun saxlama (MinIO, Cloudflare R2) |
| Kadr çıxarma | Video Blob-a yüklənir → GitHub Actions `ffmpeg` işlədir | Serverdə birbaşa `ffmpeg` (GitHub Actions lazım deyil) |
| Verilənlər bazası | MongoDB Atlas | Atlas-da qala bilər və ya serverə köçər |

Bunun üçün iki adapter: **saxlama** (`src/lib/storage.ts` — Blob / lokal disk, sonra S3) və **kadr çıxarma** (admin panel yalnız "bu videodan kadr çıxar" deyir; işi Vercel-də GitHub Actions, öz serverdə `ffmpeg` görür).

GitHub Actions: public repoda pulsuz, private repoda aylıq pulsuz dəqiqə limiti var (bir video ~2–5 dəq). Ödəniş limitini 0 qoymaq kifayətdir ki, heç vaxt pul çıxmasın.

### Mərhələ 1 — Media əsası (hər şey buna bağlıdır)

Əvvəlki problem (həll olundu): layihə formu bütün qalereya şəkillərini bir server action sorğusunda göndərir, Vercel isə 4.5 MB-dan böyük sorğunu qəbul etmir — 2–3 şəkil birlikdə yükləmək də sına bilər. Formda "8 MB" yazılıb, `storage.ts` isə 4 MB-dan böyük faylı rədd edir.

- [x] Birbaşa brauzerdən Blob-a yükləmə (`@vercel/blob/client`): fayl Blob-a gedir, server action-a yalnız URL çatır; ölçü limiti aradan qalxır (hələlik yalnız şəkil qəbul olunur; video Mərhələ 4-də əlavə olunacaq)
- [x] Yükləmə interfeysi: sürüklə-burax, hər fayl üçün irəliləyiş, brauzerdə sıxma (WebP, maks. 2560px)
- [x] Formdakı "8 MB" yazısını real limitlə uyğunlaşdırmaq
- [x] Media kitabxanası (`/admin/media`, `Media` modeli): bütün şəkillər bir yerdə, axtarış, harada istifadə olunduğu, istifadəsizləri silmək; hər yerdə "kitabxanadan seç"
- [x] Hər şəkil üçün alt mətn (SEO + əlçatanlıq) — saytda layihə, xidmət, komanda şəkillərində və kartlarda istifadə olunur; boş olanda avtomatik mətn
- [ ] Real yoxlama (Vercel preview və ya `.env.local` ilə): Blob-a yükləmə, kitabxanada alt mətnin saxlanması, istifadə olunmayan şəklin silinməsi. Bu sessiyada baza olmadığı üçün yalnız lokal yükləmə, sıxma və interfeys sınanıb

### Mərhələ 2 — Layihə redaktoru

- [ ] Qalereyada sürükləyərək sıralama
- [ ] "Seçilmiş 6 şəkil"i ulduzla işarələmək → `ShowcaseGallery` (hazırda ilk 6 şəkil göstərilir)
- [ ] Layihələr siyahısında sürükləyərək sıralama ("Order" rəqəm sahəsinin yerinə)
- [ ] Qaralama, gizli önizləmə linki, dərc tarixini planlaşdırmaq
- [ ] Rich text redaktoru (Tiptap) — təsvir üçün
- [ ] Avtomatik saxlama və "yadda saxlanmamış dəyişikliklər" xəbərdarlığı

### Mərhələ 3 — Sorğular (mesajlar)

- [ ] Status: yeni / cavablandı / təklif göndərildi / qazanıldı / itirildi; qeydlər, teqlər, axtarış, filtr
- [ ] Yeni sorğuda e-poçt bildirişi (Resend) və müştəriyə avtomatik "sorğunuz alındı" cavabı
- [ ] Spam qoruması: honeypot + rate limit (istəyə görə Turnstile)
- [ ] CSV ixracı

### Mərhələ 4 — Animasiya redaktoru

- [ ] `project-story.ts`-i MongoDB-yə köçürmək (`Story` modeli); kod faylı `withDb()` kimi ehtiyat olaraq qalır
- [ ] Layihəyə video yükləmək (Mərhələ 1-dəki birbaşa Blob yükləmə ilə)
- [ ] Kadr çıxarma adapteri: GitHub Actions workflow videonu Blob-dan götürür, `extract-project-frames.mjs` məntiqi ilə kadrları çıxarıb Blob-a yazır, `version`-u avtomatik artırır
- [ ] Vizual timeline redaktoru: kadrları sürüşdürücü ilə gəzmək, mərhələni istənilən kadrda yerləşdirmək, mətn və faktları yazmaq, canlı önizləmə
- [ ] Mövcud kadrları `public/frames`-dən Blob-a köçürmək (repo ~206 MB-dan kiçilir)

### Mərhələ 5 — Dashboard və əlavələr

- [ ] Son 30 günün sorğu qrafiki, ən çox baxılan layihələr
- [ ] "Diqqət tələb edir": boş SEO sahələri, alt mətni olmayan şəkillər, oxunmamış sorğular
- [ ] Dəyişiklik tarixçəsi və layihəni əvvəlki versiyaya qaytarmaq
- [ ] Yeni bölmələr (saytda istifadə olunacaqsa): rəylər, mətbuat / mükafatlar, FAQ

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
- [x] Ana səhifənin SEO mətnləri qısaldıldı: başlıq 66 → 59 simvol, təsvir 245 → 160 simvol (bazada və `defaults.ts`-də)
- [ ] **`VideoObject` strukturlaşdırılmış məlumatı** (Google-da video nəticəsi kimi görünmək üçün). Mənbə MP4-lər silinib, ona görə:
  - [ ] Chelsea — YouTube videosu var (`youtube:tu3II9r7n_o`): `embedUrl` + `thumbnailUrl` ilə əlavə etmək
  - [ ] Windsor — Vimeo videosu var (`vimeo:898678481`): eyni qaydada
  - [ ] Qalan animasiyalı layihələr: mövcud kadrlardan ffmpeg ilə qısa MP4 yığmaq (və ya sifarişçidən orijinalı almaq), Blob-a yükləmək, `contentUrl` kimi vermək
  - [ ] Hər video üçün: `name`, `description`, `uploadDate`, `duration`, `thumbnailUrl` (poster.webp) — Rich Results Test ilə yoxlamaq
- [ ] Mənbə videoların ehtiyat nüsxəsi: `videos/` qovluğu git-də deyil və silinib — kadrları yenidən çıxarmaq lazım olsa orijinallar lazımdır (Drive / xarici disk)
- [ ] Layihə təsvirlərindəki yazı səhvləri (mənbə saytdan olduğu kimi köçürülüb)
- [ ] Villa Luna (Cap Martin) təsviri səhvən Saadiyat villasının mətnidir ("Family villa at Saadiyat island in Abu Dhabi…") — sifarişçidən düzgün mətn alınmalıdır. Animasiya mərhələlərində yalnız bu villaya aid faktlar işlədilib.

## 5. Test

- [ ] Qənaət rejimi: `prefers-reduced-motion` və "Data Saver" ilə animasiyanın statik şəkil + mətnə çevrilməsi (brauzerdə hələ sınanmayıb)
- [x] Mobil/planşet layout yoxlaması (390×844, 375×667, 768×1024 — iframe-də ölçü ilə): scroll mətni ↔ ox, yükləmə yazısı, menyu, qalereya, lightbox
- [ ] Real cihazda test (iOS Safari, Android Chrome): ünvan zolağı gizlənəndə `svh` hündürlüyü, toxunma ilə scroll, iPhone-un alt zolağı (safe-area)
- [ ] Portret ekranda 16:9 video mərkəzdən kəsilir — lazım olsa layihə üzrə fokus nöqtəsi (məs. villa sağdadırsa) əlavə etmək
- [ ] Lightbox: lupa, sürüşdürmə, thumbnail lenti — müxtəlif ekran ölçülərində

## 6. Fayllar və ehtiyat nüsxə

- [ ] Mənbə videoların ehtiyat nüsxəsi: `video.mp4`, `video2.mp4` (ana səhifə) Zibil qutusundadır; Villa La Belle (`1.mp4`, `2.mp4`), Albert Mews (`Albert2.mp4`), Cannes (`cannVilla.mp4`) videoları `videos/`-da artıq yoxdur. Kadrları yenidən çıxarmaq lazım olsa, videolar gərək olacaq.
- [ ] Qalereya variantı sifarişçi ilə təsdiqlənsin (hazırda bütün layihələrdə "Showcase": 6 şəkil + "View all")
