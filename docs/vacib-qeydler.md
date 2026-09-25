# Vacib qeydlər

Daimi qaydalar və qərarlar (tapşırıq deyil). Açıq işlər: [../TASKS.md](../TASKS.md).

## Ümumi

- **Hostinq: uzun müddət Vercel.** Gələcək stack-i (öz server və s.) müştəri qərar verəcək.
- **Verilənlər bazası: MongoDB Atlas** (seçildi və qoşuldu). Baza adı `vladimir-fasij` (`MONGODB_DB` ilə dəyişdirilə bilər). Başlanğıc məzmun `npm run seed` ilə yazılıb: sayt məzmunu, 7 xidmət, 12 layihə.
- **Yükləmələr: Vercel Blob.** Şəkil brauzerdə kiçildilir və birbaşa Blob-a yüklənir (`BLOB_READ_WRITE_TOKEN` lazımdır); token yoxdursa lokalda `public/uploads`-a yazılır (Vercel-də xəta verir). Tək fayl limiti 25 MB.
- **Admin hesabında nümunə şifrə olmamalıdır.** `.env.local`-dakı `ADMIN_EMAIL` / `ADMIN_PASSWORD` `.env.example`-dakı nümunə dəyərlər idi; onlarla yaradılan hesab silindi. Seed skripti artıq nümunə dəyərlərlə və 10 simvoldan qısa şifrə ilə admin yaratmır.
- **Kadr çıxarma (`ffmpeg`) Vercel funksiyalarında işləmir** — lokal skriptlə davam edir (`scripts/extract-project-frames.mjs`).
- **Kadrları dəyişəndə versiyanı artır.** `/frames/*` bir illik keşlə verilir. Layihənin kadrlarını yenidən çıxaranda həm `scripts/extract-project-frames.mjs`-də, həm `src/lib/project-story.ts`-də `version` artırılmalıdır, yoxsa istifadəçilər köhnə kadrları görəcək.
- **Mənbə videoları silməzdən əvvəl ehtiyat nüsxə saxla.** Sayt yalnız `public/frames`-i işlədir, amma kadrları yenidən çıxarmaq (keyfiyyət, uzunluq, kəsmə) üçün video lazımdır. Skript video tapmasa, həmin layihəni ötürür və kadrlara toxunmur.
- **Dev server işləyərkən `npm run build` işlətmə** — hər ikisi `.next` qovluğunu istifadə edir, dev server sınır. Build-dən əvvəl dev serveri dayandır.
- **Temp:** yeni layihədə `scrollVh` yazmasan, videonun uzunluğundan avtomatik hesablanır (saniyəyə 40vh). İki videolu layihələr (Villa La Belle, Villa Luna, Villa La Fadarello) əl ilə 720vh-dır.
- **Kadr sıxlığı:** tək videolu layihələr 24 fps; dəniz, ağac və parıltı olan videolar pis sıxılır — onlar üçün 15 fps (bir səhifədə kompüter dəsti ~15 MB-dan çox olmasın).
- **localhost:3000-də başqa layihədən qalmış service worker** saytı sındırırdı (`yolai-cache-v1`), təmizləndi. Eyni xəta ("client-side exception") yenə çıxsa, brauzerdə `localhost:3000` üçün service worker-i ləğv et.
- **Deploy-dan əvvəl `npm run build`** — dev server dayandırılmış halda.
- **Öz serverə keçilsə**, `/frames/*` üçün bir illik `immutable` keş başlığı nginx-də də olmalıdır (Vercel-də `next.config.ts`-də var).

## Admin panel: inkişaf planı

Hər mərhələ ayrıca PR olaraq, `npm run build` ilə yoxlanılıb push edilir. Plandan kənar: çoxdillilik, login gücləndirilməsi (2FA, giriş limiti), bir neçə istifadəçi və rollar.

**Hostinq qaydası:** hələlik Vercel-də qalırıq, amma kod gələcəkdə öz serverə keçidi asanlaşdıracaq şəkildə yazılır — keçid kodu yenidən yazmaq yox, mühit dəyişənlərini dəyişmək olmalıdır:

| Hissə | İndi (Vercel) | Öz serverdə |
|---|---|---|
| Fayl saxlama | Vercel Blob | Serverin diski və ya S3 uyğun saxlama (MinIO, Cloudflare R2) |
| Kadr çıxarma | Video Blob-a yüklənir → GitHub Actions `ffmpeg` işlədir | Serverdə birbaşa `ffmpeg` (GitHub Actions lazım deyil) |
| Verilənlər bazası | MongoDB Atlas | Atlas-da qala bilər və ya serverə köçər |

Bunun üçün iki adapter: **saxlama** (`src/lib/storage.ts` — Blob / lokal disk, sonra S3) və **kadr çıxarma** (admin panel yalnız "bu videodan kadr çıxar" deyir; işi Vercel-də GitHub Actions, öz serverdə `ffmpeg` görür).

GitHub Actions: public repoda pulsuz, private repoda aylıq pulsuz dəqiqə limiti var (bir video ~2–5 dəq). Ödəniş limitini 0 qoymaq kifayətdir ki, heç vaxt pul çıxmasın.

Mərhələlər: M1–M5 bitib ([arxiv](../tasks-archive/README.md)).
