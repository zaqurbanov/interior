# Vercel mühit dəyişənləri və admin login

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** açıq

> Deploy-da login `MissingSecret` xətası verir; `AUTH_SECRET`, `MONGODB_URI` və s. Vercel-ə əlavə olunmalı, Blob qoşulmalı.

## Təsvir

Deploy-da admin login `{"message":"There was a problem with the server configuration..."}` xətası verir. Səbəb: Vercel-də `AUTH_SECRET` yoxdur (lokalda təkrarlandı: `[auth][error] MissingSecret`). Admin girişi və əlaqə forması bazasız da işləmir.

## Addımlar (kompüterdən)

- [x] `AUTH_SECRET` yarat (`npx auth secret --raw` və ya `openssl rand -base64 32`) və Vercel → Settings → Environment Variables-a əlavə et
- [x] `AUTH_TRUST_HOST=true`
- [x] `MONGODB_URI` (`.env.local`-dan), istəyə görə `MONGODB_DB`
- [x] `NEXT_PUBLIC_SITE_URL` = `https://interior-plum-kappa.vercel.app` (2026-09-26; robots, sitemap, canonical, og:url yoxlandı). Domen bağlananda real domenə dəyişib redeploy etmək — [animasiya-linkleri-404](animasiya-linkleri-404.md)
- [ ] Hər dəyişəndə **Production** və **Preview** seçilsin (PR preview-ları üçün)
- [x] Atlas → Network Access: `0.0.0.0/0` (Vercel IP-ləri sabit deyil)
- [x] Storage → Blob store layihəyə qoşulsun (`BLOB_READ_WRITE_TOKEN` avtomatik gəlir) — dashboard-da Blob xəbərdarlığı yoxdur (2026-09-26)
- [x] `/admin/media`-da şəkil yükləndi, Blob işləyir (2026-09-26)
- [x] Deployments → **Redeploy** (dəyişənlər yalnız yeni deploy-da tətbiq olunur)
- [x] `/admin/login`-də girişi yoxla — deploy linki ilə giriş işləyir (2026-09-26)

`ADMIN_EMAIL` / `ADMIN_PASSWORD` yalnız seed üçündür, Vercel-də lazım deyil.
