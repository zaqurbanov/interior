# Animasiyalı layihələrin linkləri "Page not found" verir

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** açıq

> `https://vladimir-fasij.com/projects/...` linkləri "Page not found" verir — ehtimal: domen hələ köhnə sayta baxır, yeni sayt yalnız Vercel ünvanındadır.

## Təsvir

Scroll animasiyası olan səhifələr (yolları kodda var, build zamanı hamısı yaranır — `.next/server/app/projects/*.html`):

```
/
/projects/albert-mews
/projects/belgravia
/projects/cannes
/projects/chelsea
/projects/villa-at-saadiyat-island
/projects/villa-la-belle
/projects/cap-ferrat
/projects/villa-luna-cap-martin
/projects/villa-nudra
```

Animasiyasız: `/projects/persian-gulf-coast-villa`, `/projects/cap-d-ail`, `/projects/windsor`.

Bu linklər `https://vladimir-fasij.com` ilə açılanda "Page not found" çıxır (2026-09-25). Səbəb: domen hələ yeni sayta bağlanmayıb (sifarişçi təsdiqlədi) — `vladimir-fasij.com` köhnə saytdır, orada `/projects/...` yolu yoxdur. Yeni sayt: `https://interior-plum-kappa.vercel.app`. Claude sessiyasından sayta çıxış yoxdur, ona görə yoxlanmayıb.

## Addımlar

- [x] (2026-09-26: Vercel ünvanında layihə səhifələri açılır — problem domendədir) Eyni yolu Vercel ünvanında açmaq: **production** `https://interior-plum-kappa.vercel.app` (məs. `https://interior-plum-kappa.vercel.app/projects/belgravia`); branch preview: `https://interior-git-claude-gifted-cray-qxf2t8-zaqurbanovs-projects.vercel.app`
  - açılırsa → problem domendədir, aşağıdakı addım
  - orada da 404-dürsə → Vercel → Deployments → Logs; bazadakı layihələrin slug-larını yoxlamaq (admin → Projects → hər layihənin "Slug")
- [ ] Domeni yeni sayta bağlamaq: Vercel → Settings → Domains → `vladimir-fasij.com` (+ `www`), domen panelində göstərilən DNS qeydləri. Köhnə saytın vacib ünvanları üçün yönləndirmələr (redirect) düşünülsün — köhnə linklər Google-da və sosial şəbəkələrdə var
- [ ] `NEXT_PUBLIC_SITE_URL`-i real domenə dəyişmək və redeploy
