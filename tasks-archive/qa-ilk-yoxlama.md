# QA agenti və ilk tam yoxlama

**Bölmə:** Test · **Status:** bitib · **Tarix:** 2026-09-26

> Saytın hər səhifəsini gəzən QA agenti yaradıldı, ilk yoxlama edildi, tapılan səhvlər düzəldildi.

## Alətlər

- `scripts/qa-crawl.mjs` (`npm run qa -- --base=URL`): bütün səhifələr × kompüter + iPhone, sonuna qədər sürüşdürür; HTTP/JS xətaları, sınıq link və şəkillər, üfüqi daşma, SEO/alt/h1, JSON-LD, adı olmayan düymələr. Nəticə və ekran şəkilləri `qa-reports/`-a (git-ə düşmür).
- `.claude/agents/qa.md` — QA agenti: crawler-i işlədir, ekran şəkillərinə baxır, menyu, animasiya, qalereya/lightbox, forma, klaviatura, 404, başlıqları əllə yoxlayır, Azərbaycan dilində prioritetli siyahı yazır. Çağırmaq: "qa agenti ilə saytı yoxla".

## İlk yoxlamanın nəticəsi (24 səhifə, localhost, bazasız)

0 kritik, 1 yüksək, 2 orta, 2 aşağı — hamısı təkrarlanıb:

- [x] **Yüksək:** telefonda menyu/footer-dəki "Services" (`/#services`) ana səhifənin başında qalırdı — scroll kilidi saxlayırdı. İndi `#` ilə gələndə və ya istənilən `#` linkində kilid açılır; adi girişdə kilid əvvəlki kimi işləyir.
- [x] **Orta:** "Skip to content" fokusu məzmuna keçirmirdi — indi keçir (bütün səhifədaxili linklər fokusu hədəfə aparır).
- [x] **Orta:** lightbox açılanda fokus dialoqda qalmırdı, bağlananda itirdi — indi "Close"-a keçir, Tab dialoqdan çıxmır, bağlananda açan şəklə qayıdır.
- [x] **Aşağı:** layihə səhifələrində meta description 182–418 simvol idi — admində SEO təsviri yazılmayıbsa, xülasə ~160 simvola qısaldılır.
- [ ] **Aşağı:** "Villa At Cap D'Ail" başlığı → admində düzəltmək ([mezmun-duzelisleri](../tasks/mezmun-duzelisleri.md)).

Yoxlanıb, problem yoxdur: header/menyu, ana səhifə və layihə animasiyaları (kompüter + telefon, kilid, Replay), qalereya və lightbox, portfolio filtrləri, əlaqə forması xətaları, admin login, qənaət rejimi, klaviatura, 404, təhlükəsizlik başlıqları.
Yoxlanmayıb: admin panel daxili (baza), formun saxlanması və e-poçtlar, telefonda H.264 video (test brauzerində yoxdur), real iPhone, YouTube (sandbox bloklayır).
