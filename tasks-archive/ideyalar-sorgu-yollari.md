# İdeyalar 1, 2, 5: sorğuya aparan yollar

**Bölmə:** Sayt · **Status:** bitib · **Tarix:** 2026-09-26 · **Mənbə:** [ideyalar hesabatı](../docs/ideyalar/2026-09-26.md) (ilk 5-dən #1, #2, #5)

> Ziyarətçi işi bəyəndiyi anda əlaqəyə bir addım uzaqda olsun.

## 1. Layihə səhifəsinin sonunda sorğu bloku

- [x] Qalereya/videolardan sonra, "Next project"-dən əvvəl: "Planning something like <layihə>?" + "Start your project"
- [x] Düymə `/contact?project=<layihə>` açır — forma mesajı "I would like a project similar to <layihə>." ilə başlayır
- [x] Yanında WhatsApp (hazır mesajla, layihənin adı ilə), telefon, e-poçt (mövzuda layihə adı)

## 2. Telefonda aşağıda sabit panel: Enquire · WhatsApp · Call

- [x] Yalnız telefonda; bir az sürüşdürəndən sonra çıxır
- [x] Animasiya ekrandaykən, əlaqə formasında, footer-də və `/contact` səhifəsində gizlənir (Continue/Replay düymələrini və formanı örtmür)
- [x] Layihə səhifəsində Enquire və WhatsApp mesajı layihənin adını daşıyır
- [x] Admin → Site content → Contact → **WhatsApp** xanası (yanlış format rədd olunur); boşdursa WhatsApp düyməsi görünmür
- [x] Footer-ə də WhatsApp linki; telefon linklərindəki "(0)" xətası düzəldildi (`tel:+44079…` → `tel:+4479…`)

## 5. Xidmət səhifələrində uyğun layihələr

- [x] Xidmət səhifəsində "Selected work — <xidmət> in our projects": 3 layihə kartı (seçilmişlər öndə)
- [x] Admin → layihə → **Services** çekbox siyahısı. Heç biri seçilməyibsə, layihə kateqoriyasına görə avtomatik: Interior → Interior Design + Furniture & FF&E; Exterior → Architecture & Landscaping; 3D Animation → 3D Animation; hamısı → 3D Visualisation
- [x] Uyğun layihə yoxdursa (məs. 360 & VR) bölmə görünmür

Sınaq: yerli test bazası ilə admin (WhatsApp saxlama/yanlış format, layihəyə xidmət seçmə) → xidmət səhifələri, layihə bloku, forma doldurulması, telefonda panelin görünüb-gizlənməsi (animasiyalı və animasiyasız layihə, footer, contact, ana səhifə); JS xətası yoxdur.
