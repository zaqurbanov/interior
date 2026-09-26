# Tapşırıqlar — arxiv

Bitmiş işlərin indeksi. Hər işin faylı bu qovluqdadır; açıq işlər [`../TASKS.md`](../TASKS.md)-dədir. Yeni bitən iş öz bölməsinin ən üstünə yazılır.

## Admin panel

- **[Animasiya redaktoru üçün kadr işi — ləğv edildi](kadr-isi-qurulmasi.md)** _(2026-09-26)_ — Admində "Make frames" çıxarıldı; animasiyaları studiya özü kompüterdə yaradır ([bələdçi](../docs/animasiya-yaratmaq.md)).
- **[Media: kateqoriyalar və qısa səhifə](media-kateqoriyalar.md)** _(2026-09-26)_ — Tablar, layihə üzrə qovluqlar, kiçik şəkillər, alt mətn üçün yan panel; səhifə ~22 000 → ~1 150 px.
- **[Mövcud kadrları Blob-a köçürmək](kadrlari-blob-a-kocurmek.md)** _(2026-09-26)_ — 6294 kadr (~265 MB) Blob-dadır, repodan çıxarıldı; admin kadr işi daxili kadrları silmir.
- **[Mərhələ 5 — Dashboard və əlavələr](admin-m5-dashboard.md)** _(2026-09-25)_ — "Diqqət tələb edir", sorğu/ziyarət qrafikləri, ən çox baxılan layihələr, dəyişiklik tarixçəsi və bərpa.
- **[Mərhələ 4 — Animasiya redaktoru](admin-m4-animasiya-redaktoru.md)** _(2026-09-25)_ — Video yükləmə, avtomatik kadr çıxarma (GitHub Actions / öz server), vizual timeline redaktoru.
- **[Mərhələ 3 — Sorğular (mesajlar)](admin-m3-sorgular.md)** _(2026-09-25)_ — Sorğulara status, teq, qeydlər; axtarış və filtr; Resend ilə e-poçt; spam qoruması; CSV ixracı.
- **[Mərhələ 2 — Layihə redaktoru](admin-m2-layihe-redaktoru.md)** _(2026-09-25)_ — Qalereya/siyahı sıralaması, ⭐ seçilmiş şəkillər, planlaşdırma və preview linki, Tiptap redaktoru, qaralama qorunması.
- **[Mərhələ 1 — Media əsası](admin-m1-media.md)** _(2026-09-25)_ — Birbaşa Blob-a yükləmə, brauzerdə sıxma, media kitabxanası, alt mətn.
- **[Admin panelin inkişaf planı](admin-inkisaf-plani.md)** _(2026-09-25)_ — 5 mərhələli plan tərtib olundu; açıq mərhələlər `tasks/`-dadır.
- **["Site content & SEO" səhifəsi](admin-site-content-sehifesi.md)** — `/admin/content`: brend, SEO, ana səhifə mərhələləri, haqqında, komanda, əlaqə.
- **[Baza, seed və admin hesabı](admin-baza-ve-hesab.md)** — MongoDB Atlas seçildi və qoşuldu, seed yazıldı, real admin hesabı yaradıldı, yükləmələr Blob-a keçdi.

## Sayt

- **[İdeyalar 1, 2, 5: sorğuya aparan yollar](ideyalar-sorgu-yollari.md)** _(2026-09-26)_ — Layihə sonunda sorğu bloku, telefonda Enquire · WhatsApp · Call paneli, xidmət səhifələrində layihələr.

## Performans

- **[Sayt trafikinin (MB) azaldılması](trafik-azaltma.md)** _(2026-09-25)_ — Telefonda MP4-ə keçildi; kompüter olduğu kimi qalır (sifarişçinin qərarı).
- **[Mobildə kadrlar əvəzinə MP4](mobil-mp4.md)** _(2026-09-25)_ — Telefonda animasiya bir MP4 yükləyir: ana səhifə 11.4 → 1.5 MB, layihələr 3–10 → 0.7–2 MB.

## Layihə animasiyaları

