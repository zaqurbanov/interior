# Vercel yaddaş limiti (Functions / Deployment Storage)

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** açıq

> Pulsuz planın 10 GB "Functions Storage" limiti doldu (13.95 GB); kod düzəldildi, köhnə deploy-lar silinməlidir.

## Təsvir

`src/lib/data.ts`-də `existsSync(public/frames/...)` yoxlaması Next-ə bütün kadrları (~220 MB) hər server funksiyasına qoşdururdu; onlarla deploy-dan sonra 13.95 GB yığıldı (2026-09-25). Yoxlama silindi, `next.config.ts`-də `outputFileTracingExcludes` əlavə olundu — ən böyük funksiya indi 3.3 MB. Deployment Storage da limitə yaxındır (8.89 / 10 GB).

## Addımlar

- [x] Kodu düzəltmək (`data.ts`, `next.config.ts`)
- [x] Commit + push (`9cf84ea`) — yeni deploy-da funksiyalar 2.6–3.6 MB (əvvəl hərəsi ~220 MB+)
- [x] Vercel → Deployments → köhnə Preview deploy-lar silindi (2026-09-26)
- [ ] Settings → Security → Deployment Retention Policy: Preview üçün avtomatik silinmə (məs. 30 gün)
- [ ] Bir-iki gün sonra Usage-də Functions / Deployment Storage-in düşdüyünü yoxlamaq
