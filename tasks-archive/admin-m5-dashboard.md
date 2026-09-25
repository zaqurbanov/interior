# Mərhələ 5 — Dashboard və əlavələr

**Bölmə:** Admin panel · **Status:** bitib · **Tarix:** 2026-09-25

> Dashboard: "diqqət tələb edir" siyahısı, sorğu və ziyarət qrafikləri, ən çox baxılan layihələr; layihə, xidmət və sayt məzmunu üçün dəyişiklik tarixçəsi və bərpa.

## Sadə izah

- **"Needs attention"** — admin panelə girəndə ilk görünən: cavabsız sorğular (2 gündən çox), oxunmamışlar, alınmayan animasiya işləri, örtük şəkli və ya qısa təsviri olmayan layihələr, alt mətni olmayan şəkillər, planlaşdırılmış layihələr və qurulmamış ayarlar (e-poçt, Blob, sayt ünvanı). Hər birinə klikləyəndə lazımi səhifə açılır.
- **Qrafiklər** — son 30 gündə hər gün neçə sorğu və neçə baxış olub; üzərinə gələndə dəqiq rəqəm.
- **Ən çox baxılan layihələr** — son 30 gün.
- **Tarixçə (History)** — layihə, xidmət və "Site content" hər dəfə saxlananda əvvəlki halı yadda qalır (son 20). Səhv dəyişiklik olsa "Restore" ilə geri qaytarılır; bərpanın özü də geri qaytarıla bilir.

## Görülən işlər

- [x] Baxış sayğacı — öz sayğacımız (Vercel Analytics yox): səhifə başına, brauzer sessiyası başına bir baxış; cookie yox, IP yox, botlar və preview sayılmır; "Do Not Track" nəzərə alınır. Öz serverə keçəndə də işləyir
- [x] Son 30 günün sorğu və ziyarət qrafikləri (hover tooltip, ekran oxuyucu üçün cədvəl; rəng dataviz validatoru ilə yoxlanıb)
- [x] Ən çox baxılan layihələr
- [x] "Diqqət tələb edir" siyahısı
- [x] Dəyişiklik tarixçəsi və bərpa (layihə, xidmət, sayt məzmunu); tarixçədəki şəkillər silinmir
- [—] Yeni bölmələr (rəylər, mətbuat, FAQ) — sifarişçi qərarına qədər ayrıca tapşırıq: [tasks/yeni-bolmeler.md](../tasks/yeni-bolmeler.md)

Sınaq: qrafiklər, tooltip, tarixçə paneli və baxış izləyicisi (təkrar yükləmə sayılmır) brauzerdə sınandı; baza ilə real sayma və bərpa yoxlanmayıb — [tasks/admin-real-yoxlama.md](../tasks/admin-real-yoxlama.md).