- **[Animasiya: Villa at Cap d'Ail](animasiya-cap-d-ail.md)** _(2026-09-26)_ — `ail1.mp4` + `ail2.mp4`, 15 fps: tikinti, axşam girişi, malikanə yuxarıdan.
- **[Animasiya: Windsor Estate](animasiya-windsor.md)** _(2026-09-25)_ — `windsor.mp4`, 24 fps: idman zalı, qapalı hovuz, buxar otağı, giriş holu.
- **[Mobildə mətn çıxanda video dayanmır](mobil-yavas-fasile.md)** _(2026-09-25)_ — Hər mərhələdə tam fasilə əvəzinə video ~0.3× sürətlə yavaşlayır; “ilişib” hissi aradan qalxdı.
- **[Mobildə animasiyadan yalnız ox ilə keçmək](mobil-scroll-kilidi.md)** _(2026-09-25)_ — Telefonda aşağı sürüşdürmə animasiyadan çıxarmır; keçid ox (“Continue”) ilə.
- **[Mobildə animasiyaların avtomatik oynaması](mobil-avtomatik-video.md)** _(2026-09-25)_ — Telefonda scroll əvəzinə video kimi avtomatik oynayır; hər mərhələdə fasilə, sonda "Replay".
- **[Mobildə scroll animasiyalarının qısaldılması](mobil-scroll-qisaltma.md)** _(2026-09-25)_ — Telefonda sürüşdürmə məsafəsi 45%-ə endirildi (ana səhifə 10 → 5 ekran).
- **[Animasiya: Chelsea Apartment](animasiya-chelsea.md)** — `chelsea` — ch1 + ch2, 15 fps, v1.
- **[Animasiya: Belgravia](animasiya-belgravia.md)** — `belgravia` — `belg.mp4`, 24 fps, v1.
- **[Animasiya: Villa La Fadarello](animasiya-villa-la-fadarello.md)** — `cap-ferrat` — `capferat1.mp4` + `capferat2.mp4`, 15 fps.
- **[Animasiya: Villa Luna](animasiya-villa-luna.md)** — `villa-luna-cap-martin` — `luna1.mp4` + `luna2.mp4`, 15 fps.
- **[Animasiya: ilk layihələr](animasiya-ilk-layiheler.md)** — Albert Mews, Cannes, Villa at Saadiyat Island, Villa La Belle, Villa Nudra.

## Təhlükəsizlik

- **[Təhlükəsizlik yoxlaması və düzəlişlər](tehlukesizlik-yoxlamasi.md)** _(2026-09-26)_ — Başlıqlar (clickjacking), login cəhd limiti, təsdiq e-poçtunda mətn təkrarlanmır, sayğac yalnız real səhifələri sayır, Next 15.5.26.

## SEO

- **[Domen yeni sayta bağlandı, köhnə linklər yönləndirildi](animasiya-linkleri-404.md)** _(2026-09-26)_ — GoDaddy DNS → Vercel; `/portfolio`, `/portfoliocard/*` → yeni ünvanlar.
- **[Jurnal: admin paneldən məqalələr](jurnal-meqaleler.md)** _(2026-09-26)_ — `/journal`, admin → Journal: şəkilli redaktor, kateqoriya/teq, əlaqəli layihələr, planlaşdırma, JSON-LD, RSS, sitemap.
- **[`VideoObject` strukturlaşdırılmış məlumatı](seo-videoobject.md)** _(2026-09-25)_ — Layihə və ana səhifə videoları Google üçün təsvir olundu (MP4, YouTube, Vimeo).
- **[Ana səhifənin SEO mətnləri](seo-ana-sehife-metnleri.md)** — Başlıq 66 → 59, təsvir 245 → 160 simvol.

## Test

- **[QA agenti və ilk tam yoxlama](qa-ilk-yoxlama.md)** _(2026-09-26)_ — Crawler + QA agenti; 5 problem tapıldı, 4-ü düzəldildi (telefonda `/#services`, skip link, lightbox fokusu, uzun meta təsvirlər).
- **[Qənaət rejimi testi](test-qenaet-rejimi.md)** _(2026-09-26)_ — Reduced motion, Data Saver və 2G-də animasiya şəkil + mətnə çevrilir; kadr yüklənmir.
- **[Mobil/planşet layout yoxlaması](test-mobil-layout.md)** — 390×844, 375×667, 768×1024: scroll mətni, menyu, qalereya, lightbox.
