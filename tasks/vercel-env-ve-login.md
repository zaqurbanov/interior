# Vercel mühit dəyişənləri və admin login

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** açıq

> Deploy-da login `MissingSecret` xətası verir; `AUTH_SECRET`, `MONGODB_URI` və s. Vercel-ə əlavə olunmalı, Blob qoşulmalı.

## Təsvir

Deploy-da admin login `{"message":"There was a problem with the server configuration..."}` xətası verir. Səbəb: Vercel-də `AUTH_SECRET` yoxdur (lokalda təkrarlandı: `[auth][error] MissingSecret`). Admin girişi və əlaqə forması bazasız da işləmir.

## Addımlar (kompüterdən)

- [ ] `AUTH_SECRET` yarat (`npx auth secret --raw` və ya `openssl rand -base64 32`) və Vercel → Settings → Environment Variables-a əlavə et
- [ ] `AUTH_TRUST_HOST=true`
- [ ] `MONGODB_URI` (`.env.local`-dan), istəyə görə `MONGODB_DB`
- [ ] `NEXT_PUBLIC_SITE_URL` — real domen (hazırda `localhost:3001`, sitemap-də də bu görünür)
- [ ] Hər dəyişəndə **Production** və **Preview** seçilsin (PR preview-ları üçün)
- [ ] Atlas → Network Access: `0.0.0.0/0` (Vercel IP-ləri sabit deyil)
- [ ] Storage → Blob store layihəyə qoşulsun (`BLOB_READ_WRITE_TOKEN` avtomatik gəlir)
- [ ] Deployments → **Redeploy** (dəyişənlər yalnız yeni deploy-da tətbiq olunur)
- [ ] `/admin/login`-də girişi yoxla

`ADMIN_EMAIL` / `ADMIN_PASSWORD` yalnız seed üçündür, Vercel-də lazım deyil.
