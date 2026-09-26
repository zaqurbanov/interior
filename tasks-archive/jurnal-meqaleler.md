# Jurnal: admin paneldən məqalələr

**Bölmə:** SEO · **Status:** bitib · **Tarix:** 2026-09-26

> Admin özü məqalə yazır; saytda `/journal` bölməsində çıxır. Məqsəd: Google-da tapılmaq, studiyanın bilik və təcrübəsini göstərmək.

## Admin (Journal)

- [x] Məqalə siyahısı: status (Draft / Scheduled / Live), tarix, kateqoriya, "cover yoxdur" xəbərdarlığı, saytda bax, redaktə, sil
- [x] Redaktor: başlıq (slug avtomatik), qısa təsvir (excerpt), mətn — H2/H3, siyahılar, sitat, link, **şəkil** (yüklə və ya kitabxanadan seç; alt mətn soruşulur)
- [x] Cover şəkli, kateqoriya (əvvəlki kateqoriyalar təklif olunur), teqlər, müəllif (boşdursa studiya adı)
- [x] Əlaqəli layihələr — məqalənin sonunda göstərilir, layihə səhifəsində də məqaləyə link çıxır
- [x] Dərc: Published + tarix (gələcək tarix = planlaşdırılmış), SEO başlıq və təsvir (simvol sayğacı ilə 60 / 155)
- [x] Qaralama qorunması (brauzerdə yadda saxlanır), dəyişiklik tarixçəsi və bərpa (History), media kitabxanasında "harada istifadə olunur"
- [x] Dashboard xatırlatmaları: hələ məqalə yoxdur; cover/excerpt-siz məqalə; 6 həftədir yeni məqalə yoxdur

## Sayt

- [x] `/journal`: son məqalə böyük, qalanları şəbəkə; məqalə yoxdursa "tezliklə" mətni
- [x] `/journal/<slug>`: başlıq, tarix · oxuma müddəti · müəllif, cover, "In this article" məzmun cədvəli (2+ H2 olanda), mətn, teqlər, "Start your project", əlaqəli layihələr, digər məqalələr
- [x] Menyu və footer-də "Journal" — yalnız ilk məqalə dərc olunandan sonra; ana səhifədə son 3 məqalə
- [x] SEO: BlogPosting + BreadcrumbList JSON-LD, Open Graph (article), meta təsvir, sitemap, RSS (`/journal/rss.xml`)

Sınaq: yerli test bazası (FerretDB) ilə admin girişi → məqalə yaratmaq (cover, daxili şəkil, 2 bölmə, layihə) → jurnal, məqalə, məzmun cədvəli, JSON-LD, menyu linki, ana səhifə bölməsi, layihə səhifəsində link; redaktə → tarixçə, sitemap və RSS dərhal yenilənir; kompüter və telefonda daşma yoxdur.
