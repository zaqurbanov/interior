# Vercel yaddaş limiti (Functions / Deployment Storage)

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** açıq

> Pulsuz planın 10 GB "Functions Storage" limiti doldu (13.95 GB); kod düzəldildi, köhnə deploy-lar silinməlidir.

## Təsvir

`src/lib/data.ts`-də `existsSync(public/frames/...)` yoxlaması Next-ə bütün kadrları (~220 MB) hər server funksiyasına qoşdururdu; onlarla deploy-dan sonra 13.95 GB yığıldı (2026-09-25). Yoxlama silindi, `next.config.ts`-də `outputFileTracingExcludes` əlavə olundu — ən böyük funksiya indi 3.3 MB. Deployment Storage da limitə yaxındır (8.89 / 10 GB).

## Addımlar

- [x] Kodu düzəltmək (`data.ts`, `next.config.ts`)
- [ ] Commit + push (istifadəçi özü edir)
- [ ] Vercel → Deployments → filtr "Preview" → köhnə deploy-ları silmək (Production "Current" qalır)
- [ ] Settings → Security → Deployment Retention Policy: Preview üçün avtomatik silinmə (məs. 30 gün)
- [ ] Bir-iki gün sonra Usage-də Functions / Deployment Storage-in düşdüyünü yoxlamaq
