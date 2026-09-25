# Mərhələ 2 — Layihə redaktoru

**Bölmə:** Admin panel · **Status:** bitib · **Tarix:** 2026-09-25 · **PR:** zaqurbanov/interior#1

> Qalereya/siyahı sıralaması, ⭐ seçilmiş şəkillər, planlaşdırma və preview linki, Tiptap redaktoru, qaralama qorunması.

- [x] Qalereyada sürükləyərək sıralama
- [x] "Seçilmiş 6 şəkil"i ulduzla işarələmək → `ShowcaseGallery` (heç biri seçilməyibsə ilk 6)
- [x] Layihələr siyahısında sürükləyərək sıralama (sıra dərhal saxlanır; "Order" sahəsi layihə formundan çıxarıldı)
- [x] Qaralama, gizli önizləmə linki (`/api/preview/<token>`), dərc tarixini planlaşdırmaq ("Go live on" — sayt ən gec 1 saat ərzində yenilənir)
- [x] Rich text redaktoru (Tiptap) — layihə və xidmət təsviri; serverdə təmizlənir (`sanitize-html`), köhnə düz mətn də düzgün göstərilir
- [x] Yadda saxlanmamış dəyişikliklər: brauzerdə avtomatik qaralama (bərpa təklifi) + səhifədən çıxanda xəbərdarlıq. Serverə avtomatik saxlama edilmədi — yarımçıq dəyişikliyi canlı saytda dərc edərdi

Real (bazalı) yoxlama: [tasks/admin-real-yoxlama.md](../tasks/admin-real-yoxlama.md).
