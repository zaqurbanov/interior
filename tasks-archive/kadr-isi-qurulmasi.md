# Animasiya redaktoru üçün kadr işinin qurulması

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** ləğv edildi · **Tarix:** 2026-09-26

> Admin paneldə "Make frames" işləsin deyə GitHub token-i, repo secret-ləri və Vercel dəyişənləri.

## Addımlar

- [ ] GitHub → Settings → Developer settings → **Fine-grained token**: yalnız `zaqurbanov/interior`, icazə **Actions: Read and write**
- [ ] Uzun təsadüfi sətir yarat (`STORY_WEBHOOK_SECRET`, məs. `openssl rand -hex 32`)
- [ ] GitHub repo → Settings → Secrets and variables → Actions → **New repository secret**:
  - `BLOB_READ_WRITE_TOKEN` — Vercel Blob açarı (Vercel → Storage → Blob → `.env.local` bölməsi)
  - `STORY_WEBHOOK_SECRET` — yuxarıdakı sətir
- [ ] Vercel → Environment Variables (Production + Preview): `GITHUB_ACTIONS_TOKEN`, `GITHUB_REPO=zaqurbanov/interior`, `STORY_WEBHOOK_SECRET` (eyni sətir), lazım olsa `FRAME_JOB_REF` (workflow-un olduğu branch, standart `master`)
- [ ] Redeploy
- [ ] Sınaq: admin → layihə → Walkthrough → video yüklə → "Make frames" → GitHub → Actions-da "Story frames" işləyir → bir neçə dəqiqəyə redaktor özü yenilənir → mərhələləri yerləşdir → "Show on the project page" → Save → saytda yoxla (kompüter + telefon)

Öz serverə keçəndə: serverdə `ffmpeg` qur, `FRAME_JOB_DRIVER=local` — GitHub Actions lazım olmur.


## Ləğv edildi

Studiyanın qərarı (2026-09-26): admində animasiya yaratma ("Make frames") çıxarıldı — animasiyaları studiya özü kompüterdə skriptlə hazırlayır ([docs/animasiya-yaratmaq.md](../docs/animasiya-yaratmaq.md)). GitHub token-i, repo secret-ləri və bu dəyişənlər lazım deyil. Blob Hobby limiti də (ayda 2 000 yükləmə) bunu çətinləşdirirdi.
