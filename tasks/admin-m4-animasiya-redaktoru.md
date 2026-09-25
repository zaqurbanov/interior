# Mərhələ 4 — Animasiya redaktoru

**Bölmə:** Admin panel · **Status:** açıq

> Story-ləri bazaya köçürmək, video yükləmə, GitHub Actions ilə kadr çıxarma, vizual timeline, kadrları Blob-a köçürmək.

## Addımlar

- [ ] `project-story.ts`-i MongoDB-yə köçürmək (`Story` modeli); kod faylı `withDb()` kimi ehtiyat olaraq qalır
- [ ] Layihəyə video yükləmək (Mərhələ 1-dəki birbaşa Blob yükləmə ilə)
- [ ] Kadr çıxarma adapteri: GitHub Actions workflow videonu Blob-dan götürür, `extract-project-frames.mjs` məntiqi ilə kadrları çıxarıb Blob-a yazır, `version`-u avtomatik artırır
- [ ] Vizual timeline redaktoru: kadrları sürüşdürücü ilə gəzmək, mərhələni istənilən kadrda yerləşdirmək, mətn və faktları yazmaq, canlı önizləmə
- [ ] Mövcud kadrları `public/frames`-dən Blob-a köçürmək və git-dən çıxarmaq (repo və deploy ~206 MB-dan kiçilir)

## Qeydlər

Hostinq qaydası və GitHub Actions haqqında: [docs/vacib-qeydler.md](../docs/vacib-qeydler.md#admin-panel-inkişaf-planı).
