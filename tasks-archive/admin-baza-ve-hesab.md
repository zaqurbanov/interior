# Baza, seed və admin hesabı

**Bölmə:** Admin panel · **Status:** bitib

> MongoDB Atlas seçildi və qoşuldu, seed yazıldı, real admin hesabı yaradıldı, yükləmələr Blob-a keçdi.

- [x] Baza seçimi: MongoDB Atlas
- [x] Atlas cluster, DB istifadəçisi, bağlantı (`MONGODB_URI`) — yoxlanıldı, MongoDB 8.0
- [x] `scripts/seed.ts` yazıldı və işlədildi (təkrar işlətmək təhlükəsizdir, redaktə olunmuş məlumatın üzərinə yazmır)
- [x] Yükləmələr Vercel Blob-a keçirildi (`src/lib/storage.ts`, `next.config.ts`-də Blob domeni)
- [x] Real admin hesabı yaradıldı (`npm run seed -- --reset-admin`), nümunə hesab silindi — yoxlanıldı
