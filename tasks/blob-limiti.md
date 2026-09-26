# Vercel Blob limiti və kadrlar

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** açıq

> Kadrlar Blob-a köçürüləndən sonra animasiyalar saytda itdi; kadrlar repoya qaytarıldı ([arxiv](../tasks-archive/kadrlari-blob-a-kocurmek.md)).

## Addımlar

- [ ] Vercel → Storage → interior-blob: "Advanced Operations" və "Simple Operations" limiti keçibmi, store bloklanıbmı — təsdiqləmək (səbəb bu idimi)
- [ ] Vercel → Settings → Environment Variables → `NEXT_PUBLIC_FRAMES_BASE`-i silmək (kod artıq onu oxumur, sadəcə səliqə üçün)
- [ ] Blob-dakı `frames/` qovluğunu silmək (Browser → frames → Delete) — yer tutmasın; admin şəkil yükləmələri üçün store lazımdır
- [ ] Qərar: kadrlar repoda qalır (pulsuz, işləyir) və ya pullu plan (Pro) + Blob. Pro-da: `node --env-file=.env.local scripts/frames-to-blob.mjs`, sonra Vercel-ə `NEXT_PUBLIC_FRAMES_URL=https://….public.blob.vercel-storage.com/frames`
